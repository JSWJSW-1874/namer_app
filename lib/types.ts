// lib/types.ts — shared TypeScript interfaces used throughout the application

export interface Recording {
  id: string;
  studentId: string;
  dayNumber: number;
  takeType: 'cold' | 'drill1' | 'drill2' | 'drill3' | 'hot';
  audioUrl: string;
  transcript: string;
  transcriptJson: object;
  mlr: number;
  runCount: number;
  totalSyllables: number;
  midClausePauses: number;
  juncturePauses: number;
  pauseClassifications: PauseClassification[];
  speechRateSpm: number;
  fillerWordCount: number;
  chunkMatches: ChunkMatch[];
  durationMs: number;
  deepgramConfidence: number;
  isBaseline: boolean;
  createdAt: string;
}

export interface PauseClassification {
  afterWordIndex: number;
  durationMs: number;
  type: 'JUNCTURE' | 'MID_CLAUSE';
  wordBefore: string;
  wordAfter: string;
}

export interface ChunkMatch {
  day: number;
  phrase: string;
  position: number;
}

export interface DailyProgress {
  id: string;
  studentId: string;
  dayNumber: number;
  completedAt: string | null;
  coldTakeMlr: number | null;
  hotTakeMlr: number | null;
  coldHotDelta: number | null;
  jonVideoWatched: boolean;
  streakDay: number;
}

export interface RecordingSubmitResult {
  recording: Recording;
  comparisons: {
    vsYesterday: number | null;
    vsBaseline: number | null;
    baselineMlr: number | null;
  };
  trend: Array<{ day: number; mlr: number }>;
  displayConfig: DisplayConfig;
}

export interface DisplayConfig {
  showMLR: boolean;
  showBaseline: boolean;
  showTrendGraph: boolean;
  showPauseLocation: boolean;
  showFillerRate: boolean;
  showChunkDetection: boolean;
  showDrillProgression: boolean;
  showConversionPrompt: boolean;
}

export function getDisplayConfig(dayNumber: number): DisplayConfig {
  return {
    showMLR: true,
    showBaseline: dayNumber >= 1,
    showTrendGraph: dayNumber >= 2,
    showPauseLocation: dayNumber >= 2,
    showFillerRate: dayNumber >= 8,
    showChunkDetection: dayNumber >= 2,
    showDrillProgression: dayNumber >= 1 && dayNumber <= 7,
    showConversionPrompt: dayNumber === 0,
  };
}

export interface DeepgramWord {
  word: string;
  start: number; // seconds
  end: number;
  confidence: number;
  punctuated_word?: string;
}

export interface MLRResult {
  mlr: number;
  runCount: number;
  totalSyllables: number;
  runs: DeepgramWord[][];
  pauses: Array<{ afterWordIndex: number; durationMs: number }>;
  speechRateSpm: number;
  durationMs: number;
}
