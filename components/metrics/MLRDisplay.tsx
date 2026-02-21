'use client';

import { mlrContext, formatMLR } from '@/lib/recording';

interface MLRDisplayProps {
  mlr: number;
  label?: string;
  size?: 'sm' | 'lg';
  showContext?: boolean;
}

export default function MLRDisplay({ mlr, label, size = 'lg', showContext = true }: MLRDisplayProps) {
  return (
    <div className="space-y-1">
      {label && <p className="text-xs text-slate-500 uppercase tracking-wide">{label}</p>}
      <div className={`font-bold tabular-nums ${size === 'lg' ? 'text-6xl' : 'text-3xl'} text-slate-900`}>
        {formatMLR(mlr)}
      </div>
      <p className="text-sm text-slate-500">
        {size === 'lg' ? "That's your number." : ''} Average syllables between pauses.
      </p>
      {showContext && size === 'lg' && (
        <p className="text-base text-slate-700 mt-2">{mlrContext(mlr)}</p>
      )}
    </div>
  );
}
