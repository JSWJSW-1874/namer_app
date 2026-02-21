'use client';

// /results — post-recording results page
// This is navigated to from the day page after completing a recording.
// Reads results from URL search params or session storage.
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import MLRDisplay from '@/components/metrics/MLRDisplay';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const recordingId = searchParams.get('id');
  const dayNumber = parseInt(searchParams.get('day') ?? '0', 10);

  const [recording, setRecording] = useState<{
    mlr: number;
    transcript: string;
    mid_clause_pauses: number;
    juncture_pauses: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!recordingId) {
      router.push('/dashboard');
      return;
    }

    fetch(`/api/recordings/${recordingId}`)
      .then((r) => r.json())
      .then((data) => {
        setRecording(data);
        setLoading(false);
      })
      .catch(() => {
        router.push('/dashboard');
      });
  }, [recordingId, router]);

  if (loading) return <LoadingState />;
  if (!recording) return null;

  return (
    <main className="min-h-screen max-w-xl mx-auto px-6 py-12 space-y-8">
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Results — Day {dayNumber}</p>
        <h1 className="text-2xl font-bold text-slate-900">Your recording.</h1>
      </div>

      <Card padding="lg">
        <MLRDisplay mlr={recording.mlr} />
      </Card>

      <Button onClick={() => router.push('/dashboard')} className="w-full">
        Back to dashboard
      </Button>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ResultsContent />
    </Suspense>
  );
}
