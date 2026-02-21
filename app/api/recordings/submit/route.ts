// POST /api/recordings/submit
// Orchestrates the full audio pipeline:
// validate → upload to storage → transcribe → calculate MLR →
// classify pauses → detect chunks → write to database → return results
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { transcribeAudio } from '@/lib/deepgram';
import { calculateMLR, countFillerWords } from '@/lib/mlr';
import { classifyPauses } from '@/lib/pauses';
import { detectChunks } from '@/lib/chunks';
import { getDisplayConfig } from '@/lib/types';
import type { RecordingSubmitResult } from '@/lib/types';

const MAX_MS = parseInt(process.env.RECORDING_MAX_MS ?? '90000', 10);
const MIN_MS = parseInt(process.env.RECORDING_MIN_MS ?? '20000', 10);

export async function POST(req: NextRequest) {
  try {
    const supabase = createServerClient();

    // 1. Parse multipart form
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File | null;
    const mimeType = formData.get('mimeType') as string | null;
    const studentId = formData.get('studentId') as string | null;
    const dayNumber = parseInt(formData.get('dayNumber') as string ?? '0', 10);
    const takeType = formData.get('takeType') as string ?? 'cold';
    const extension = formData.get('extension') as string ?? 'webm';

    if (!audioFile || !mimeType || !studentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Convert to buffer
    const arrayBuffer = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // 3. Check duration is within bounds (estimated from file size — confirmed after transcription)
    // Actual duration is returned by Deepgram

    // 4. Upload to Supabase Storage BEFORE any analysis
    // If Deepgram fails, we still have the audio and can retry without re-recording
    const timestamp = Date.now();
    const storagePath = `recordings/${studentId}/${dayNumber}/${takeType}/${timestamp}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from('recordings')
      .upload(storagePath, audioBuffer, { contentType: mimeType });

    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload audio' }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from('recordings').getPublicUrl(storagePath);
    const audioUrl = urlData.publicUrl;

    // 5. Call Deepgram Nova-2 with correct Content-Type header
    let transcribeResult;
    try {
      transcribeResult = await transcribeAudio(audioBuffer, mimeType);
    } catch (err) {
      console.error('Deepgram error:', err);
      return NextResponse.json({ error: 'Transcription failed. Please try again.' }, { status: 502 });
    }

    const { transcript, words, confidence, rawResult } = transcribeResult;

    if (!words.length) {
      return NextResponse.json(
        { error: 'The recording was hard to hear — somewhere quieter would help. Want to try again?' },
        { status: 422 }
      );
    }

    // 6. Calculate MLR from word timestamps
    const pauseThresholdMs = parseInt(process.env.MLR_PAUSE_THRESHOLD_MS ?? '250', 10);
    const minRunSyllables = parseInt(process.env.MLR_MIN_RUN_SYLLABLES ?? '3', 10);
    const mlrResult = calculateMLR(words, pauseThresholdMs, minRunSyllables);

    // Validate duration
    if (mlrResult.durationMs < MIN_MS || mlrResult.durationMs > MAX_MS) {
      console.warn(`Duration out of bounds: ${mlrResult.durationMs}ms`);
    }

    // 7. Classify pauses
    const pauseClassifications = classifyPauses(words, mlrResult.pauses);
    const midClausePauses = pauseClassifications.filter((p) => p.type === 'MID_CLAUSE').length;
    const juncturePauses = pauseClassifications.filter((p) => p.type === 'JUNCTURE').length;

    // 8. Detect chunk matches
    const chunkMatches = detectChunks(transcript, dayNumber);

    // Count filler words
    const fillerWordCount = countFillerWords(words);

    // Determine if this is the baseline recording
    const isBaseline = dayNumber === 0 && takeType === 'cold';

    // 9. Write recording record to database
    const { data: recordingData, error: recordingError } = await supabase
      .from('recordings')
      .insert({
        student_id: studentId,
        day_number: dayNumber,
        take_type: takeType,
        audio_url: audioUrl,
        transcript,
        transcript_json: rawResult,
        mlr: mlrResult.mlr,
        run_count: mlrResult.runCount,
        total_syllables: mlrResult.totalSyllables,
        mid_clause_pauses: midClausePauses,
        juncture_pauses: juncturePauses,
        pause_classifications: pauseClassifications,
        speech_rate_spm: mlrResult.speechRateSpm,
        filler_word_count: fillerWordCount,
        chunk_matches: chunkMatches,
        duration_ms: mlrResult.durationMs,
        deepgram_confidence: confidence,
        is_baseline: isBaseline,
      })
      .select()
      .single();

    if (recordingError) {
      console.error('DB insert error:', recordingError);
      return NextResponse.json({ error: 'Failed to save recording' }, { status: 500 });
    }

    // 10. Update daily_progress record
    const isCold = takeType === 'cold';
    const isHot = takeType === 'hot';

    const { error: progressError } = await supabase
      .from('daily_progress')
      .upsert(
        {
          student_id: studentId,
          day_number: dayNumber,
          ...(isCold ? { cold_take_mlr: mlrResult.mlr } : {}),
          ...(isHot ? { hot_take_mlr: mlrResult.mlr } : {}),
          completed_at: isHot ? new Date().toISOString() : undefined,
        },
        { onConflict: 'student_id,day_number' }
      );

    if (progressError) {
      console.error('Progress update error:', progressError);
      // Non-fatal — recording is saved, progress update can be retried
    }

    // Calculate cold_hot_delta if both takes exist
    if (isHot) {
      const { data: progressRow } = await supabase
        .from('daily_progress')
        .select('cold_take_mlr, hot_take_mlr')
        .eq('student_id', studentId)
        .eq('day_number', dayNumber)
        .single();

      if (progressRow?.cold_take_mlr && progressRow?.hot_take_mlr) {
        await supabase
          .from('daily_progress')
          .update({ cold_hot_delta: progressRow.hot_take_mlr - progressRow.cold_take_mlr })
          .eq('student_id', studentId)
          .eq('day_number', dayNumber);
      }
    }

    // Update user if Day 0 baseline
    if (isBaseline) {
      await supabase
        .from('users')
        .update({ day0_completed: true, day0_mlr: mlrResult.mlr })
        .eq('id', studentId);
    }

    // 11. Fetch comparison data
    const { data: baselineRow } = await supabase
      .from('recordings')
      .select('mlr')
      .eq('student_id', studentId)
      .eq('is_baseline', true)
      .single();

    const { data: yesterdayRow } = await supabase
      .from('daily_progress')
      .select('cold_take_mlr')
      .eq('student_id', studentId)
      .eq('day_number', dayNumber - 1)
      .single();

    const { data: trendRows } = await supabase
      .from('daily_progress')
      .select('day_number, cold_take_mlr')
      .eq('student_id', studentId)
      .order('day_number', { ascending: true });

    const trend = (trendRows ?? [])
      .filter((r) => r.cold_take_mlr !== null)
      .map((r) => ({ day: r.day_number, mlr: r.cold_take_mlr as number }));

    // 12. Return structured results
    const result: RecordingSubmitResult = {
      recording: {
        id: recordingData.id,
        studentId: recordingData.student_id,
        dayNumber: recordingData.day_number,
        takeType: recordingData.take_type as RecordingSubmitResult['recording']['takeType'],
        audioUrl: recordingData.audio_url,
        transcript: recordingData.transcript ?? '',
        transcriptJson: recordingData.transcript_json ?? {},
        mlr: recordingData.mlr,
        runCount: recordingData.run_count,
        totalSyllables: recordingData.total_syllables,
        midClausePauses: recordingData.mid_clause_pauses,
        juncturePauses: recordingData.juncture_pauses,
        pauseClassifications: recordingData.pause_classifications ?? [],
        speechRateSpm: recordingData.speech_rate_spm,
        fillerWordCount: recordingData.filler_word_count,
        chunkMatches: recordingData.chunk_matches ?? [],
        durationMs: recordingData.duration_ms,
        deepgramConfidence: recordingData.deepgram_confidence,
        isBaseline: recordingData.is_baseline,
        createdAt: recordingData.created_at,
      },
      comparisons: {
        vsYesterday: yesterdayRow?.cold_take_mlr
          ? mlrResult.mlr - yesterdayRow.cold_take_mlr
          : null,
        vsBaseline: baselineRow?.mlr ? mlrResult.mlr - baselineRow.mlr : null,
        baselineMlr: baselineRow?.mlr ?? null,
      },
      trend,
      displayConfig: getDisplayConfig(dayNumber),
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('Unexpected error in /api/recordings/submit:', err);
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
