'use client';

// Main daily course page — /day/[day]
// Identical structure every day. Content varies. See Section 6.2 of spec.
// Steps: Jon Video → Cold Take → Metric Insight → Task → Hot Take → Results
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import JonVideo from '@/components/video/JonVideo';
import RecordingButton from '@/components/recording/RecordingButton';
import MLRDisplay from '@/components/metrics/MLRDisplay';
import MLRTrendGraph from '@/components/metrics/MLRTrendGraph';
import DrillProgressBars from '@/components/metrics/DrillProgressBars';
import PauseAnnotation from '@/components/metrics/PauseAnnotation';
import TranscriptViewer from '@/components/metrics/TranscriptViewer';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingState from '@/components/ui/LoadingState';
import { getDayContent } from '@/lib/course-content';
import type { RecordingSubmitResult } from '@/lib/types';

type Phase =
  | 'checking-auth'
  | 'video'
  | 'cold-take'
  | 'task'
  | 'hot-take'
  | 'results';

export default function DayPage() {
  const router = useRouter();
  const params = useParams();
  const dayNumber = parseInt(params.day as string, 10);

  const [userId, setUserId] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('checking-auth');
  const [videoWatched, setVideoWatched] = useState(false);
  const [coldResult, setColdResult] = useState<RecordingSubmitResult | null>(null);
  const [hotResult, setHotResult] = useState<RecordingSubmitResult | null>(null);
  const [drillResults, setDrillResults] = useState<(RecordingSubmitResult | null)[]>([null, null, null]);
  const [currentDrillTake, setCurrentDrillTake] = useState(0);

  const content = getDayContent(dayNumber);
  const isWeek1 = dayNumber >= 1 && dayNumber <= 7;

  useEffect(() => {
    if (isNaN(dayNumber) || dayNumber < 1 || dayNumber > 28 || !content) {
      router.push('/dashboard');
      return;
    }

    const supabase = createClient();
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) {
        router.push('/login');
        return;
      }

      // Paywall check — must have an enrollment
      const { data: enrollment } = await supabase
        .from('enrollments')
        .select('id')
        .eq('student_id', data.session.user.id)
        .limit(1)
        .single();

      if (!enrollment) {
        // Not enrolled — redirect to Day 0 or a paywall page
        router.push('/day0');
        return;
      }

      setUserId(data.session.user.id);

      // Day 13 and Day 20 are mandatory watch before cold take
      if (content.mustWatchBeforeColdTake) {
        setPhase('video');
      } else {
        setPhase('video'); // Always show video first — student can choose to record after
      }
    });
  }, [dayNumber, content, router, isWeek1]);

  const handleVideoWatched = useCallback(async () => {
    setVideoWatched(true);

    // Record in database
    if (userId) {
      const supabase = createClient();
      await supabase
        .from('daily_progress')
        .upsert(
          { student_id: userId, day_number: dayNumber, jon_video_watched: true },
          { onConflict: 'student_id,day_number' }
        );
    }
  }, [userId, dayNumber]);

  const handleColdTakeComplete = (result: RecordingSubmitResult) => {
    setColdResult(result);
    if (isWeek1) {
      setPhase('task'); // Go to 3/2/1 drill
    } else {
      setPhase('task'); // Go to week-specific task
    }
  };

  const handleDrillComplete = (result: RecordingSubmitResult, takeIndex: number) => {
    const updated = [...drillResults];
    updated[takeIndex] = result;
    setDrillResults(updated);

    if (takeIndex < 2) {
      setCurrentDrillTake(takeIndex + 1);
    } else {
      setPhase('hot-take');
    }
  };

  const handleHotTakeComplete = (result: RecordingSubmitResult) => {
    setHotResult(result);
    setPhase('results');

    // Trigger Day 13 complete email
    if (dayNumber === 13 && userId) {
      fetch('/api/emails/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'day13_complete', studentId: userId }),
      });
    }

    // Trigger Day 28 complete email
    if (dayNumber === 28 && userId) {
      fetch('/api/emails/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'day28_complete', studentId: userId }),
      });
    }
  };

  if (phase === 'checking-auth' || !userId || !content) {
    return <LoadingState />;
  }

  const displayConfig = coldResult?.displayConfig ?? hotResult?.displayConfig;
  const latestResult = hotResult ?? coldResult;

  return (
    <main className="min-h-screen max-w-xl mx-auto px-6 py-12 space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Day {dayNumber}</p>
        <h1 className="text-2xl font-bold text-slate-900">{content.title}</h1>
        <p className="text-slate-500 text-sm mt-1">{content.subtitle}</p>
      </div>

      {/* Step 1 — Jon Video */}
      {(phase === 'video' || phase === 'cold-take' || phase === 'task' || phase === 'hot-take' || phase === 'results') && (
        <Card>
          <JonVideo
            vimeoId={content.jonVideoId}
            dayNumber={dayNumber}
            onWatched={handleVideoWatched}
            mustWatchBeforeColdTake={content.mustWatchBeforeColdTake}
          />
          {phase === 'video' && (
            <div className="mt-4">
              {content.mustWatchBeforeColdTake && !videoWatched ? (
                <p className="text-sm text-amber-600">Watch the video above before recording.</p>
              ) : (
                <Button
                  onClick={() => setPhase('cold-take')}
                  variant={videoWatched ? 'primary' : 'secondary'}
                  className="mt-2"
                >
                  {videoWatched ? 'Record cold take' : 'Skip to cold take'}
                </Button>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Step 2 — Cold Take */}
      {phase === 'cold-take' && (
        <Card>
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-700">Cold take</p>
            <p className="text-xs text-slate-500">No preparation. Record now.</p>
            <RecordingButton
              studentId={userId}
              dayNumber={dayNumber}
              takeType="cold"
              maxMs={60000}
              prompt={content.coldTakePrompt}
              onComplete={handleColdTakeComplete}
            />
          </div>
        </Card>
      )}

      {/* Metric insight after cold take */}
      {coldResult && phase !== 'cold-take' && (
        <Card>
          <div className="space-y-2">
            <p className="text-xs text-slate-500 uppercase tracking-wide">Cold take</p>
            <MLRDisplay mlr={coldResult.recording.mlr} size="sm" showContext={false} />
            {coldResult.comparisons.vsYesterday !== null && (
              <p className="text-sm text-slate-600">
                {coldResult.comparisons.vsYesterday > 0
                  ? `+${coldResult.comparisons.vsYesterday.toFixed(1)} vs yesterday`
                  : coldResult.comparisons.vsYesterday < 0
                  ? `${coldResult.comparisons.vsYesterday.toFixed(1)} vs yesterday`
                  : 'Same as yesterday'}
              </p>
            )}
          </div>
        </Card>
      )}

      {/* Step 3 — Task (Week 1: 3/2/1 drill) */}
      {phase === 'task' && isWeek1 && (
        <Card>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700">3/2/1 Drill</p>
              <p className="text-xs text-slate-500 mt-1">
                Record the same content three times. The third take is almost always more fluent.
                That gap is automaticity.
              </p>
            </div>

            {(['drill1', 'drill2', 'drill3'] as const).map((takeType, i) => {
              const timeLimits = [180000, 120000, 60000];
              const labels = ['3 minutes', '2 minutes', '1 minute'];
              const isDone = drillResults[i] !== null;
              const isActive = currentDrillTake === i && !isDone;

              return (
                <div key={takeType} className={`p-4 rounded-lg ${isDone ? 'bg-slate-50' : isActive ? 'bg-white border border-slate-200' : 'opacity-40'}`}>
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Take {i + 1} — {labels[i]}
                    {isDone && <span className="ml-2 text-emerald-600 text-xs">✓ {drillResults[i]!.recording.mlr.toFixed(1)}</span>}
                  </p>
                  {isActive && (
                    <RecordingButton
                      studentId={userId}
                      dayNumber={dayNumber}
                      takeType={takeType}
                      maxMs={timeLimits[i]}
                      prompt={content.coldTakePrompt}
                      onComplete={(r) => handleDrillComplete(r, i)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Step 3 — Task (Week 2+: shown after cold take, before hot take) */}
      {phase === 'task' && !isWeek1 && (
        <Card>
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Today&apos;s task</p>
            <p className="text-slate-600 text-sm leading-relaxed">
              {content.taskType === 'clause' && 'Complete each sentence starter without pausing mid-clause. Commit to the phrase and finish it.'}
              {content.taskType === 'opinion' && 'Form your view. Speak it clearly. The content matters less than the fluency.'}
              {content.taskType === 'variable' && "Today's format is variable — check the prompt carefully before recording."}
            </p>
            <Button onClick={() => setPhase('hot-take')}>Continue to hot take</Button>
          </div>
        </Card>
      )}

      {/* Step 4 — Hot Take */}
      {phase === 'hot-take' && (
        <Card>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-slate-700">Hot take</p>
              <p className="text-xs text-slate-500 mt-1">
                Same prompt as your cold take. Let&apos;s see how much changed.
              </p>
            </div>
            <RecordingButton
              studentId={userId}
              dayNumber={dayNumber}
              takeType="hot"
              maxMs={60000}
              prompt={content.coldTakePrompt}
              onComplete={handleHotTakeComplete}
            />
          </div>
        </Card>
      )}

      {/* Step 5 — Results */}
      {phase === 'results' && latestResult && displayConfig && (
        <ResultsSection
          coldResult={coldResult}
          hotResult={hotResult}
          drillResults={drillResults}
          latestResult={latestResult}
          displayConfig={displayConfig}
          dayNumber={dayNumber}
          isWeek1={isWeek1}
          onContinue={() => router.push('/dashboard')}
        />
      )}
    </main>
  );
}

// ── Results Section ───────────────────────────────────────────────────────────

interface ResultsSectionProps {
  coldResult: RecordingSubmitResult | null;
  hotResult: RecordingSubmitResult | null;
  drillResults: (RecordingSubmitResult | null)[];
  latestResult: RecordingSubmitResult;
  displayConfig: RecordingSubmitResult['displayConfig'];
  dayNumber: number;
  isWeek1: boolean;
  onContinue: () => void;
}

function ResultsSection({
  coldResult,
  hotResult,
  drillResults,
  latestResult,
  displayConfig,
  dayNumber,
  isWeek1,
  onContinue,
}: ResultsSectionProps) {
  return (
    <div className="space-y-6">
      {/* MLR */}
      {displayConfig.showMLR && (
        <Card padding="lg">
          <MLRDisplay mlr={latestResult.recording.mlr} />

          {/* Cold vs hot delta */}
          {hotResult && coldResult && (
            <div className="mt-4 pt-4 border-t border-slate-100">
              <p className="text-sm text-slate-500">
                Cold take: <strong>{coldResult.recording.mlr.toFixed(1)}</strong>
                {' → '}
                Hot take: <strong>{hotResult.recording.mlr.toFixed(1)}</strong>
                {' '}
                <span className={hotResult.recording.mlr > coldResult.recording.mlr ? 'text-emerald-600' : 'text-slate-500'}>
                  ({hotResult.recording.mlr > coldResult.recording.mlr ? '+' : ''}{(hotResult.recording.mlr - coldResult.recording.mlr).toFixed(1)})
                </span>
              </p>
            </div>
          )}
        </Card>
      )}

      {/* vs baseline */}
      {displayConfig.showBaseline && latestResult.comparisons.vsBaseline !== null && (
        <Card>
          <p className="text-xs text-slate-500 uppercase tracking-wide mb-2">vs your baseline</p>
          <p className="text-2xl font-bold text-slate-900 tabular-nums">
            {latestResult.comparisons.vsBaseline > 0 ? '+' : ''}{latestResult.comparisons.vsBaseline.toFixed(1)}
          </p>
          <p className="text-sm text-slate-500">
            from your Day 0 score of {latestResult.comparisons.baselineMlr?.toFixed(1)}
          </p>
        </Card>
      )}

      {/* Drill progression bars */}
      {displayConfig.showDrillProgression && isWeek1 && (
        <Card>
          <DrillProgressBars
            takes={[
              { label: 'Take 1 (3 min)', mlr: drillResults[0]?.recording.mlr ?? null },
              { label: 'Take 2 (2 min)', mlr: drillResults[1]?.recording.mlr ?? null },
              { label: 'Take 3 (1 min)', mlr: drillResults[2]?.recording.mlr ?? null },
            ]}
          />
        </Card>
      )}

      {/* Trend graph */}
      {displayConfig.showTrendGraph && latestResult.trend.length > 1 && (
        <Card>
          <MLRTrendGraph
            trend={latestResult.trend}
            baselineMlr={latestResult.comparisons.baselineMlr}
          />
        </Card>
      )}

      {/* Pause breakdown */}
      {displayConfig.showPauseLocation && (
        <Card>
          <PauseAnnotation
            midClausePauses={latestResult.recording.midClausePauses}
            juncturePauses={latestResult.recording.juncturePauses}
            pauseClassifications={latestResult.recording.pauseClassifications}
          />
        </Card>
      )}

      {/* Speech rate and filler words */}
      {displayConfig.showFillerRate && (
        <Card>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Speech rate</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {latestResult.recording.speechRateSpm.toFixed(0)}
              </p>
              <p className="text-xs text-slate-400">syllables/min</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">Filler words</p>
              <p className="text-2xl font-bold text-slate-900 tabular-nums">
                {latestResult.recording.fillerWordCount}
              </p>
              <p className="text-xs text-slate-400">um, uh, like...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Transcript */}
      {displayConfig.showPauseLocation && (
        <Card>
          <TranscriptViewer
            transcript={latestResult.recording.transcript}
            chunkMatches={latestResult.recording.chunkMatches}
            showChunks={displayConfig.showChunkDetection}
          />
        </Card>
      )}

      {/* Day 20 — comparison moment */}
      {dayNumber === 20 && (
        <Card className="border-slate-900">
          <p className="text-slate-700 font-medium mb-2">Go back and listen to Day 3.</p>
          <p className="text-slate-500 text-sm">
            Open your Day 3 cold take recording. Listen to it. Then listen to today&apos;s.
            That gap is what you built in three weeks.
          </p>
        </Card>
      )}

      <Button size="lg" className="w-full" onClick={onContinue}>
        Back to dashboard
      </Button>
    </div>
  );
}
