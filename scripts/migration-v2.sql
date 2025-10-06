-- ============================================================================
-- MIGRACIÓN V2.0 - Academia de Hábitos Saludables
-- Sistema de Puntos de Vitalidad y Gamificación
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- LIMPIEZA: Eliminar tablas obsoletas
-- ============================================================================

DROP TABLE IF EXISTS user_plan_assignments CASCADE;
DROP TABLE IF EXISTS nutrition_plans CASCADE;
DROP TABLE IF EXISTS training_exercises CASCADE;
DROP TABLE IF EXISTS training_plan_days CASCADE;
DROP TABLE IF EXISTS training_plans CASCADE;
DROP TABLE IF EXISTS training_plan_exercises CASCADE;
DROP TABLE IF EXISTS training_plan_schedules CASCADE;
DROP TABLE IF EXISTS user_files CASCADE;
DROP TABLE IF EXISTS broadcast_messages CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- ============================================================================
-- TABLA: users (modificada para nuevo sistema)
-- ============================================================================

-- Primero, agregar nuevas columnas si no existen
DO $$
BEGIN
  -- Columnas para sistema de niveles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='activity_level') THEN
    ALTER TABLE users ADD COLUMN activity_level INTEGER DEFAULT 1 CHECK (activity_level IN (1, 2, 3));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='weekly_vitality_goal') THEN
    ALTER TABLE users ADD COLUMN weekly_vitality_goal INTEGER DEFAULT 28;
  END IF;

  -- Columnas para suscripción
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='subscription_status') THEN
    ALTER TABLE users ADD COLUMN subscription_status TEXT DEFAULT 'trial' CHECK (subscription_status IN ('trial', 'active', 'inactive', 'cancelled'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='trial_end_date') THEN
    ALTER TABLE users ADD COLUMN trial_end_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days');
  END IF;

  -- Columnas para avatar
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_type') THEN
    ALTER TABLE users ADD COLUMN avatar_type TEXT DEFAULT 'character' CHECK (avatar_type IN ('photo', 'character'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='avatar_character_id') THEN
    ALTER TABLE users ADD COLUMN avatar_character_id INTEGER DEFAULT 1;
  END IF;

  -- Columnas para gamificación
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='current_streak_days') THEN
    ALTER TABLE users ADD COLUMN current_streak_days INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='longest_streak_days') THEN
    ALTER TABLE users ADD COLUMN longest_streak_days INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='total_vitality_points') THEN
    ALTER TABLE users ADD COLUMN total_vitality_points INTEGER DEFAULT 0;
  END IF;
END $$;

-- Eliminar columnas obsoletas
ALTER TABLE users DROP COLUMN IF EXISTS subscription_plan_id;
ALTER TABLE users DROP COLUMN IF EXISTS has_training_access;
ALTER TABLE users DROP COLUMN IF EXISTS has_nutrition_access;
ALTER TABLE users DROP COLUMN IF EXISTS has_pause_access;
ALTER TABLE users DROP COLUMN IF EXISTS has_meditation_access;
ALTER TABLE users DROP COLUMN IF EXISTS puntos;
ALTER TABLE users DROP COLUMN IF EXISTS ranking_puntos;
ALTER TABLE users DROP COLUMN IF EXISTS ranking_pasos;

-- ============================================================================
-- TABLA: activities_catalog (Catálogo de 50+ actividades con METs)
-- ============================================================================

