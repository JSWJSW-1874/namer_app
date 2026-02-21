'use client';

// Displays audio level feedback while recording so the student knows the mic is working.
import { useEffect, useRef, useState } from 'react';

interface AudioQualityCheckProps {
  stream: MediaStream | null;
}

export default function AudioQualityCheck({ stream }: AudioQualityCheckProps) {
  const [level, setLevel] = useState(0);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!stream) return;

    const ctx = new AudioContext();
    const source = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;

    const data = new Uint8Array(analyser.frequencyBinCount);

    const tick = () => {
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((s, v) => s + v, 0) / data.length;
      setLevel(avg);
      animFrameRef.current = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      ctx.close();
    };
  }, [stream]);

  const bars = Array.from({ length: 5 }, (_, i) => {
    const threshold = (i + 1) * 10;
    return level > threshold;
  });

  return (
    <div className="flex items-center gap-1">
      {bars.map((active, i) => (
        <div
          key={i}
          className={`w-1.5 rounded-full transition-all duration-75 ${active ? 'bg-emerald-500' : 'bg-slate-200'}`}
          style={{ height: `${(i + 1) * 4 + 4}px` }}
        />
      ))}
      <span className="ml-2 text-xs text-slate-500">
        {level < 5 ? 'No signal — check your mic' : level < 20 ? 'Quiet — speak up a little' : 'Good'}
      </span>
    </div>
  );
}
