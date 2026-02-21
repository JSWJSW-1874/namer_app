'use client';

// Day 0 — Free diagnostic. Completely ungated (beyond registration).
// One recording. One MLR number. One conversion prompt.
// No retakes. No pause location. No trend. One number only.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import RecordingButton from '@/components/recording/RecordingButton';
import MLRDisplay from '@/components/metrics/MLRDisplay';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import { getDayContent } from '@/lib/course-content';
import { mlrContext } from '@/lib/recording';
import type { RecordingSubmitResult } from '@/lib/types';

const CONTENT = getDayContent(0)!;

// Benchmark comparison data — from mlr_benchmarks table (hardcoded for beta)
const BETA_BENCHMARKS = {
  b1Mean: 10.8,
  b2Mean: 16.2,
  courseGainPct: 12,
};

export default function Day0Page() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<RecordingSubmitResult | null>(null);
  const [hasRecorded, setHasRecorded] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push('/signup');
        return;
      }

      setUserId(data.session.user.id);

      // Check if Day 0 already completed — show results if so
      const { data: user } = await supabase
        .from('users')
        .select('day0_completed, day0_mlr')
        .eq('id', data.session.user.id)
        .single();

      if (user?.day0_completed && user?.day0_mlr) {
        // Show a simplified already-completed view
        setHasRecorded(true);
      }

      setLoading(false);
    });
  }, [router]);

  const handleRecordingComplete = (recordingResult: RecordingSubmitResult) => {
    setResult(recordingResult);
    setHasRecorded(true);

    // Trigger Day 0 follow-up email after 1 hour (scheduled via cron or client-side)
    // The actual scheduling happens server-side — this just records completion
  };

  if (loading) return <LoadingState message="Getting everything ready..." />;

  if (!userId) return null;

  return (
    <main className="min-h-screen max-w-xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Day 0</p>
        <h1 className="text-2xl font-bold text-slate-900">{CONTENT.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{CONTENT.subtitle}</p>
      </div>

      {/* Results view */}
      {result && (
        <div className="space-y-8">
          <Card padding="lg">
            <MLRDisplay mlr={result.recording.mlr} showContext />
          </Card>

          {/* Benchmark bar */}
          <Card>
            <BenchmarkBar mlr={result.recording.mlr} />
          </Card>

          {/* Conversion prompt */}
          <Card className="border-slate-900">
            <div className="space-y-4">
              <p className="text-slate-700 leading-relaxed">
                That is your baseline. Students who complete the 28-day sprint typically move from a score like yours to{' '}
                <strong>
                  {(result.recording.mlr * (1 + BETA_BENCHMARKS.courseGainPct / 100)).toFixed(1)}–
                  {(result.recording.mlr * (1 + (BETA_BENCHMARKS.courseGainPct + 5) / 100)).toFixed(1)}
                </strong>{' '}
                over the course.
              </p>
              <p className="text-slate-600 text-sm">Day 1 starts when you&apos;re ready.</p>
              <Button size="lg" className="w-full" onClick={() => router.push('/day/1')}>
                Start Day 1
              </Button>
              <p className="text-xs text-slate-400 text-center">
                Paid course — ~50 BYN / $15 USD. Payment via message for beta cohort.
              </p>
            </div>
          </Card>
        </div>
      )}

      {/* Already recorded but no in-session result */}
      {hasRecorded && !result && (
        <Card className="text-center space-y-4">
          <p className="text-slate-700">
            You have already recorded your Day 0 baseline. Check your dashboard to see your progress.
          </p>
          <Button onClick={() => router.push('/dashboard')}>Go to dashboard</Button>
        </Card>
      )}

      {/* Recording view */}
      {!hasRecorded && (
        <div className="space-y-6">
          <Card>
            <div className="space-y-3">
              <p className="text-sm font-medium text-slate-700">Your prompt:</p>
              <p className="text-slate-700 leading-relaxed">{CONTENT.coldTakePrompt}</p>
              <p className="text-xs text-slate-400">60 seconds maximum. One take — no retakes.</p>
            </div>
          </Card>

          <RecordingButton
            studentId={userId}
            dayNumber={0}
            takeType="cold"
            maxMs={60000}
            prompt={CONTENT.coldTakePrompt}
            onComplete={handleRecordingComplete}
          />
        </div>
      )}
    </main>
  );
}

function BenchmarkBar({ mlr }: { mlr: number }) {
  const min = 6;
  const max = 22;
  const position = Math.min(Math.max(((mlr - min) / (max - min)) * 100, 2), 98);

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 uppercase tracking-wide">Where you sit</p>
      <div className="relative">
        <div className="h-3 bg-gradient-to-r from-slate-200 via-slate-400 to-slate-700 rounded-full" />
        <div
          className="absolute top-0 w-3 h-3 bg-white border-2 border-slate-900 rounded-full -translate-x-1/2 shadow"
          style={{ left: `${position}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-400">
        <span>B1 entry (~9)</span>
        <span>B2 target (~16)</span>
        <span>Advanced (~20+)</span>
      </div>
      <p className="text-sm text-slate-600">{mlrContext(mlr)}</p>
    </div>
  );
}
