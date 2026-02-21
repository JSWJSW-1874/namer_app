'use client';

// 28-day trend graph — shows cold take MLR over time.
// Not displayed until Day 2 (displayConfig.showTrendGraph).

interface TrendPoint {
  day: number;
  mlr: number;
}

interface MLRTrendGraphProps {
  trend: TrendPoint[];
  baselineMlr: number | null;
}

export default function MLRTrendGraph({ trend, baselineMlr }: MLRTrendGraphProps) {
  if (!trend.length) return null;

  const allValues = [
    ...trend.map((p) => p.mlr),
    ...(baselineMlr ? [baselineMlr] : []),
  ];
  const min = Math.max(0, Math.min(...allValues) - 2);
  const max = Math.max(...allValues) + 2;
  const range = max - min;

  const width = 600;
  const height = 200;
  const padX = 40;
  const padY = 20;

  const toX = (day: number) => padX + ((day - 1) / 27) * (width - padX * 2);
  const toY = (mlr: number) => padY + (1 - (mlr - min) / range) * (height - padY * 2);

  const points = trend.map((p) => `${toX(p.day)},${toY(p.mlr)}`).join(' ');

  return (
    <div className="w-full">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-3">28-day trend</p>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label="MLR trend over 28 days"
      >
        {/* Baseline reference line */}
        {baselineMlr && (
          <line
            x1={padX}
            y1={toY(baselineMlr)}
            x2={width - padX}
            y2={toY(baselineMlr)}
            stroke="#e2e8f0"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        )}

        {/* Trend line */}
        {trend.length > 1 && (
          <polyline
            points={points}
            fill="none"
            stroke="#0f172a"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        )}

        {/* Data points */}
        {trend.map((p) => (
          <circle
            key={p.day}
            cx={toX(p.day)}
            cy={toY(p.mlr)}
            r="4"
            fill="#0f172a"
          />
        ))}

        {/* Y-axis labels */}
        {[min, (min + max) / 2, max].map((v) => (
          <text
            key={v}
            x={padX - 6}
            y={toY(v) + 4}
            textAnchor="end"
            fontSize="10"
            fill="#94a3b8"
          >
            {v.toFixed(0)}
          </text>
        ))}
      </svg>

      {baselineMlr && (
        <p className="text-xs text-slate-400 mt-1">Dashed line = Day 0 baseline ({baselineMlr.toFixed(1)})</p>
      )}
    </div>
  );
}
