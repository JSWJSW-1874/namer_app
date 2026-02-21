// lib/mlr.ts — MLR (Mean Length of Run) calculation
// MLR = average syllables spoken between pauses of 250ms or longer
// It is the primary metric shown to students — a growth signal, not a classification tool
import { syllable } from 'syllable';
import type { DeepgramWord, MLRResult } from './types';

const FILLER_WORDS = new Set(['um', 'uh', 'er', 'ah', 'like', 'yeah', 'oh', 'hmm']);

export function calculateMLR(
  words: DeepgramWord[],
  pauseThresholdMs = 250,
  minRunSyllables = 3
): MLRResult {
  if (!words.length) throw new Error('No words in transcript');

  const runs: DeepgramWord[][] = [];
  const pauses: Array<{ afterWordIndex: number; durationMs: number }> = [];
  let current: DeepgramWord[] = [];

  for (let i = 0; i < words.length - 1; i++) {
    current.push(words[i]);
    const gapMs = (words[i + 1].start - words[i].end) * 1000;
    if (gapMs >= pauseThresholdMs) {
      runs.push(current);
      pauses.push({ afterWordIndex: i, durationMs: Math.round(gapMs) });
      current = [];
    }
  }
  if (words.length) current.push(words[words.length - 1]);
  if (current.length) runs.push(current);

  // Exclude micro-runs that are only filler words (um, uh, yeah, oh)
  const validRuns = runs.filter((run) => {
    const syls = run.reduce((s, w) => s + syllable(w.word), 0);
    return syls >= minRunSyllables;
  });

  const totalSyllables = validRuns.reduce(
    (t, run) => t + run.reduce((s, w) => s + syllable(w.word), 0),
    0
  );

  const durationMs = (words[words.length - 1].end - words[0].start) * 1000;
  const speechRateSpm = durationMs > 0 ? (totalSyllables / durationMs) * 60000 : 0;

  return {
    mlr: validRuns.length ? totalSyllables / validRuns.length : 0,
    runCount: validRuns.length,
    totalSyllables,
    runs: validRuns,
    pauses,
    speechRateSpm,
    durationMs,
  };
}

export function countFillerWords(words: DeepgramWord[]): number {
  return words.filter((w) => FILLER_WORDS.has(w.word.toLowerCase().replace(/[^a-z]/g, ''))).length;
}
