'use client';

import type { PauseClassification } from '@/lib/types';

interface PauseAnnotationProps {
  midClausePauses: number;
  juncturePauses: number;
  pauseClassifications: PauseClassification[];
  previousMidClause?: number | null;
}

export default function PauseAnnotation({
  midClausePauses,
  juncturePauses,
  pauseClassifications: _pauseClassifications,
  previousMidClause,
}: PauseAnnotationProps) {
  const total = midClausePauses + juncturePauses;

  const delta = previousMidClause !== null && previousMidClause !== undefined
    ? midClausePauses - previousMidClause
    : null;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 uppercase tracking-wide">Pause breakdown</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-50 rounded-lg p-3 space-y-1">
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{juncturePauses}</p>
          <p className="text-xs text-slate-500">Juncture pauses</p>
          <p className="text-xs text-emerald-600">Natural — between clauses</p>
        </div>
        <div className="bg-slate-50 rounded-lg p-3 space-y-1">
          <p className="text-2xl font-bold text-slate-900 tabular-nums">{midClausePauses}</p>
          <p className="text-xs text-slate-500">Mid-clause pauses</p>
          <p className="text-xs text-amber-600">The freeze — inside a phrase</p>
          {delta !== null && (
            <p className={`text-xs font-medium ${delta < 0 ? 'text-emerald-600' : delta > 0 ? 'text-amber-600' : 'text-slate-400'}`}>
              {delta < 0 ? `${Math.abs(delta)} fewer than yesterday` : delta > 0 ? `${delta} more than yesterday` : 'Same as yesterday'}
            </p>
          )}
        </div>
      </div>
      {total > 0 && (
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-400 transition-all duration-500"
            style={{ width: `${(juncturePauses / total) * 100}%` }}
          />
          <div
            className="h-full bg-amber-400 transition-all duration-500"
            style={{ width: `${(midClausePauses / total) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
