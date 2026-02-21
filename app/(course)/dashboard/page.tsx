'use client';

// 28-day progress dashboard — shows trend graph, streak, days completed.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import MLRTrendGraph from '@/components/metrics/MLRTrendGraph';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';

interface ProgressData {
  trend: Array<{ day: number; coldMlr: number; hotMlr: number | null; completedAt: string | null }>;
  baselineMlr: number | null;
  currentStreak: number;
  daysCompleted: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [nextDay, setNextDay] = useState(1);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push('/login');
        return;
      }

      const uid = data.session.user.id;
      setUserId(uid);

      // Fetch progress
      const res = await fetch(`/api/progress?studentId=${uid}`);
      if (res.ok) {
        const data = await res.json();
        setProgress(data);

        // Determine next day
        const completed = data.trend
          .filter((t: { completedAt: string | null }) => t.completedAt)
          .map((t: { day: number }) => t.day);
        const lastCompleted = completed.length ? Math.max(...completed) : 0;
        setNextDay(Math.min(lastCompleted + 1, 28));
      }

      setLoading(false);
    });
  }, [router]);

  if (loading) return <LoadingState />;
  if (!userId) return null;

  const trendPoints = progress?.trend
    .filter((t) => t.coldMlr !== null)
    .map((t) => ({ day: t.day, mlr: t.coldMlr })) ?? [];

  return (
    <main className="min-h-screen max-w-xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Your progress</p>
          <h1 className="text-2xl font-bold text-slate-900">The Speaking KickStart</h1>
        </div>
        <Link href="/" className="text-xs text-slate-400 hover:text-slate-600">jonweaver.by</Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-slate-900 tabular-nums">
            {progress?.daysCompleted ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Days done</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-slate-900 tabular-nums">
            {progress?.currentStreak ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Day streak</p>
        </Card>
        <Card padding="sm" className="text-center">
          <p className="text-2xl font-bold text-slate-900 tabular-nums">
            {progress?.baselineMlr?.toFixed(1) ?? '—'}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Baseline MLR</p>
        </Card>
      </div>

      {/* Next day CTA */}
      <Card className="border-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-900">Day {nextDay}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {nextDay <= 28 ? "Ready when you are." : "Course complete. Well done."}
            </p>
          </div>
          {nextDay <= 28 && (
            <Button onClick={() => router.push(`/day/${nextDay}`)}>
              Start Day {nextDay}
            </Button>
          )}
        </div>
      </Card>

      {/* Trend graph */}
      {trendPoints.length > 1 && (
        <Card>
          <MLRTrendGraph
            trend={trendPoints}
            baselineMlr={progress?.baselineMlr ?? null}
          />
        </Card>
      )}

      {/* Day list */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wide">All days</p>
        <div className="space-y-1">
          {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => {
            const dayProgress = progress?.trend.find((t) => t.day === day);
            const isDone = !!dayProgress?.completedAt;
            const mlr = dayProgress?.coldMlr;

            return (
              <Link
                key={day}
                href={`/day/${day}`}
                className={`flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors ${isDone ? 'opacity-100' : 'opacity-60'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isDone ? 'bg-slate-900' : 'bg-slate-200'}`} />
                  <span className="text-sm text-slate-700">Day {day}</span>
                </div>
                {mlr !== undefined && mlr !== null && (
                  <span className="text-sm font-medium text-slate-900 tabular-nums">
                    {mlr.toFixed(1)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
