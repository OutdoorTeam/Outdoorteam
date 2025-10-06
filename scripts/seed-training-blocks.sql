-- ============================================================================
-- SEED: Bloques de Entrenamiento de 10 Minutos
-- Academia de Hábitos Saludables
-- ============================================================================

-- Limpiar datos existentes
TRUNCATE TABLE training_blocks RESTART IDENTITY CASCADE;

-- ============================================================================
-- TIPO: HIIT (Alta Intensidad) - 3 PV
-- ============================================================================

INSERT INTO training_blocks (title, type, duration_minutes, intensity, video_url, description, vitality_points, min_activity_level, sort_order) VALUES
('HIIT Básico para Principiantes', 'hiit', 10, 'medium', '',
 'Entrenamiento de intervalos de alta intensidad adaptado para principiantes. Combina ejercicios cardiovasculares con descansos activos.',
 3.0, 1, 1),

('HIIT Tabata Clásico', 'hiit', 10, 'high', '',
 'Protocolo Tabata: 20 seg trabajo / 10 seg descanso x 8 rondas. Quema máxima de calorías.',
 3.0, 2, 2),

('HIIT Full Body', 'hiit', 10, 'high', '',
 'Entrenamiento de cuerpo completo con intervalos intensos. Ideal para activar todo el metabolismo.',
 3.0, 2, 3),

('HIIT Cardio Sin Saltos', 'hiit', 10, 'medium', '',
 'HIIT de bajo impacto para personas con problemas articulares. Igual de efectivo, sin saltos.',
 3.0, 1, 4),

('HIIT Avanzado Explosivo', 'hiit', 10, 'high', '',
 'Entrenamiento de alta intensidad para usuarios avanzados. Movimientos explosivos y potencia máxima.',
 3.0, 3, 5);

-- ============================================================================
-- TIPO: FUERZA (Tonificación) - 2.5 PV
-- ============================================================================

INSERT INTO training_blocks (title, type, duration_minutes, intensity, video_url, description, vitality_points, min_activity_level, sort_order) VALUES
('Fuerza: Tren Superior', 'strength', 10, 'medium', '',
 'Fortalecimiento de brazos, hombros y espalda. Solo necesitas tu peso corporal.',
 2.5, 1, 10),

('Fuerza: Tren Inferior', 'strength', 10, 'medium', '',
 'Ejercicios para piernas y glúteos. Sentadillas, zancadas y variaciones.',
 2.5, 1, 11),

('Fuerza: Core y Abdominales', 'strength', 10, 'medium', '',
 'Fortalecimiento del núcleo. Planchas, abdominales y estabilidad.',
 2.5, 1, 12),

('Fuerza: Full Body', 'strength', 10, 'medium', '',
 'Entrenamiento de cuerpo completo con ejercicios funcionales.',
 2.5, 2, 13),

('Fuerza: Resistencia Muscular', 'strength', 10, 'medium', '',
 'Circuito de resistencia para mejorar la fuerza-resistencia de todo el cuerpo.',
 2.5, 2, 14),

('Fuerza con Mancuernas', 'strength', 10, 'medium', '',
 'Rutina con pesas ligeras o botellas de agua. Tonificación progresiva.',
 2.5, 2, 15);

-- ============================================================================
-- TIPO: AERÓBICO (Cardio Moderado) - 2 PV
-- ============================================================================

INSERT INTO training_blocks (title, type, duration_minutes, intensity, video_url, description, vitality_points, min_activity_level, sort_order) VALUES
('Cardio Dance', 'aerobic', 10, 'medium', '',
 'Baile aeróbico divertido y efectivo. Muévete al ritmo de la música.',
 2.0, 1, 20),

('Caminata Activa Indoor', 'aerobic', 10, 'low', '',
 'Caminata en casa con movimientos de brazos y elevación de rodillas.',
 2.0, 1, 21),

('Aeróbicos Clásicos', 'aerobic', 10, 'medium', '',
 'Rutina de aeróbicos estilo clásico con steps y coordinación.',
 2.0, 1, 22),

('Cardio Kickboxing', 'aerobic', 10, 'medium', '',
 'Combinación de movimientos de boxeo y patadas. Cardio + diversión.',
 2.0, 2, 23),

('Cardio Step', 'aerobic', 10, 'medium', '',
 'Rutina con step o escalón. Mejora coordinación y resistencia cardiovascular.',
 2.0, 2, 24);

-- ============================================================================
-- TIPO: ADULTOS MAYORES (Movilidad y Equilibrio) - 1.5 PV
-- ============================================================================

INSERT INTO training_blocks (title, type, duration_minutes, intensity, video_url, description, vitality_points, min_activity_level, sort_order) VALUES
('Movilidad para Mayores', 'seniors', 10, 'low', '',
 'Ejercicios suaves de movilidad articular y flexibilidad para adultos mayores.',
 1.5, 1, 30),

