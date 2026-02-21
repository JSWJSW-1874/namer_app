// POST /api/analysis/mlr
// Standalone MLR calculation endpoint — accepts a Deepgram words array
// and returns the MLR result. Useful for client-side previews and testing.
import { NextRequest, NextResponse } from 'next/server';
import { calculateMLR } from '@/lib/mlr';
import { classifyPauses } from '@/lib/pauses';
import type { DeepgramWord } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const words: DeepgramWord[] = body.words;
    const pauseThresholdMs = body.pauseThresholdMs ?? 250;
    const minRunSyllables = body.minRunSyllables ?? 3;

    if (!Array.isArray(words) || !words.length) {
      return NextResponse.json({ error: 'words array is required' }, { status: 400 });
    }

    const mlrResult = calculateMLR(words, pauseThresholdMs, minRunSyllables);
    const pauseClassifications = classifyPauses(words, mlrResult.pauses);

    return NextResponse.json({
      ...mlrResult,
      pauseClassifications,
    });
  } catch (err) {
    console.error('MLR analysis error:', err);
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
  }
}