CREATE TABLE IF NOT EXISTS activities_catalog (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  mets DECIMAL(3,1) NOT NULL CHECK (mets >= 3.0),
  description TEXT,
  icon TEXT DEFAULT '🏃',
  base_duration_minutes INTEGER DEFAULT 30,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activities_catalog_category ON activities_catalog(category);
CREATE INDEX IF NOT EXISTS idx_activities_catalog_active ON activities_catalog(is_active);

-- ============================================================================
-- TABLA: user_activities (Registro de actividades completadas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  activity_id INTEGER REFERENCES activities_catalog(id) ON DELETE SET NULL,
  activity_name TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  mets_value DECIMAL(3,1) NOT NULL,
  vitality_points_earned INTEGER NOT NULL,
  date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_activities_user_date ON user_activities(user_id, date);
CREATE INDEX IF NOT EXISTS idx_user_activities_date ON user_activities(date);

-- ============================================================================
-- TABLA: training_blocks (Bloques de entrenamiento de 10 minutos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS training_blocks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('hiit', 'strength', 'aerobic', 'seniors', 'stretching', 'relaxation')),
  duration_minutes INTEGER DEFAULT 10,
  intensity TEXT CHECK (intensity IN ('low', 'medium', 'high')),
  video_url TEXT,
  thumbnail_url TEXT,
  description TEXT,
  vitality_points DECIMAL(3,1) NOT NULL,
  min_activity_level INTEGER DEFAULT 1 CHECK (min_activity_level IN (1, 2, 3)),
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_training_blocks_type ON training_blocks(type);
CREATE INDEX IF NOT EXISTS idx_training_blocks_level ON training_blocks(min_activity_level);

-- ============================================================================
-- TABLA: user_training_sessions (Sesiones de entrenamiento completadas)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  block_id INTEGER REFERENCES training_blocks(id) ON DELETE SET NULL,
  block_title TEXT NOT NULL,
  vitality_points_earned DECIMAL(3,1) NOT NULL,
  date DATE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_user_training_sessions_user_date ON user_training_sessions(user_id, date);

-- ============================================================================
-- TABLA: evaluations (Evaluaciones de salud y bienestar)
-- ============================================================================

CREATE TABLE IF NOT EXISTS evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('imc', 'parq', 'ipaq', 'pss10', 'whoqol')),
  results JSONB NOT NULL,
  score DECIMAL(5,2),
  interpretation TEXT,
  assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evaluations_user_type ON evaluations(user_id, type);
CREATE INDEX IF NOT EXISTS idx_evaluations_status ON evaluations(status);

-- ============================================================================
-- TABLA: vitality_points_history (Historial semanal de puntos)
-- ============================================================================

CREATE TABLE IF NOT EXISTS vitality_points_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_points INTEGER DEFAULT 0,
  goal_points INTEGER NOT NULL,
  goal_achieved BOOLEAN DEFAULT FALSE,
  percentage DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_vitality_history_user_week ON vitality_points_history(user_id, week_start);

-- ============================================================================
-- TABLA: achievements (Logros desbloqueables)
-- ============================================================================

CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '🏆',
  category TEXT NOT NULL,
  requirement JSONB NOT NULL,
  points_reward INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLA: user_achievements (Logros desbloqueados por usuarios)
-- ============================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  achievement_id INTEGER NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON user_achievements(user_id);

-- ============================================================================
-- TABLA: user_avatars (Avatar evolutivo - actualizada)
-- ============================================================================

-- Crear tabla si no existe
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
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id)
);

-- Actualizar tabla existente con nuevas columnas
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_avatars' AND column_name='vitality_level') THEN
    ALTER TABLE user_avatars ADD COLUMN vitality_level INTEGER DEFAULT 1 CHECK (vitality_level BETWEEN 1 AND 5);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_avatars' AND column_name='custom_photo_url') THEN
    ALTER TABLE user_avatars ADD COLUMN custom_photo_url TEXT;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_avatars' AND column_name='character_preset_id') THEN
    ALTER TABLE user_avatars ADD COLUMN character_preset_id INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_avatars' AND column_name='evolution_effects') THEN
    ALTER TABLE user_avatars ADD COLUMN evolution_effects JSONB DEFAULT '{"glow": 0, "posture": "normal", "brightness": 100}'::jsonb;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_avatars' AND column_name='last_evolution_update') THEN
    ALTER TABLE user_avatars ADD COLUMN last_evolution_update TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP;
  END IF;
END $$;