('Equilibrio y Estabilidad', 'seniors', 10, 'low', '',
 'Entrenamiento de equilibrio para prevenir caídas. Ejercicios de estabilidad.',
 1.5, 1, 31),

('Fuerza Funcional Mayores', 'seniors', 10, 'low', '',
 'Ejercicios de fuerza adaptados para adultos mayores. Mantén tu independencia.',
 1.5, 1, 32),

('Sentados Activos', 'seniors', 10, 'low', '',
 'Rutina completa que se puede hacer sentado. Ideal para movilidad reducida.',
 1.5, 1, 33),

('Caminata Guiada en Casa', 'seniors', 10, 'low', '',
 'Caminata estructurada con pausas y ejercicios de coordinación.',
 1.5, 1, 34);

-- ============================================================================
-- TIPO: ESTIRAMIENTOS (Flexibilidad) - 1 PV
-- ============================================================================

INSERT INTO training_blocks (title, type, duration_minutes, intensity, video_url, description, vitality_points, min_activity_level, sort_order) VALUES
('Estiramientos Matutinos', 'stretching', 10, 'low', '',
 'Despertar el cuerpo con estiramientos suaves. Perfecto para iniciar el día.',
 1.0, 1, 40),

('Estiramientos Nocturnos', 'stretching', 10, 'low', '',
 'Relaja el cuerpo antes de dormir con estiramientos calmantes.',
 1.0, 1, 41),

('Flexibilidad de Caderas', 'stretching', 10, 'low', '',
 'Estiramientos enfocados en caderas y zona lumbar. Reduce tensión.',
 1.0, 1, 42),

('Flexibilidad de Hombros', 'stretching', 10, 'low', '',
 'Alivio de tensión en hombros y cuello. Ideal después de trabajar.',
 1.0, 1, 43),

('Estiramientos Post-Entreno', 'stretching', 10, 'low', '',
 'Recuperación muscular con estiramientos después del ejercicio.',
 1.0, 1, 44),

('Yoga Estiramiento Completo', 'stretching', 10, 'low', '',
 'Secuencia de yoga enfocada en flexibilidad de todo el cuerpo.',
 1.0, 1, 45);

-- ============================================================================
-- TIPO: RELAJACIÓN (Reducción de Estrés) - 1 PV
-- ============================================================================

INSERT INTO training_blocks (title, type, duration_minutes, intensity, video_url, description, vitality_points, min_activity_level, sort_order) VALUES
('Respiración Consciente', 'relaxation', 10, 'low', '',
 'Ejercicios de respiración para reducir estrés y ansiedad.',
 1.0, 1, 50),

('Meditación Guiada', 'relaxation', 10, 'low', '',
 'Sesión de meditación para calmar la mente y encontrar paz interior.',
 1.0, 1, 51),

('Relajación Muscular Progresiva', 'relaxation', 10, 'low', '',
 'Técnica de relajación tensando y relajando grupos musculares.',
 1.0, 1, 52),

('Mindfulness Body Scan', 'relaxation', 10, 'low', '',
 'Escaneo corporal consciente para conectar con tu cuerpo.',
 1.0, 1, 53),

('Yoga Restaurativo', 'relaxation', 10, 'low', '',
 'Posturas de yoga suaves para restaurar energía y reducir tensión.',
 1.0, 1, 54);

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

DO $$
DECLARE
  total_count INTEGER;
  hiit_count INTEGER;
  strength_count INTEGER;
  aerobic_count INTEGER;
  seniors_count INTEGER;
  stretching_count INTEGER;
  relaxation_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM training_blocks;
  SELECT COUNT(*) INTO hiit_count FROM training_blocks WHERE type = 'hiit';
  SELECT COUNT(*) INTO strength_count FROM training_blocks WHERE type = 'strength';
  SELECT COUNT(*) INTO aerobic_count FROM training_blocks WHERE type = 'aerobic';
  SELECT COUNT(*) INTO seniors_count FROM training_blocks WHERE type = 'seniors';
  SELECT COUNT(*) INTO stretching_count FROM training_blocks WHERE type = 'stretching';
  SELECT COUNT(*) INTO relaxation_count FROM training_blocks WHERE type = 'relaxation';

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SEED TRAINING BLOCKS - RESUMEN';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total de bloques: %', total_count;
  RAISE NOTICE 'HIIT (3 PV): %', hiit_count;
  RAISE NOTICE 'Fuerza (2.5 PV): %', strength_count;
  RAISE NOTICE 'Aeróbico (2 PV): %', aerobic_count;
  RAISE NOTICE 'Adultos Mayores (1.5 PV): %', seniors_count;
  RAISE NOTICE 'Estiramientos (1 PV): %', stretching_count;
  RAISE NOTICE 'Relajación (1 PV): %', relaxation_count;
  RAISE NOTICE '==============================================';
END $$;

-- ============================================================================
-- FIN DEL SEED
-- ============================================================================
