'use client';

import type { ChunkMatch, PauseClassification } from '@/lib/types';

interface TranscriptViewerProps {
  transcript: string;
  chunkMatches?: ChunkMatch[];
  pauseClassifications?: PauseClassification[];
  showChunks?: boolean;
}

export default function TranscriptViewer({
  transcript,
  chunkMatches = [],
  showChunks = true,
}: TranscriptViewerProps) {
  if (!transcript) return null;

  // Highlight chunk matches in the transcript
  let displayText = transcript;
  const highlights: Array<{ start: number; end: number; phrase: string }> = [];

  if (showChunks) {
    for (const match of chunkMatches) {
      const lower = displayText.toLowerCase();
      const idx = lower.indexOf(match.phrase);
      if (idx !== -1) {
        highlights.push({ start: idx, end: idx + match.phrase.length, phrase: match.phrase });
      }
    }
  }

  if (!highlights.length) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wide">Your transcript</p>
        <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 rounded-lg p-4">{transcript}</p>
      </div>
    );
  }

  // Build segments with highlights
  highlights.sort((a, b) => a.start - b.start);
  const segments: Array<{ text: string; highlighted: boolean; phrase?: string }> = [];
  let cursor = 0;

  for (const h of highlights) {
    if (cursor < h.start) segments.push({ text: displayText.slice(cursor, h.start), highlighted: false });
    segments.push({ text: displayText.slice(h.start, h.end), highlighted: true, phrase: h.phrase });
    cursor = h.end;
  }
  if (cursor < displayText.length) segments.push({ text: displayText.slice(cursor), highlighted: false });

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-500 uppercase tracking-wide">Your transcript</p>
      {chunkMatches.length > 0 && showChunks && (
        <p className="text-xs text-emerald-600">
          Highlighted phrases are chunks you have been trained on — using them is a win.
        </p>
      )}
      <p className="text-slate-700 leading-relaxed text-sm bg-slate-50 rounded-lg p-4">
        {segments.map((seg, i) =>
          seg.highlighted ? (
            <mark key={i} className="bg-emerald-100 text-emerald-900 rounded px-0.5" title={`Chunk from Day ${chunkMatches.find(m => m.phrase === seg.phrase)?.day}`}>
              {seg.text}
            </mark>
          ) : (
            <span key={i}>{seg.text}</span>
          )
        )}
      </p>
    </div>
  );
}
