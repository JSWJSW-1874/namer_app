// lib/course-content.ts — course configuration
// Store prompts and content here, not hardcoded in components.
// Update prompts without touching component code.

export interface DayContent {
  title: string;
  subtitle: string;
  coldTakePrompt: string;
  taskType: 'drill' | 'clause' | 'opinion' | 'variable';
  jonVideoId: string; // Vimeo ID — fill when videos are recorded
  /** Day 13 and Day 20 are critical — cannot be skipped */
  mustWatchBeforeColdTake?: boolean;
}

export const DAILY_CONTENT: Record<number, DayContent> = {
  0: {
    title: 'Find Your Voice',
    subtitle: 'A 10-minute diagnostic that tells you exactly where your English speaking starts today.',
    coldTakePrompt:
      'Tell me about a typical working day — where you start, what the main challenges are, and one thing you actually enjoy about the work.',
    taskType: 'drill',
    jonVideoId: '',
  },
  1: {
    title: 'The First Run',
    subtitle:
      'Your first recording, your first data, and the task that shows you how automaticity works in 15 minutes.',
    coldTakePrompt:
      'Tell me about a moment when you realised your English was holding you back. What happened, and how did it feel?',
    taskType: 'drill',
    jonVideoId: '',
  },
  2: {
    title: 'Your First Weapon',
    subtitle:
      'One phrase that adds seven syllables to any run and trains your brain to finish what it starts.',
    coldTakePrompt:
      'Tell me about the most interesting part of the work you do. What makes it interesting?',
    taskType: 'drill',
    jonVideoId: '',
  },
  3: {
    title: 'The Real Diagnosis',
    subtitle:
      'Why you freeze — and why it has nothing to do with your grammar, your accent, or your personality.',
    coldTakePrompt:
      'Tell me about something happening in the world right now — in technology, politics, or your industry — and what you think about it.',
    taskType: 'drill',
    jonVideoId: '',
  },
  4: {
    title: 'Committing to the Clause',
    subtitle: 'The habit that separates B2 speakers from B1 — and how to build it in one day.',
    coldTakePrompt:
      'Tell me about a decision you made at work recently. What was the situation, what did you decide, and how did it turn out?',
    taskType: 'drill',
    jonVideoId: '',
  },
  5: {
    title: 'The 60-Second Rule',
    subtitle: 'Why one minute of real speaking is worth more than an hour of study.',
    coldTakePrompt:
      'Tell me about a place that matters to you — somewhere you have lived, worked, or visited — and why it stays with you.',
    taskType: 'drill',
    jonVideoId: '',
  },
  6: {
    title: 'Why Your Phone Is the Best Teacher',
    subtitle: 'The counterintuitive reason recording yourself works better than speaking to a person.',
    coldTakePrompt:
      'Tell me about something you have learned in the last year — from work, from a book, from another person. What changed because of it?',
    taskType: 'drill',
    jonVideoId: '',
    mustWatchBeforeColdTake: false,
  },
  7: {
    title: 'End of Week One',
    subtitle: 'You have built the habit. Now let\'s see what it has done.',
    coldTakePrompt:
      'Tell me about the best professional decision you have ever made. What was it, and what made it the right call?',
    taskType: 'drill',
    jonVideoId: '',
  },
  8: {
    title: 'The Foundation, Not the Building',
    subtitle: 'Why this month is not the end — and why that is good news.',
    coldTakePrompt:
      'Complete this thought out loud: "The thing about the work I do is that it requires..." — then keep going for 60 seconds.',
    taskType: 'clause',
    jonVideoId: '',
  },
  9: {
    title: 'Finishing What You Start',
    subtitle: 'The clause-completion drill that fixes mid-clause freezes in one week.',
    coldTakePrompt:
      'Complete this thought out loud: "What I find most challenging about English is..." — then keep going for 60 seconds.',
    taskType: 'clause',
    jonVideoId: '',
  },
  10: {
    title: 'MLR and Grammar',
    subtitle: 'Why your fluency score has nothing to do with whether your sentences are correct.',
    coldTakePrompt:
      'Complete this thought out loud: "The reason I want to speak English better is..." — then keep going for 60 seconds.',
    taskType: 'clause',
    jonVideoId: '',
  },
  11: {
    title: 'Two Kinds of Pause',
    subtitle: 'Not every pause means the same thing. Here is how to tell the difference.',
    coldTakePrompt:
      'Complete this thought out loud: "The thing about my industry right now is..." — then keep going for 60 seconds.',
    taskType: 'clause',
    jonVideoId: '',
  },
  12: {
    title: 'Your Week One Score Was the Easy Test',
    subtitle: 'Why your baseline was measured in ideal conditions — and what that means for Week 3.',
    coldTakePrompt:
      'Complete this thought out loud: "What I notice when I speak English is..." — then keep going for 60 seconds.',
    taskType: 'clause',
    jonVideoId: '',
  },
  13: {
    title: 'Tomorrow Gets Harder — Here\'s Exactly Why',
    subtitle: 'The most important video in the course. Watch it before you record today.',
    coldTakePrompt:
      'Complete this thought out loud: "The thing I would tell someone starting to learn English is..." — then keep going for 60 seconds.',
    taskType: 'clause',
    jonVideoId: '',
    mustWatchBeforeColdTake: true, // CRITICAL — cannot be skipped
  },
  14: {
    title: 'Into the Deep End',
    subtitle: 'Week 3 starts now. Five seconds. Then you speak.',
    coldTakePrompt:
      'What do you think about remote work? You have five seconds — then go.',
    taskType: 'opinion',
    jonVideoId: '',
  },
  15: {
    title: 'Cold Opinions',
    subtitle: 'Real conversation does not give you time to prepare. Neither does this.',
    coldTakePrompt:
      'What is your view on AI in the workplace? Five seconds — then go.',
    taskType: 'opinion',
    jonVideoId: '',
  },
  16: {
    title: 'When the Anxiety Is the Point',
    subtitle: 'The physiological freeze is not a sign that something is wrong.',
    coldTakePrompt:
      'Should companies have a four-day working week? Five seconds — then go.',
    taskType: 'opinion',
    jonVideoId: '',
  },
  17: {
    title: 'When Your Number Stops Moving',
    subtitle: 'What a plateau actually means — and why it is not what it looks like.',
    coldTakePrompt:
      'What makes a good manager? Five seconds — then go.',
    taskType: 'opinion',
    jonVideoId: '',
  },
  18: {
    title: 'You Won\'t Feel It Happening',
    subtitle: 'Change in language is invisible until the moment it suddenly is not.',
    coldTakePrompt:
      'Is it better to specialise deeply in one area or to be broadly skilled? Five seconds — then go.',
    taskType: 'opinion',
    jonVideoId: '',
  },
  19: {
    title: 'Pressure and Clarity',
    subtitle: 'Why the hardest prompts produce the most useful data.',
    coldTakePrompt:
      'What is something most people in your industry get wrong? Five seconds — then go.',
    taskType: 'opinion',
    jonVideoId: '',
  },
  20: {
    title: 'Go Back and Listen to Day 3',
    subtitle: 'The comparison moment. Listen before you record.',
    coldTakePrompt:
      'Tell me about something you care about deeply — in work, in life, or in the world. Speak for 60 seconds.',
    taskType: 'opinion',
    jonVideoId: '',
    mustWatchBeforeColdTake: true, // CRITICAL — cannot be skipped
  },
  21: {
    title: 'End of Week Three',
    subtitle: 'The hardest week is done. Here is what it built.',
    coldTakePrompt:
      'What has surprised you most about this course so far? Five seconds — then go.',
    taskType: 'opinion',
    jonVideoId: '',
  },
  22: {
    title: 'Not Too Old. Too Careful.',
    subtitle: 'The adult learner neuroplasticity reframe.',
    coldTakePrompt:
      'Tell me about something you are genuinely proud of from your career. Speak for 60 seconds.',
    taskType: 'variable',
    jonVideoId: '',
  },
  23: {
    title: 'Variable Pressure',
    subtitle: 'Some days familiar. Some days cold. You do not know which until you start.',
    coldTakePrompt:
      'What do you think about this claim: "Speaking a foreign language fluently is mostly about confidence, not knowledge." Five seconds — then go.',
    taskType: 'variable',
    jonVideoId: '',
  },
  24: {
    title: 'Familiar Ground, Higher Stakes',
    subtitle: 'Back to a topic you know — but the standard has shifted.',
    coldTakePrompt:
      'Tell me about a typical working day — where you start, what the main challenges are, and one thing you actually enjoy about the work.',
    taskType: 'variable',
    jonVideoId: '',
  },
  25: {
    title: 'The 45-Second Test',
    subtitle: 'Less time. Same content. What changes?',
    coldTakePrompt:
      'Tell me about the most important thing you have learned this month. You have 45 seconds.',
    taskType: 'variable',
    jonVideoId: '',
  },
  26: {
    title: 'The Penultimate Day',
    subtitle: 'One more unfamiliar prompt before the finish.',
    coldTakePrompt:
      'What would you tell a younger version of yourself about learning English? Five seconds — then go.',
    taskType: 'variable',
    jonVideoId: '',
  },
  27: {
    title: 'Tomorrow Is Day 28',
    subtitle: 'One more sleep. Here is what to expect.',
    coldTakePrompt:
      'Tell me about something you are looking forward to — in work, in life, or in the world. Speak for 60 seconds.',
    taskType: 'variable',
    jonVideoId: '',
  },
  28: {
    title: 'What You\'ve Built. What It Means.',
    subtitle: 'The final recording. Speak about something you genuinely care about.',
    coldTakePrompt:
      'Tell me about something you care about deeply — in your work, your life, or the world. This is your final recording. Speak for as long as you have something to say.',
    taskType: 'variable',
    jonVideoId: '',
  },
};

export function getDayContent(day: number): DayContent | null {
  return DAILY_CONTENT[day] ?? null;
}
