-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create all tables for the Outdoor Team application for PostgreSQL

CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  features JSONB,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  name TEXT,
  profile_picture_url TEXT,
  subscription_plan_id UUID,
  is_admin BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  puntos INTEGER DEFAULT 0,
  pasos INTEGER DEFAULT 0,
  ranking_puntos INTEGER,
  ranking_pasos INTEGER,
  has_training_access BOOLEAN DEFAULT FALSE,
  has_nutrition_access BOOLEAN DEFAULT FALSE,
  has_pause_access BOOLEAN DEFAULT FALSE,
  has_meditation_access BOOLEAN DEFAULT FALSE,
  health_assessment_results JSONB,
  CONSTRAINT users_subscription_plan_fk FOREIGN KEY (subscription_plan_id) REFERENCES subscription_plans(id)
);

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY,
  full_name TEXT,
  nombre TEXT,
  apellido TEXT,
  telefono TEXT,
  direccion TEXT,
  ciudad TEXT,
  pais TEXT,
  codigo_postal TEXT,
  fecha_nacimiento DATE,
  avatar_url TEXT,
  biografia TEXT,
  name TEXT,
  profile_picture_url TEXT,
  sitio_web TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT profiles_user_fk FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);


CREATE TABLE IF NOT EXISTS user_plan_assignments (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, plan_id)
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
-- --------------------------------------------------------------------------------
-- Row Level Security hardening (2025-10-03)
-- --------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _result BOOLEAN;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  IF to_regclass('public.user_roles') IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
      AND ur.role IN ('admin', 'super_admin')
  ) INTO _result;

  RETURN COALESCE(_result, FALSE);
END;
$$;

COMMENT ON FUNCTION public.has_admin_role() IS 'Checks if the current authenticated principal has an admin-level role (admin, super_admin).';

GRANT EXECUTE ON FUNCTION public.has_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_admin_role() TO anon;

CREATE OR REPLACE PROCEDURE public.ensure_policy(
  target_table regclass,
  policy_name text,
  policy_sql text
)
LANGUAGE plpgsql
AS $$
DECLARE
  _schema text;
  _table text;
BEGIN
  SELECT n.nspname, c.relname
    INTO _schema, _table
  FROM pg_class c
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE c.oid = target_table;

  IF NOT FOUND THEN
    RAISE NOTICE 'Skipping policy %, table % does not exist', policy_name, target_table;
    RETURN;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = _schema
      AND tablename = _table
      AND policyname = policy_name
  ) THEN
    EXECUTE format(
      'CREATE POLICY %I ON %s %s',
      policy_name,
      target_table,
      policy_sql
    );
  END IF;
END;
$$;

