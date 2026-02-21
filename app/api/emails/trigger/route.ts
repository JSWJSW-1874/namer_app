// POST /api/emails/trigger
// Send triggered marketing emails via Brevo API.
// Auth emails go via Supabase SMTP — not here.
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import {
  sendEmail,
  day0FollowUp1Hour,
  day0FollowUp24Hour,
  missedDayEarly,
  missedDayMid,
  day13Complete,
  day28Complete,
} from '@/lib/brevo';

type EmailEvent =
  | 'day0_followup_1h'
  | 'day0_followup_24h'
  | 'missed_day_early'
  | 'missed_day_mid'
  | 'day13_complete'
  | 'day28_complete';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { event, studentId, dayNumber }: { event: EmailEvent; studentId: string; dayNumber?: number } = body;

    if (!event || !studentId) {
      return NextResponse.json({ error: 'Missing event or studentId' }, { status: 400 });
    }

    const supabase = createServerClient();

    // Fetch student info
    const { data: student, error } = await supabase
      .from('users')
      .select('email, name, day0_mlr')
      .eq('id', studentId)
      .single();

    if (error || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const name = student.name ?? student.email.split('@')[0];
    const mlr = student.day0_mlr ?? 0;

    let emailContent: { subject: string; htmlContent: string; textContent: string };

    switch (event) {
      case 'day0_followup_1h':
        emailContent = day0FollowUp1Hour(name, mlr);
        break;
      case 'day0_followup_24h':
        emailContent = day0FollowUp24Hour(name, mlr);
        break;
      case 'missed_day_early':
        emailContent = missedDayEarly(name, dayNumber ?? 1);
        break;
      case 'missed_day_mid':
        emailContent = missedDayMid(name, dayNumber ?? 8);
        break;
      case 'day13_complete':
        emailContent = day13Complete(name);
        break;
      case 'day28_complete':
        emailContent = day28Complete(name);
        break;
      default:
        return NextResponse.json({ error: 'Unknown event type' }, { status: 400 });
    }

    await sendEmail({ to: student.email, ...emailContent });

    return NextResponse.json({ success: true, event, to: student.email });
  } catch (err) {
    console.error('Email trigger error:', err);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
