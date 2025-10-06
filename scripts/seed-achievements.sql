-- ============================================================================
-- SEED: Sistema de Logros y Recompensas
-- Academia de Hábitos Saludables
-- ============================================================================

-- Limpiar datos existentes
TRUNCATE TABLE achievements RESTART IDENTITY CASCADE;

-- ============================================================================
-- CATEGORÍA: INICIO Y PRIMERA EXPERIENCIA
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('Primer Paso', 'Completa tu primera actividad en la app', '👣', 'inicio', '{"type": "first_activity"}', 5),
('Bienvenido', 'Registra tus primeros pasos del día', '👋', 'inicio', '{"type": "first_steps"}', 5),
('Avatar Activo', 'Personaliza tu avatar por primera vez', '😊', 'inicio', '{"type": "create_avatar"}', 5);

-- ============================================================================
-- CATEGORÍA: CONSTANCIA Y RACHA
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('Consistente', 'Completa actividad durante 3 días consecutivos', '🔥', 'constancia', '{"type": "streak", "days": 3}', 10),
('Semana Completa', 'Completa al menos una actividad 7 días seguidos', '📅', 'constancia', '{"type": "streak", "days": 7}', 20),
('Dos Semanas', 'Mantén una racha de 14 días consecutivos', '💪', 'constancia', '{"type": "streak", "days": 14}', 30),
('Un Mes Imparable', '30 días consecutivos con actividad', '🏆', 'constancia', '{"type": "streak", "days": 30}', 50),
('Dos Meses Legendario', '60 días consecutivos con actividad', '👑', 'constancia', '{"type": "streak", "days": 60}', 100),
('Tres Meses Élite', '90 días consecutivos con actividad', '💎', 'constancia', '{"type": "streak", "days": 90}', 150);

-- ============================================================================
-- CATEGORÍA: PUNTOS DE VITALIDAD SEMANALES
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('Meta Cumplida', 'Alcanza tu meta semanal de Puntos de Vitalidad', '🎯', 'puntos_semanales', '{"type": "weekly_goal", "times": 1}', 10),
('Superación', 'Supera tu meta semanal en un 120%', '⭐', 'puntos_semanales', '{"type": "weekly_goal_percent", "percent": 120}', 15),
('Imparable', 'Alcanza tu meta semanal durante 4 semanas seguidas', '🚀', 'puntos_semanales', '{"type": "weekly_goal_streak", "weeks": 4}', 40),
('Campeón Mensual', 'Alcanza tu meta semanal durante todo un mes', '🏅', 'puntos_semanales', '{"type": "weekly_goal_streak", "weeks": 4}', 50);

-- ============================================================================
-- CATEGORÍA: PASOS DIARIOS
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('Primer Kilómetro', 'Alcanza 1,000 pasos en un día', '👟', 'pasos', '{"type": "daily_steps", "steps": 1000}', 5),
('5K Caminante', 'Alcanza 5,000 pasos en un día', '🚶', 'pasos', '{"type": "daily_steps", "steps": 5000}', 10),
('Meta de Pasos', 'Alcanza tu meta diaria de pasos', '🎯', 'pasos', '{"type": "daily_steps_goal"}', 10),
('10K Master', 'Alcanza 10,000 pasos en un día', '🏃', 'pasos', '{"type": "daily_steps", "steps": 10000}', 15),
('15K Dedicado', 'Alcanza 15,000 pasos en un día', '💪', 'pasos', '{"type": "daily_steps", "steps": 15000}', 20),
('Maratonista Urbano', 'Alcanza 20,000 pasos en un día', '🏆', 'pasos', '{"type": "daily_steps", "steps": 20000}', 30);

