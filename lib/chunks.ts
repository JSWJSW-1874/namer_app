// lib/chunks.ts — chunk detection
// Chunks are high-frequency phrases taught in Jon's daily videos.
// When a student uses a taught chunk in their recording, it is highlighted.
// Only reward usage — never penalise absence.
import type { ChunkMatch } from './types';

// Grows as course progresses — add new chunks as taught in Jon's videos
export const TAUGHT_CHUNKS: Record<number, { phrase: string; followedBy: string }> = {
  2: { phrase: 'the thing about', followedBy: 'is' },
  // Days 3–28: add chunks here as each video is recorded and reviewed
  // Example format:
  // 3: { phrase: 'what I find interesting', followedBy: 'is' },
  // 4: { phrase: 'to be honest', followedBy: '' },
};

export function detectChunks(transcript: string, dayNumber: number): ChunkMatch[] {
  const lower = transcript.toLowerCase();
  const matches: ChunkMatch[] = [];

  for (const [dayStr, chunk] of Object.entries(TAUGHT_CHUNKS)) {
    const day = parseInt(dayStr, 10);
    if (day > dayNumber) continue;

    const idx = lower.indexOf(chunk.phrase);
    if (idx === -1) continue;

    // If followedBy is specified, check it appears within 8 words after the chunk
    if (chunk.followedBy) {
      const after = lower.slice(idx + chunk.phrase.length, idx + chunk.phrase.length + 60);
      const nearbyWords = after.split(/\s+/).slice(0, 8);
      if (!nearbyWords.some((w) => w.startsWith(chunk.followedBy))) continue;
    }

    matches.push({ day, phrase: chunk.phrase, position: idx });
  }

  return matches;
}
