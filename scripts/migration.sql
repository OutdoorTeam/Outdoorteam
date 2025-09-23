-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all tables for the Outdoor Team application for PostgreSQL

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  full_name TEXT NOT NULL,
  role TEXT DEFAULT 'user',
  plan_type TEXT,
  is_active INTEGER DEFAULT 1,
  features_json TEXT DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS step_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  steps INTEGER NOT NULL,
  date TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'google_fit', 'apple_health')),
  synced_at TIMESTAMPTZ,
  timezone TEXT,
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS user_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_path TEXT NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  file_size INTEGER,
  mime_type TEXT,
  original_name TEXT,
  is_active INTEGER DEFAULT 1,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  description TEXT
);

CREATE TABLE IF NOT EXISTS broadcast_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price REAL DEFAULT 0,
  services_included TEXT NOT NULL,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  features_json TEXT DEFAULT '{"habits": true, "training": true, "nutrition": false, "meditation": false, "active_breaks": true}'
);

CREATE TABLE IF NOT EXISTS daily_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  training_completed INTEGER DEFAULT 0,
  nutrition_completed INTEGER DEFAULT 0,
  movement_completed INTEGER DEFAULT 0,
  meditation_completed INTEGER DEFAULT 0,
  daily_points INTEGER DEFAULT 0,
  steps INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS content_library (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  video_url TEXT,
  category TEXT NOT NULL,
  subcategory TEXT,
  is_active INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  video_type TEXT DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'mp4', 'embed')),
  duration_minutes INTEGER,
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  tags TEXT
);

CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL,
  meditation_type TEXT NOT NULL,
  breathing_cycle_json TEXT,
  comment TEXT,
  completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_reset_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reset_date TEXT NOT NULL UNIQUE,
  executed_at TIMESTAMPTZ NOT NULL,
  users_processed INTEGER DEFAULT 0,
  total_daily_points INTEGER DEFAULT 0,
  total_steps INTEGER DEFAULT 0,
  total_notes INTEGER DEFAULT 0,
  status TEXT DEFAULT 'completed',
  error_message TEXT,
  execution_time_ms INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS daily_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  daily_points INTEGER DEFAULT 0,
  steps INTEGER DEFAULT 0,
  training_completed INTEGER DEFAULT 0,
  nutrition_completed INTEGER DEFAULT 0,
  movement_completed INTEGER DEFAULT 0,
  meditation_completed INTEGER DEFAULT 0,
  notes_content TEXT,
  archived_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level TEXT NOT NULL DEFAULT 'info',
  event TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  route TEXT,
  ip_address TEXT,
  user_agent TEXT,
  metadata TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nutrition_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content_md TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS training_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  version INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS training_plan_days (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID NOT NULL REFERENCES training_plans(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL,
  title TEXT,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS training_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  day_id UUID NOT NULL REFERENCES training_plan_days(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  exercise_name TEXT NOT NULL,
  content_library_id UUID REFERENCES content_library(id) ON DELETE SET NULL,
  youtube_url TEXT,
  sets INTEGER,
  reps TEXT,
  intensity TEXT,
  rest_seconds INTEGER,
  tempo TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS user_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  dashboard_enabled INTEGER DEFAULT 1,
  training_enabled INTEGER DEFAULT 1,
  nutrition_enabled INTEGER DEFAULT 1,
  meditation_enabled INTEGER DEFAULT 1,
  active_breaks_enabled INTEGER DEFAULT 1,
  exercises_enabled INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS user_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  daily_steps_goal INTEGER DEFAULT 8000,
  weekly_points_goal INTEGER DEFAULT 28,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS training_plan_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_title TEXT,
  week_number INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS training_plan_exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES training_plan_schedules(id) ON DELETE CASCADE,
  day_name TEXT NOT NULL,
  exercise_name TEXT NOT NULL,
  content_library_id UUID REFERENCES content_library(id) ON DELETE SET NULL,
  video_url TEXT,
  sets INTEGER,
  reps TEXT,
  rest_seconds INTEGER,
  intensity TEXT,
  notes TEXT,
  sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_avatars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gender TEXT NOT NULL DEFAULT 'female',
  skin_tone TEXT NOT NULL DEFAULT '#f2d5b1',
  hair_style TEXT NOT NULL DEFAULT 'long',
  hair_color TEXT NOT NULL DEFAULT '#3b2219',
  shirt_style TEXT NOT NULL DEFAULT 't-shirt',
  shirt_color TEXT NOT NULL DEFAULT '#5a67d8',
  pants_style TEXT NOT NULL DEFAULT 'shorts',
  pants_color TEXT NOT NULL DEFAULT '#333333',
  accessory TEXT NOT NULL DEFAULT 'none',
  vitality_level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_notes_user_date ON user_notes (user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_files_user_type ON user_files (user_id, file_type);
CREATE INDEX IF NOT EXISTS idx_plans_active ON plans (is_active);
CREATE INDEX IF NOT EXISTS idx_daily_habits_user_date ON daily_habits (user_id, date);
CREATE INDEX IF NOT EXISTS idx_content_library_category_active ON content_library (category, is_active);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_date ON meditation_sessions (user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_daily_history_user_date ON daily_history (user_id, date);
CREATE INDEX IF NOT EXISTS idx_system_logs_level_date ON system_logs (level, created_at);
CREATE INDEX IF NOT EXISTS idx_nutrition_plans_user_status ON nutrition_plans (user_id, status);
CREATE INDEX IF NOT EXISTS idx_training_plans_user_status ON training_plans (user_id, status);
CREATE INDEX IF NOT EXISTS idx_training_plan_days_plan_id ON training_plan_days (plan_id);
CREATE INDEX IF NOT EXISTS idx_training_exercises_day_id ON training_exercises (day_id);
CREATE INDEX IF NOT EXISTS idx_training_plan_schedules_user_status ON training_plan_schedules (user_id, status);
CREATE INDEX IF NOT EXISTS idx_training_plan_exercises_schedule_day ON training_plan_exercises (schedule_id, day_name);