-- ============================================================================
-- CATEGORÍA: ENTRENAMIENTO
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('Primer Bloque', 'Completa tu primer bloque de entrenamiento', '💪', 'entrenamiento', '{"type": "training_blocks", "count": 1}', 5),
('Guerrero del Entrenamiento', 'Completa 10 bloques de entrenamiento', '⚔️', 'entrenamiento', '{"type": "training_blocks", "count": 10}', 20),
('Maestro del Entrenamiento', 'Completa 50 bloques de entrenamiento', '🥋', 'entrenamiento', '{"type": "training_blocks", "count": 50}', 50),
('HIIT Lover', 'Completa 10 bloques de HIIT', '🔥', 'entrenamiento', '{"type": "training_type", "training_type": "hiit", "count": 10}', 25),
('Fuerza Total', 'Completa 10 bloques de fuerza', '🏋️', 'entrenamiento', '{"type": "training_type", "training_type": "strength", "count": 10}', 25);

-- ============================================================================
-- CATEGORÍA: VARIEDAD Y EXPLORACIÓN
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('Explorador', 'Prueba 5 actividades diferentes', '🔍', 'variedad', '{"type": "different_activities", "count": 5}', 10),
('Versátil', 'Prueba 10 actividades diferentes', '🌈', 'variedad', '{"type": "different_activities", "count": 10}', 20),
('Maestro de Todas', 'Prueba 20 actividades diferentes', '🎭', 'variedad', '{"type": "different_activities", "count": 20}', 40),
('Coleccionista', 'Prueba al menos una actividad de cada categoría', '📚', 'variedad', '{"type": "all_categories"}', 30);

-- ============================================================================
-- CATEGORÍA: BIENESTAR MENTAL
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('Primera Respiración', 'Completa tu primera sesión de meditación', '🧘', 'bienestar', '{"type": "meditation_sessions", "count": 1}', 5),
('Mente Zen', 'Completa 10 sesiones de meditación', '☮️', 'bienestar', '{"type": "meditation_sessions", "count": 10}', 20),
('Maestro del Mindfulness', 'Completa 30 sesiones de meditación', '🕉️', 'bienestar', '{"type": "meditation_sessions", "count": 30}', 40);

-- ============================================================================
-- CATEGORÍA: MADRUGADOR Y HÁBITOS
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('Madrugador', 'Completa una actividad antes de las 8am durante 5 días', '🌅', 'habitos', '{"type": "early_activity", "days": 5, "hour": 8}', 15),
('Noctámbulo Activo', 'Completa una actividad después de las 8pm durante 5 días', '🌙', 'habitos', '{"type": "night_activity", "days": 5, "hour": 20}', 15),
('Fin de Semana Activo', 'Completa actividades durante 4 fines de semana consecutivos', '🎉', 'habitos', '{"type": "weekend_active", "weekends": 4}', 20);

-- ============================================================================
-- CATEGORÍA: PROGRESO Y MEJORA
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('Evolución Nivel 1', 'Alcanza nivel de vitalidad 2 en tu avatar', '⬆️', 'progreso', '{"type": "avatar_level", "level": 2}', 10),
('Evolución Nivel 2', 'Alcanza nivel de vitalidad 3 en tu avatar', '⬆️', 'progreso', '{"type": "avatar_level", "level": 3}', 15),
('Evolución Nivel 3', 'Alcanza nivel de vitalidad 4 en tu avatar', '⬆️', 'progreso', '{"type": "avatar_level", "level": 4}', 20),
('Avatar Dorado', 'Alcanza nivel de vitalidad 5 (premium) en tu avatar', '✨', 'progreso', '{"type": "avatar_level", "level": 5}', 30),
('Adaptación Completa', 'Completa una evaluación IPAQ y alcanza nivel Activación', '📈', 'progreso', '{"type": "level_up", "from": 1, "to": 2}', 25),
('Activación Completa', 'Completa una evaluación IPAQ y alcanza nivel Consolidación', '📈', 'progreso', '{"type": "level_up", "from": 2, "to": 3}', 40);