-- ============================================================================
-- TABLA: daily_habits (crear tabla base para compatibilidad)
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  habit_name TEXT NOT NULL,
  habit_type TEXT NOT NULL DEFAULT 'custom',
  completed BOOLEAN DEFAULT FALSE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, habit_name, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_habits_user ON daily_habits(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_habits_date ON daily_habits(date);

-- ============================================================================
-- TABLA: daily_vitality (Reemplaza daily_habits)
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_vitality (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date DATE NOT NULL,

  -- 4 actividades principales (2 PV cada una)
  daily_steps INTEGER DEFAULT 0,
  steps_goal_reached BOOLEAN DEFAULT FALSE,
  training_block_completed BOOLEAN DEFAULT FALSE,
  active_pause_completed BOOLEAN DEFAULT FALSE,
  meditation_completed BOOLEAN DEFAULT FALSE,

  -- Puntos del día
  main_activities_points INTEGER DEFAULT 0,
  extra_activities_points INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_daily_vitality_user_date ON daily_vitality(user_id, date);
CREATE INDEX IF NOT EXISTS idx_daily_vitality_date ON daily_vitality(date);

-- ============================================================================
-- TABLA: meditation_sessions (crear si no existe, luego actualizar)
-- ============================================================================

-- Crear tabla base si no existe
CREATE TABLE IF NOT EXISTS meditation_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user ON meditation_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_meditation_sessions_date ON meditation_sessions(session_date);

-- Agregar columna vitality_points si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meditation_sessions' AND column_name='vitality_points') THEN
    ALTER TABLE meditation_sessions ADD COLUMN vitality_points INTEGER DEFAULT 1;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meditation_sessions' AND column_name='date') THEN
    ALTER TABLE meditation_sessions ADD COLUMN date DATE;
  END IF;
END $$;

-- Actualizar sesiones existentes sin fecha (solo si existe columna completed_at del sistema anterior)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='meditation_sessions' AND column_name='completed_at') THEN
    EXECUTE 'UPDATE meditation_sessions SET date = DATE(completed_at) WHERE date IS NULL';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_meditation_sessions_user_date ON meditation_sessions(user_id, date);

-- ============================================================================
-- TABLA: step_counts (crear si no existe, luego actualizar)
-- ============================================================================

-- Crear tabla base si no existe
CREATE TABLE IF NOT EXISTS step_counts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  step_count INTEGER NOT NULL DEFAULT 0 CHECK (step_count >= 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, date)
);

CREATE INDEX IF NOT EXISTS idx_step_counts_user ON step_counts(user_id);
CREATE INDEX IF NOT EXISTS idx_step_counts_date ON step_counts(date);

-- Agregar columna vitality_points si no existe
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='step_counts' AND column_name='vitality_points') THEN
    ALTER TABLE step_counts ADD COLUMN vitality_points INTEGER DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='step_counts' AND column_name='goal_reached') THEN
    ALTER TABLE step_counts ADD COLUMN goal_reached BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- ============================================================================
-- FUNCIONES AUXILIARES
-- ============================================================================

-- Función: Calcular Puntos de Vitalidad por METs
CREATE OR REPLACE FUNCTION calculate_vitality_points_from_mets(
  p_mets DECIMAL,
  p_duration_minutes INTEGER
)
RETURNS INTEGER AS $$
DECLARE
  total_mets DECIMAL;
  vitality_points INTEGER;
BEGIN
  -- Total METs = METs × minutos
  total_mets := p_mets * p_duration_minutes;

  -- Cada 2 METs = 1 Punto de Vitalidad
  vitality_points := FLOOR(total_mets / 2);

  RETURN vitality_points;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Función: Actualizar nivel de vitalidad del avatar
CREATE OR REPLACE FUNCTION update_avatar_vitality_level(
  p_user_id UUID
)
RETURNS VOID AS $$
DECLARE
  v_weekly_goal INTEGER;
  v_weekly_points INTEGER;
  v_percentage DECIMAL;
  v_new_level INTEGER;
  v_effects JSONB;
