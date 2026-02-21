// lib/deepgram.ts — Deepgram API wrapper
// Uses Nova-2 model with word-level timestamps (required for MLR calculation)
import { createClient } from '@deepgram/sdk';
import type { DeepgramWord } from './types';

// Lazy initialization — avoids build-time failure when env var is absent
let _client: ReturnType<typeof createClient> | null = null;
function getDeepgramClient() {
  if (!_client) _client = createClient(process.env.DEEPGRAM_API_KEY!);
  return _client;
}

export interface TranscribeResult {
  transcript: string;
  words: DeepgramWord[];
  confidence: number;
  rawResult: object;
}

export async function transcribeAudio(
  audioBuffer: Buffer,
  mimeType: string
): Promise<TranscribeResult> {
  const { result, error } = await getDeepgramClient().listen.prerecorded.transcribeFile(
    audioBuffer,
    {
      model: 'nova-2',
      punctuate: true,
      utterances: true,
      words: true,       // REQUIRED — word-level timestamps for MLR
      language: 'en',
      mimetype: mimeType, // Pass correct format for iOS compatibility
    }
  );

  if (error) throw error;

  const alternative = result.results.channels[0].alternatives[0];

  return {
    transcript: alternative.transcript,
    words: (alternative.words ?? []) as DeepgramWord[],
    confidence: alternative.confidence ?? 0,
    rawResult: result as object,
  };
}