-- subscription_plans
ALTER TABLE IF EXISTS public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.subscription_plans FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.subscription_plans', 'subscription_plans_select_authenticated', 'FOR SELECT USING (auth.role() = ''authenticated'' OR public.has_admin_role())');
CALL public.ensure_policy('public.subscription_plans', 'subscription_plans_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.subscription_plans', 'subscription_plans_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.subscription_plans', 'subscription_plans_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- admin_roles
ALTER TABLE IF EXISTS public.admin_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_roles FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.admin_roles', 'admin_roles_select_admin', 'FOR SELECT USING (public.has_admin_role())');
CALL public.ensure_policy('public.admin_roles', 'admin_roles_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.admin_roles', 'admin_roles_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.admin_roles', 'admin_roles_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- admin_users
ALTER TABLE IF EXISTS public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.admin_users FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.admin_users', 'admin_users_select_admin', 'FOR SELECT USING (public.has_admin_role())');
CALL public.ensure_policy('public.admin_users', 'admin_users_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.admin_users', 'admin_users_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.admin_users', 'admin_users_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- user_roles
ALTER TABLE IF EXISTS public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_roles FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.user_roles', 'user_roles_select_self_or_admin', 'FOR SELECT USING ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.user_roles', 'user_roles_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.user_roles', 'user_roles_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.user_roles', 'user_roles_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- habits
ALTER TABLE IF EXISTS public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.habits FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.habits', 'habits_select_authenticated', 'FOR SELECT USING (auth.role() = ''authenticated'' OR public.has_admin_role())');
CALL public.ensure_policy('public.habits', 'habits_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.habits', 'habits_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.habits', 'habits_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- nutrition_plans
ALTER TABLE IF EXISTS public.nutrition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.nutrition_plans FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.nutrition_plans', 'nutrition_plans_select_owner_or_admin', 'FOR SELECT USING ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.nutrition_plans', 'nutrition_plans_insert_owner_or_admin', 'FOR INSERT WITH CHECK ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.nutrition_plans', 'nutrition_plans_update_owner_or_admin', 'FOR UPDATE USING ((auth.uid() = user_id) OR public.has_admin_role()) WITH CHECK ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.nutrition_plans', 'nutrition_plans_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- challenges
ALTER TABLE IF EXISTS public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.challenges FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.challenges', 'challenges_select_authenticated', 'FOR SELECT USING (auth.role() = ''authenticated'' OR public.has_admin_role())');
CALL public.ensure_policy('public.challenges', 'challenges_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.challenges', 'challenges_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.challenges', 'challenges_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- database_alerts
ALTER TABLE IF EXISTS public.database_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.database_alerts FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.database_alerts', 'database_alerts_select_admin', 'FOR SELECT USING (public.has_admin_role())');
CALL public.ensure_policy('public.database_alerts', 'database_alerts_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.database_alerts', 'database_alerts_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.database_alerts', 'database_alerts_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- health_surveys
ALTER TABLE IF EXISTS public.health_surveys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.health_surveys FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.health_surveys', 'health_surveys_select_owner_or_admin', 'FOR SELECT USING ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.health_surveys', 'health_surveys_insert_owner_or_admin', 'FOR INSERT WITH CHECK ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.health_surveys', 'health_surveys_update_owner_or_admin', 'FOR UPDATE USING ((auth.uid() = user_id) OR public.has_admin_role()) WITH CHECK ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.health_surveys', 'health_surveys_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- recompensas
ALTER TABLE IF EXISTS public.recompensas ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.recompensas FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.recompensas', 'recompensas_select_authenticated', 'FOR SELECT USING (auth.role() = ''authenticated'' OR public.has_admin_role())');
CALL public.ensure_policy('public.recompensas', 'recompensas_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.recompensas', 'recompensas_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.recompensas', 'recompensas_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- logros
ALTER TABLE IF EXISTS public.logros ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.logros FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.logros', 'logros_select_authenticated', 'FOR SELECT USING (auth.role() = ''authenticated'' OR public.has_admin_role())');
CALL public.ensure_policy('public.logros', 'logros_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.logros', 'logros_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.logros', 'logros_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- videos_ejercicios
ALTER TABLE IF EXISTS public.videos_ejercicios ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos_ejercicios FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.videos_ejercicios', 'videos_ejercicios_select_authenticated', 'FOR SELECT USING (auth.role() = ''authenticated'' OR public.has_admin_role())');
CALL public.ensure_policy('public.videos_ejercicios', 'videos_ejercicios_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.videos_ejercicios', 'videos_ejercicios_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.videos_ejercicios', 'videos_ejercicios_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- training_plans
ALTER TABLE IF EXISTS public.training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.training_plans FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.training_plans', 'training_plans_select_owner_or_admin', 'FOR SELECT USING ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.training_plans', 'training_plans_insert_owner_or_admin', 'FOR INSERT WITH CHECK ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.training_plans', 'training_plans_update_owner_or_admin', 'FOR UPDATE USING ((auth.uid() = user_id) OR public.has_admin_role()) WITH CHECK ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.training_plans', 'training_plans_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- training_programs
ALTER TABLE IF EXISTS public.training_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.training_programs FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.training_programs', 'training_programs_select_authenticated', 'FOR SELECT USING (auth.role() = ''authenticated'' OR public.has_admin_role())');
CALL public.ensure_policy('public.training_programs', 'training_programs_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.training_programs', 'training_programs_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.training_programs', 'training_programs_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- videos
ALTER TABLE IF EXISTS public.videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.videos FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.videos', 'videos_select_authenticated', 'FOR SELECT USING (auth.role() = ''authenticated'' OR public.has_admin_role())');
CALL public.ensure_policy('public.videos', 'videos_insert_admin', 'FOR INSERT WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.videos', 'videos_update_admin', 'FOR UPDATE USING (public.has_admin_role()) WITH CHECK (public.has_admin_role())');
CALL public.ensure_policy('public.videos', 'videos_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

-- health_evaluations
ALTER TABLE IF EXISTS public.health_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.health_evaluations FORCE ROW LEVEL SECURITY;

CALL public.ensure_policy('public.health_evaluations', 'health_evaluations_select_owner_or_admin', 'FOR SELECT USING ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.health_evaluations', 'health_evaluations_insert_owner_or_admin', 'FOR INSERT WITH CHECK ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.health_evaluations', 'health_evaluations_update_owner_or_admin', 'FOR UPDATE USING ((auth.uid() = user_id) OR public.has_admin_role()) WITH CHECK ((auth.uid() = user_id) OR public.has_admin_role())');
CALL public.ensure_policy('public.health_evaluations', 'health_evaluations_delete_admin', 'FOR DELETE USING (public.has_admin_role())');

DROP PROCEDURE IF EXISTS public.ensure_policy(regclass, text, text);