-- ============================================================================
-- CATEGORÍA: PUNTOS TOTALES
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('100 Puntos', 'Acumula 100 Puntos de Vitalidad totales', '💯', 'puntos_totales', '{"type": "total_points", "points": 100}', 10),
('500 Puntos', 'Acumula 500 Puntos de Vitalidad totales', '🌟', 'puntos_totales', '{"type": "total_points", "points": 500}', 25),
('1000 Puntos', 'Acumula 1,000 Puntos de Vitalidad totales', '⭐', 'puntos_totales', '{"type": "total_points", "points": 1000}', 50),
('5000 Puntos', 'Acumula 5,000 Puntos de Vitalidad totales', '🌠', 'puntos_totales', '{"type": "total_points", "points": 5000}', 100),
('Leyenda 10K', 'Acumula 10,000 Puntos de Vitalidad totales', '👑', 'puntos_totales', '{"type": "total_points", "points": 10000}', 200);

-- ============================================================================
-- CATEGORÍA: ESPECIALES Y TEMPORALES
-- ============================================================================

INSERT INTO achievements (name, description, icon, category, requirement, points_reward) VALUES
('Perfeccionista', 'Completa las 4 actividades principales en un mismo día', '💎', 'especial', '{"type": "perfect_day"}', 20),
('Semana Perfecta', 'Completa las 4 actividades principales durante 7 días seguidos', '🏆', 'especial', '{"type": "perfect_week"}', 50),
('Social', 'Invita a 3 amigos que completen su primera actividad', '👥', 'especial', '{"type": "referrals", "count": 3}', 30);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  total_count INTEGER;
  inicio_count INTEGER;
  constancia_count INTEGER;
  puntos_count INTEGER;
  pasos_count INTEGER;
  entrenamiento_count INTEGER;
  variedad_count INTEGER;
  bienestar_count INTEGER;
  habitos_count INTEGER;
  progreso_count INTEGER;
  totales_count INTEGER;
  especial_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM achievements;
  SELECT COUNT(*) INTO inicio_count FROM achievements WHERE category = 'inicio';
  SELECT COUNT(*) INTO constancia_count FROM achievements WHERE category = 'constancia';
  SELECT COUNT(*) INTO puntos_count FROM achievements WHERE category = 'puntos_semanales';
  SELECT COUNT(*) INTO pasos_count FROM achievements WHERE category = 'pasos';
  SELECT COUNT(*) INTO entrenamiento_count FROM achievements WHERE category = 'entrenamiento';
  SELECT COUNT(*) INTO variedad_count FROM achievements WHERE category = 'variedad';
  SELECT COUNT(*) INTO bienestar_count FROM achievements WHERE category = 'bienestar';
  SELECT COUNT(*) INTO habitos_count FROM achievements WHERE category = 'habitos';
  SELECT COUNT(*) INTO progreso_count FROM achievements WHERE category = 'progreso';
  SELECT COUNT(*) INTO totales_count FROM achievements WHERE category = 'puntos_totales';
  SELECT COUNT(*) INTO especial_count FROM achievements WHERE category = 'especial';

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SEED ACHIEVEMENTS - RESUMEN';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total de logros: %', total_count;
  RAISE NOTICE 'Inicio: %', inicio_count;
  RAISE NOTICE 'Constancia: %', constancia_count;
  RAISE NOTICE 'Puntos Semanales: %', puntos_count;
  RAISE NOTICE 'Pasos: %', pasos_count;
  RAISE NOTICE 'Entrenamiento: %', entrenamiento_count;
  RAISE NOTICE 'Variedad: %', variedad_count;
  RAISE NOTICE 'Bienestar: %', bienestar_count;
  RAISE NOTICE 'Hábitos: %', habitos_count;
  RAISE NOTICE 'Progreso: %', progreso_count;
  RAISE NOTICE 'Puntos Totales: %', totales_count;
  RAISE NOTICE 'Especiales: %', especial_count;
  RAISE NOTICE '==============================================';
END $$;

-- ============================================================================
-- FIN DEL SEED
-- ============================================================================
