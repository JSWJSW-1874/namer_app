// lib/brevo.ts — email sending wrapper using Brevo API
// Used for triggered marketing emails. Auth emails go via Supabase SMTP (configured in dashboard).
import { BrevoClient } from '@getbrevo/brevo';

function getClient() {
  return new BrevoClient({ apiKey: process.env.BREVO_API_KEY! });
}

export async function sendEmail({
  to,
  subject,
  htmlContent,
  textContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  textContent: string;
}) {
  const client = getClient();
  await client.transactionalEmails.sendTransacEmail({
    sender: {
      email: process.env.BREVO_SENDER_EMAIL!,
      name: process.env.BREVO_SENDER_NAME!,
    },
    to: [{ email: to }],
    subject,
    htmlContent,
    textContent,
  });
}

// ── Email templates ──────────────────────────────────────────────────────────

export function day0FollowUp1Hour(studentName: string, mlr: number) {
  const subject = 'Your English baseline — and what it means';
  const textContent = `Hi ${studentName},

You just recorded your baseline. Your MLR is ${mlr.toFixed(1)}.

That number is your starting point — not a verdict. Students who complete the 28-day sprint typically move 10–15% in the right direction from wherever they start.

Day 1 is ready when you are.

Jon`;

  const htmlContent = `<p>Hi ${studentName},</p>
<p>You just recorded your baseline. Your MLR is <strong>${mlr.toFixed(1)}</strong>.</p>
<p>That number is your starting point — not a verdict. Students who complete the 28-day sprint typically move 10–15% in the right direction from wherever they start.</p>
<p>Day 1 is ready when you are.</p>
<p>Jon</p>`;

  return { subject, htmlContent, textContent };
}

export function day0FollowUp24Hour(studentName: string, mlr: number) {
  const subject = `You scored ${mlr.toFixed(1)}. Here's where that puts you.`;
  const textContent = `Hi ${studentName},

Yesterday you recorded your first 60 seconds. Your MLR was ${mlr.toFixed(1)}.

That puts you exactly where most students start — which means the sprint is designed for you.

The first day takes about 20 minutes. It will not feel like what you expect.

Jon`;

  const htmlContent = `<p>Hi ${studentName},</p>
<p>Yesterday you recorded your first 60 seconds. Your MLR was <strong>${mlr.toFixed(1)}</strong>.</p>
<p>That puts you exactly where most students start — which means the sprint is designed for you.</p>
<p>The first day takes about 20 minutes. It will not feel like what you expect.</p>
<p>Jon</p>`;

  return { subject, htmlContent, textContent };
}

export function missedDayEarly(studentName: string, dayNumber: number) {
  const subject = 'You were on a streak — come back';
  const textContent = `Hi ${studentName},

You were doing well. Day ${dayNumber} is still there waiting.

These things compound. Missing one day is not the problem — the habit is. Five minutes today keeps it alive.

Jon`;

  const htmlContent = `<p>Hi ${studentName},</p>
<p>You were doing well. Day ${dayNumber} is still there waiting.</p>
<p>These things compound. Missing one day is not the problem — the habit is. Five minutes today keeps it alive.</p>
<p>Jon</p>`;

  return { subject, htmlContent, textContent };
}

export function missedDayMid(studentName: string, dayNumber: number) {
  const subject = `Day ${dayNumber} is where it gets interesting`;
  const textContent = `Hi ${studentName},

You are past the halfway point. Day ${dayNumber} is where the work you have already done starts to pay off.

Come back today. The recording takes less than 10 minutes.

Jon`;

  const htmlContent = `<p>Hi ${studentName},</p>
<p>You are past the halfway point. Day ${dayNumber} is where the work you have already done starts to pay off.</p>
<p>Come back today. The recording takes less than 10 minutes.</p>
<p>Jon</p>`;

  return { subject, htmlContent, textContent };
}

export function day13Complete(studentName: string) {
  const subject = 'Tomorrow gets harder — read this before Day 14';
  const textContent = `Hi ${studentName},

Week 3 starts tomorrow. The prompts are unfamiliar. You will see a topic for the first time 5 seconds before you record.

Your MLR will probably drop. That is not a problem — that is the design. You are being pushed into conditions that are actually closer to real conversation.

The number going down temporarily is how you know it is working.

Jon`;

  const htmlContent = `<p>Hi ${studentName},</p>
<p>Week 3 starts tomorrow. The prompts are unfamiliar. You will see a topic for the first time 5 seconds before you record.</p>
<p>Your MLR will probably drop. That is not a problem — that is the design. You are being pushed into conditions that are actually closer to real conversation.</p>
<p>The number going down temporarily is how you know it is working.</p>
<p>Jon</p>`;

  return { subject, htmlContent, textContent };
}

export function day28Complete(studentName: string) {
  const subject = 'You did it. Now go listen to your Day 3 recording.';
  const textContent = `Hi ${studentName},

Twenty-eight days. Every one of them.

Your full progress report is in your dashboard. But before you look at the numbers — go listen to your Day 3 cold take. Then listen to today's.

That gap is what you built.

Jon`;

  const htmlContent = `<p>Hi ${studentName},</p>
<p>Twenty-eight days. Every one of them.</p>
<p>Your full progress report is in your dashboard. But before you look at the numbers — go listen to your Day 3 cold take. Then listen to today's.</p>
<p>That gap is what you built.</p>
<p>Jon</p>`;

  return { subject, htmlContent, textContent };
}
