// GET /api/progress?studentId=...
// Fetch trend data for the 28-day graph and streak info.
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest) {
  try {
    const supabase = createServerClient();
    const studentId = req.nextUrl.searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Missing studentId' }, { status: 400 });
    }

    const { data: progressRows, error } = await supabase
      .from('daily_progress')
      .select('*')
      .eq('student_id', studentId)
      .order('day_number', { ascending: true });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
    }

    const { data: baseline } = await supabase
      .from('recordings')
      .select('mlr, created_at')
      .eq('student_id', studentId)
      .eq('is_baseline', true)
      .single();

    const trend = (progressRows ?? [])
      .filter((r) => r.cold_take_mlr !== null)
      .map((r) => ({
        day: r.day_number,
        coldMlr: r.cold_take_mlr,
        hotMlr: r.hot_take_mlr,
        delta: r.cold_hot_delta,
        completedAt: r.completed_at,
        streakDay: r.streak_day,
      }));

    const currentStreak = progressRows?.length
      ? progressRows[progressRows.length - 1].streak_day
      : 0;

    return NextResponse.json({
      trend,
      baselineMlr: baseline?.mlr ?? null,
      currentStreak,
      daysCompleted: progressRows?.filter((r) => r.completed_at).length ?? 0,
    });
  } catch (err) {
    console.error('Error fetching progress:', err);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