BEGIN
  -- Obtener objetivo semanal
  SELECT weekly_vitality_goal INTO v_weekly_goal
  FROM users WHERE id = p_user_id;

  -- Obtener puntos de la semana actual
  SELECT COALESCE(SUM(total_points), 0) INTO v_weekly_points
  FROM daily_vitality
  WHERE user_id = p_user_id
    AND date >= DATE_TRUNC('week', CURRENT_DATE)
    AND date < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '7 days';

  -- Calcular porcentaje
  IF v_weekly_goal > 0 THEN
    v_percentage := (v_weekly_points::DECIMAL / v_weekly_goal) * 100;
  ELSE
    v_percentage := 0;
  END IF;

  -- Determinar nivel según PRD
  IF v_percentage = 0 THEN
    v_new_level := 1;
    v_effects := '{"glow": 0, "posture": "slouched", "brightness": 50}'::jsonb;
  ELSIF v_percentage <= 20 THEN
    v_new_level := 1;
    v_effects := '{"glow": 0, "posture": "slouched", "brightness": 60}'::jsonb;
  ELSIF v_percentage <= 50 THEN
    v_new_level := 2;
    v_effects := '{"glow": 1, "posture": "normal", "brightness": 80}'::jsonb;
  ELSIF v_percentage <= 80 THEN
    v_new_level := 3;
    v_effects := '{"glow": 2, "posture": "upright", "brightness": 100}'::jsonb;
  ELSIF v_percentage <= 100 THEN
    v_new_level := 4;
    v_effects := '{"glow": 3, "posture": "perfect", "brightness": 120}'::jsonb;
  ELSE
    v_new_level := 5;
    v_effects := '{"glow": 4, "posture": "perfect", "brightness": 150, "special": "golden"}'::jsonb;
  END IF;

  -- Actualizar avatar
  UPDATE user_avatars
  SET vitality_level = v_new_level,
      evolution_effects = v_effects,
      last_evolution_update = CURRENT_TIMESTAMP
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Función: Verificar y desbloquear logros
CREATE OR REPLACE FUNCTION check_and_unlock_achievements(
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_unlocked_count INTEGER := 0;
  v_achievement RECORD;
BEGIN
  -- Iterar sobre logros activos no desbloqueados
  FOR v_achievement IN
    SELECT a.*
    FROM achievements a
    WHERE a.is_active = TRUE
      AND NOT EXISTS (
        SELECT 1 FROM user_achievements ua
        WHERE ua.user_id = p_user_id AND ua.achievement_id = a.id
      )
  LOOP
    -- Aquí irían las condiciones específicas para cada logro
    -- Por ahora, se deja como placeholder
    NULL;
  END LOOP;

  RETURN v_unlocked_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger: Actualizar updated_at en daily_vitality
CREATE OR REPLACE FUNCTION update_daily_vitality_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_daily_vitality_timestamp ON daily_vitality;
CREATE TRIGGER trigger_update_daily_vitality_timestamp
  BEFORE UPDATE ON daily_vitality
  FOR EACH ROW
  EXECUTE FUNCTION update_daily_vitality_timestamp();

-- Trigger: Actualizar total_vitality_points en users
CREATE OR REPLACE FUNCTION update_user_total_vitality()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET total_vitality_points = (
    SELECT COALESCE(SUM(total_points), 0)
    FROM daily_vitality
    WHERE user_id = NEW.user_id
  )
  WHERE id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_user_total_vitality ON daily_vitality;
CREATE TRIGGER trigger_update_user_total_vitality
  AFTER INSERT OR UPDATE ON daily_vitality
  FOR EACH ROW
  EXECUTE FUNCTION update_user_total_vitality();

-- ============================================================================
-- FUNCIÓN AUXILIAR: has_admin_role
-- ============================================================================

-- Crear función para verificar si el usuario actual tiene rol de administrador
CREATE OR REPLACE FUNCTION public.has_admin_role()
RETURNS BOOLEAN AS $$
BEGIN
  -- Si existe la tabla user_roles y admin_roles, verificar si el usuario es admin
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_roles') AND
     EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'admin_roles') THEN
    RETURN EXISTS (
      SELECT 1
      FROM user_roles ur
      INNER JOIN admin_roles ar ON ur.role_id = ar.id
      WHERE ur.user_id = auth.uid()
      AND ar.role_name = 'super_admin'
    );
  ELSE
    -- Si no existe el sistema de roles, retornar FALSE por seguridad
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- activities_catalog
ALTER TABLE activities_catalog ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "activities_catalog_select_all" ON activities_catalog;
CREATE POLICY "activities_catalog_select_all" ON activities_catalog FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "activities_catalog_admin_all" ON activities_catalog;
CREATE POLICY "activities_catalog_admin_all" ON activities_catalog FOR ALL USING (public.has_admin_role());

