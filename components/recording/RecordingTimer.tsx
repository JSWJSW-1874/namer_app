'use client';

import { useEffect, useState } from 'react';

interface RecordingTimerProps {
  isRecording: boolean;
  maxMs: number;
  onTimeout: () => void;
}

export default function RecordingTimer({ isRecording, maxMs, onTimeout }: RecordingTimerProps) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (!isRecording) {
      setElapsedMs(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedMs((prev) => {
        const next = prev + 100;
        if (next >= maxMs) {
          onTimeout();
          return maxMs;
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isRecording, maxMs, onTimeout]);

  const seconds = Math.floor(elapsedMs / 1000);
  const maxSeconds = Math.floor(maxMs / 1000);
  const progress = (elapsedMs / maxMs) * 100;
  const isNearEnd = elapsedMs > maxMs * 0.8;

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-sm">
        <span className={`font-mono font-medium ${isNearEnd ? 'text-amber-600' : 'text-slate-700'}`}>
          {seconds}s
        </span>
        <span className="text-slate-400">{maxSeconds}s max</span>
      </div>
      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-100 ${
            isNearEnd ? 'bg-amber-500' : 'bg-slate-900'
          }`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
