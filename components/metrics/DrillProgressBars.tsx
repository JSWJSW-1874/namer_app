'use client';

// Week 1 (Days 1–7) — shows MLR for each drill take side by side.
// The 3/2/1 drill produces three bars showing how automaticity improves under pressure.

interface DrillProgressBarsProps {
  takes: Array<{ label: string; mlr: number | null }>;
}

export default function DrillProgressBars({ takes }: DrillProgressBarsProps) {
  const maxMlr = Math.max(...takes.filter((t) => t.mlr !== null).map((t) => t.mlr!), 20);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 uppercase tracking-wide">Drill progression</p>
      {takes.map((take) => (
        <div key={take.label} className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-600">{take.label}</span>
            <span className="text-sm font-medium text-slate-900 tabular-nums">
              {take.mlr !== null ? take.mlr.toFixed(1) : '—'}
            </span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-900 rounded-full transition-all duration-500"
              style={{ width: take.mlr !== null ? `${(take.mlr / maxMlr) * 100}%` : '0%' }}
            />
          </div>
        </div>
      ))}
      <p className="text-xs text-slate-400">
        The third take is almost always more fluent. That gap is automaticity becoming visible.
      </p>
    </div>
  );
}