-- user_activities
ALTER TABLE user_activities ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_activities_own" ON user_activities;
CREATE POLICY "user_activities_own" ON user_activities FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_activities_admin" ON user_activities;
CREATE POLICY "user_activities_admin" ON user_activities FOR ALL USING (public.has_admin_role());

-- training_blocks
ALTER TABLE training_blocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "training_blocks_select_all" ON training_blocks;
CREATE POLICY "training_blocks_select_all" ON training_blocks FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "training_blocks_admin_all" ON training_blocks;
CREATE POLICY "training_blocks_admin_all" ON training_blocks FOR ALL USING (public.has_admin_role());

-- user_training_sessions
ALTER TABLE user_training_sessions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_training_sessions_own" ON user_training_sessions;
CREATE POLICY "user_training_sessions_own" ON user_training_sessions FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_training_sessions_admin" ON user_training_sessions;
CREATE POLICY "user_training_sessions_admin" ON user_training_sessions FOR ALL USING (public.has_admin_role());

-- evaluations
ALTER TABLE evaluations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "evaluations_own" ON evaluations;
CREATE POLICY "evaluations_own" ON evaluations FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "evaluations_update_own" ON evaluations;
CREATE POLICY "evaluations_update_own" ON evaluations FOR UPDATE USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "evaluations_admin" ON evaluations;
CREATE POLICY "evaluations_admin" ON evaluations FOR ALL USING (public.has_admin_role());

-- vitality_points_history
ALTER TABLE vitality_points_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "vitality_history_own" ON vitality_points_history;
CREATE POLICY "vitality_history_own" ON vitality_points_history FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "vitality_history_admin" ON vitality_points_history;
CREATE POLICY "vitality_history_admin" ON vitality_points_history FOR ALL USING (public.has_admin_role());

-- achievements
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "achievements_select_all" ON achievements;
CREATE POLICY "achievements_select_all" ON achievements FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "achievements_admin_all" ON achievements;
CREATE POLICY "achievements_admin_all" ON achievements FOR ALL USING (public.has_admin_role());

-- user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "user_achievements_own" ON user_achievements;
CREATE POLICY "user_achievements_own" ON user_achievements FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "user_achievements_admin" ON user_achievements;
CREATE POLICY "user_achievements_admin" ON user_achievements FOR ALL USING (public.has_admin_role());

-- daily_vitality
ALTER TABLE daily_vitality ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "daily_vitality_own" ON daily_vitality;
CREATE POLICY "daily_vitality_own" ON daily_vitality FOR ALL USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "daily_vitality_admin" ON daily_vitality;
CREATE POLICY "daily_vitality_admin" ON daily_vitality FOR ALL USING (public.has_admin_role());

-- ============================================================================
-- COMENTARIOS
-- ============================================================================

COMMENT ON TABLE activities_catalog IS 'Catálogo de 50+ actividades cotidianas con valores METs';
COMMENT ON TABLE user_activities IS 'Registro de actividades completadas por usuarios';
COMMENT ON TABLE training_blocks IS 'Bloques de entrenamiento de 10 minutos';
COMMENT ON TABLE user_training_sessions IS 'Sesiones de entrenamiento completadas';
COMMENT ON TABLE evaluations IS 'Evaluaciones de salud: IMC, PARQ+, IPAQ, PSS-10, WHOQOL-BREF';
COMMENT ON TABLE vitality_points_history IS 'Historial semanal de Puntos de Vitalidad';
COMMENT ON TABLE achievements IS 'Logros desbloqueables del sistema';
COMMENT ON TABLE user_achievements IS 'Logros desbloqueados por cada usuario';
COMMENT ON TABLE daily_vitality IS 'Registro diario de actividades principales y puntos de vitalidad';

-- ============================================================================
-- FIN DE MIGRACIÓN V2.0
-- ============================================================================
