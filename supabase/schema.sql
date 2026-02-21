-- Speaking KickStart — Database Schema
-- Run this in the Supabase SQL editor.
-- Enable Row Level Security (RLS) on all tables.

-- ── 1. users ─────────────────────────────────────────────────────────────────
-- One row per registered student.
-- Created automatically by Supabase Auth on signup via trigger.

CREATE TABLE IF NOT EXISTS users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email           TEXT UNIQUE NOT NULL,
  name            TEXT,
  l1_language     TEXT DEFAULT 'russian',
  has_paid        BOOLEAN DEFAULT FALSE,
  tier            INTEGER DEFAULT 0,  -- 0=free/day0, 1/2/3=paid tiers
  day0_completed  BOOLEAN DEFAULT FALSE,
  day0_mlr        FLOAT,              -- stored for conversion analytics
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own" ON users
  USING (auth.uid() = id);

-- Trigger: create a users row when a new auth.users row is inserted
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ── 2. recordings ─────────────────────────────────────────────────────────────
-- One row per audio submission. Central table.
-- Every recording the student ever makes is stored here with all computed metrics.

CREATE TABLE IF NOT EXISTS recordings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id            UUID REFERENCES users(id) NOT NULL,
  day_number            INTEGER NOT NULL,  -- 0 = Day 0 diagnostic
  take_type             TEXT NOT NULL,     -- cold | drill1 | drill2 | drill3 | hot
  audio_url             TEXT NOT NULL,     -- Supabase Storage path
  transcript            TEXT,
  transcript_json       JSONB,             -- raw Deepgram response
  mlr                   FLOAT,
  run_count             INTEGER,
  total_syllables       INTEGER,
  mid_clause_pauses     INTEGER DEFAULT 0,
  juncture_pauses       INTEGER DEFAULT 0,
  pause_classifications JSONB,             -- [{position, type, word}]
  speech_rate_spm       FLOAT,             -- syllables per minute
  filler_word_count     INTEGER DEFAULT 0,
  chunk_matches         JSONB,             -- [{chunk, position, day_taught}]
  duration_ms           INTEGER,
  deepgram_confidence   FLOAT,
  is_baseline           BOOLEAN DEFAULT FALSE,  -- TRUE for Day 0 cold only
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recordings_student ON recordings(student_id);
CREATE INDEX IF NOT EXISTS idx_recordings_day     ON recordings(student_id, day_number);

ALTER TABLE recordings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recordings_own" ON recordings
  USING (auth.uid() = student_id);

-- CRITICAL: Prevent deletion of baseline recordings.
-- The Day 0 cold take is a permanent anchor — losing it breaks the entire progress narrative.
CREATE OR REPLACE FUNCTION protect_baseline_recording()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.is_baseline = TRUE THEN
    RAISE EXCEPTION 'Cannot delete baseline recording (is_baseline = TRUE). This record is a permanent anchor.';
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS prevent_baseline_deletion ON recordings;
CREATE TRIGGER prevent_baseline_deletion
  BEFORE DELETE ON recordings
  FOR EACH ROW EXECUTE FUNCTION protect_baseline_recording();


-- ── 3. daily_progress ─────────────────────────────────────────────────────────
-- One row per student per day.
-- Used to build the 28-day trend graph and track completion streaks.

CREATE TABLE IF NOT EXISTS daily_progress (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id        UUID REFERENCES users(id) NOT NULL,
  day_number        INTEGER NOT NULL,
  completed_at      TIMESTAMPTZ,
  cold_take_mlr     FLOAT,     -- used for the trend graph
  hot_take_mlr      FLOAT,
  cold_hot_delta    FLOAT,     -- hot_take_mlr - cold_take_mlr
  jon_video_watched BOOLEAN DEFAULT FALSE,
  streak_day        INTEGER DEFAULT 0,
  UNIQUE(student_id, day_number)
);

ALTER TABLE daily_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "progress_own" ON daily_progress
  USING (auth.uid() = student_id);


-- ── 4. enrollments ────────────────────────────────────────────────────────────
-- Tracks which student is on which course at which tier.
-- Payment confirmation writes here.

CREATE TABLE IF NOT EXISTS enrollments (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID REFERENCES users(id) NOT NULL,
  course_id        TEXT DEFAULT 'speaking_kickstart_28',
  tier             INTEGER NOT NULL,
  started_at       TIMESTAMPTZ DEFAULT NOW(),
  day1_unlocked_at TIMESTAMPTZ,
  completed_at     TIMESTAMPTZ,
  payment_ref      TEXT
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "enrollments_own" ON enrollments
  USING (auth.uid() = student_id);


-- ── 5. mlr_benchmarks ─────────────────────────────────────────────────────────
-- Aggregated benchmark data from each cohort.
-- Populated by admin function after each cohort completes.
-- Becomes the platform's proprietary dataset.

CREATE TABLE IF NOT EXISTS mlr_benchmarks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cohort          TEXT NOT NULL,   -- e.g. beta_1, cohort_2
  cefr_level      TEXT,            -- B1, B2 (self-reported at signup)
  l1_background   TEXT,            -- russian, belarusian, ukrainian, kazakh
  day0_mlr_mean   FLOAT,
  day28_mlr_mean  FLOAT,
  improvement_pct FLOAT,
  sample_size     INTEGER,
  stddev          FLOAT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
-- Admin only — no RLS policy for student access


-- ── Storage bucket ────────────────────────────────────────────────────────────
-- Run this separately in Supabase dashboard > Storage, or via the API.
-- Bucket name: recordings
-- Path pattern: recordings/{studentId}/{dayNumber}/{takeType}/{timestamp}.{ext}
-- Enable RLS on the bucket so students can only access their own files.
