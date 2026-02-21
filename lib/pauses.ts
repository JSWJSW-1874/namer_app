// lib/pauses.ts — Phase 1 Node.js rule-set for pause classification
// Classifies each pause as JUNCTURE (natural, between clauses) or
// MID_CLAUSE (the freeze — happening inside a phrase).
// Upgrade to Python/spaCy after beta validation.
import type { DeepgramWord, PauseClassification } from './types';

const JUNCTURE_ENDINGS = [
  '.', '?', '!', ',', ';', ':', '--', '—',
  'and', 'but', 'so', 'because', 'however', 'although', 'though',
  'which', 'that', 'who', 'when', 'where', 'if',
];

export function classifyPauses(
  words: DeepgramWord[],
  pauses: Array<{ afterWordIndex: number; durationMs: number }>
): PauseClassification[] {
  return pauses.map((pause) => {
    const wordBefore = words[pause.afterWordIndex];
    const wordAfter = words[pause.afterWordIndex + 1];
    const textBefore = wordBefore?.word.toLowerCase() ?? '';

    const isJuncture =
      textBefore.endsWith('.') ||
      textBefore.endsWith('?') ||
      textBefore.endsWith('!') ||
      textBefore.endsWith(',') ||
      JUNCTURE_ENDINGS.includes(textBefore);

    return {
      afterWordIndex: pause.afterWordIndex,
      durationMs: pause.durationMs,
      type: isJuncture ? 'JUNCTURE' : 'MID_CLAUSE',
      wordBefore: wordBefore?.word ?? '',
      wordAfter: wordAfter?.word ?? '',
    };
  });
}
