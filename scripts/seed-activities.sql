-- ============================================================================
-- SEED: Catálogo de 50+ Actividades con METs
-- Academia de Hábitos Saludables
-- ============================================================================

-- Limpiar datos existentes
TRUNCATE TABLE activities_catalog RESTART IDENTITY CASCADE;

-- ============================================================================
-- CATEGORÍA: HOGAR (15 actividades)
-- ============================================================================

INSERT INTO activities_catalog (name, category, mets, description, icon) VALUES
('Limpiar ventanas', 'hogar', 3.5, 'Limpieza de ventanas y cristales', '🪟'),
('Pasar aspiradora', 'hogar', 3.5, 'Aspirar alfombras y suelos', '🧹'),
('Barrer', 'hogar', 3.5, 'Barrer pisos y superficies', '🧹'),
('Trapear', 'hogar', 3.5, 'Trapear pisos con agua', '🧽'),
('Cocinar activamente', 'hogar', 3.5, 'Cocinar de pie, preparando alimentos', '👨‍🍳'),
('Jardinería', 'hogar', 4.0, 'Cultivar plantas, podar, regar', '🌱'),
('Lavar el auto', 'hogar', 4.0, 'Lavar y encerar el automóvil', '🚗'),
('Tender ropa', 'hogar', 3.5, 'Colgar ropa en tendedero', '👕'),
('Limpiar baño', 'hogar', 4.0, 'Limpieza profunda del baño', '🚽'),
('Ordenar y organizar', 'hogar', 3.5, 'Organizar armarios y espacios', '📦'),
('Lavar platos manualmente', 'hogar', 3.5, 'Fregar platos y utensilios', '🍽️'),
('Sacar basura y reciclar', 'hogar', 3.5, 'Llevar basura y separar reciclaje', '♻️'),
('Planchar ropa', 'hogar', 3.5, 'Planchar prendas de vestir', '👔'),
('Mudanza/mover muebles', 'hogar', 5.0, 'Cargar y mover objetos pesados', '📦'),
('Pintar paredes', 'hogar', 4.0, 'Pintura de interiores o exteriores', '🎨');

-- ============================================================================
-- CATEGORÍA: TRANSPORTE (12 actividades)
-- ============================================================================

INSERT INTO activities_catalog (name, category, mets, description, icon) VALUES
('Caminar lento (3 km/h)', 'transporte', 3.5, 'Caminar a paso tranquilo', '🚶'),
('Caminar moderado (5 km/h)', 'transporte', 3.8, 'Caminar a paso regular', '🚶‍♂️'),
('Caminar rápido (6 km/h)', 'transporte', 4.3, 'Caminar a paso acelerado', '🏃'),
('Caminar cuesta arriba', 'transporte', 5.0, 'Caminar en pendiente o subida', '⛰️'),
('Subir escaleras', 'transporte', 8.0, 'Subir escaleras a pie', '🪜'),
('Bajar escaleras', 'transporte', 3.5, 'Bajar escaleras a pie', '🪜'),
('Andar en bicicleta casual', 'transporte', 4.0, 'Ciclismo recreativo o traslado', '🚴'),
('Andar en bicicleta moderado', 'transporte', 6.0, 'Ciclismo a ritmo moderado', '🚴‍♀️'),
('Andar en bicicleta rápido', 'transporte', 8.0, 'Ciclismo intenso o competitivo', '🚴‍♂️'),
('Correr lento (8 km/h)', 'transporte', 8.0, 'Trotar o correr despacio', '🏃‍♀️'),
('Correr moderado (10 km/h)', 'transporte', 10.0, 'Correr a ritmo medio', '🏃'),
('Correr rápido (12+ km/h)', 'transporte', 12.0, 'Correr a alta velocidad', '💨');

-- ============================================================================
-- CATEGORÍA: TRABAJO (10 actividades)
-- ============================================================================

INSERT INTO activities_catalog (name, category, mets, description, icon) VALUES
('Trabajo de oficina de pie', 'trabajo', 3.5, 'Trabajar en escritorio de pie', '💼'),
('Cargar cajas ligeras', 'trabajo', 4.0, 'Mover cajas de peso moderado', '📦'),
('Trabajo de construcción ligero', 'trabajo', 4.5, 'Tareas de construcción moderadas', '🔨'),
('Trabajo de construcción pesado', 'trabajo', 6.0, 'Tareas de construcción intensas', '👷'),
('Carpintería', 'trabajo', 4.5, 'Trabajos de carpintería general', '🪚'),
('Albañilería', 'trabajo', 5.0, 'Trabajos de albañilería y mampostería', '🧱'),
('Agricultura/granja', 'trabajo', 5.5, 'Trabajos agrícolas y ganaderos', '🌾'),
('Mensajería/delivery caminando', 'trabajo', 4.0, 'Reparto a pie con carga ligera', '📦'),
('Limpieza profesional', 'trabajo', 4.5, 'Servicios de limpieza intensiva', '🧹'),
('Mudanzas profesionales', 'trabajo', 6.0, 'Cargar y trasladar muebles pesados', '🚛');

-- ============================================================================
-- CATEGORÍA: RECREACIÓN (15 actividades)
-- ============================================================================

INSERT INTO activities_catalog (name, category, mets, description, icon) VALUES
('Bailar moderado', 'recreacion', 4.5, 'Baile social o recreativo', '💃'),
('Bailar intenso', 'recreacion', 6.0, 'Baile aeróbico o zumba', '🕺'),
('Jugar con niños activo', 'recreacion', 4.0, 'Juegos activos con niños', '🧒'),
('Pasear perro', 'recreacion', 3.5, 'Caminar con mascota', '🐕'),
('Yoga suave', 'recreacion', 3.5, 'Yoga de relajación o principiantes', '🧘'),
('Yoga moderado', 'recreacion', 4.0, 'Vinyasa o power yoga', '🧘‍♀️'),
('Natación recreativa', 'recreacion', 5.0, 'Nadar a ritmo suave', '🏊'),
('Natación intensa', 'recreacion', 8.0, 'Nadar con esfuerzo moderado-alto', '🏊‍♂️'),
('Tenis recreativo', 'recreacion', 5.0, 'Tenis de dobles o recreativo', '🎾'),
('Tenis competitivo', 'recreacion', 8.0, 'Tenis de singles intenso', '🎾'),
('Fútbol recreativo', 'recreacion', 7.0, 'Jugar fútbol casualmente', '⚽'),
('Básquetbol recreativo', 'recreacion', 6.0, 'Jugar baloncesto casualmente', '🏀'),
('Voleibol', 'recreacion', 4.0, 'Jugar voleibol recreativo', '🏐'),
('Golf caminando', 'recreacion', 4.5, 'Golf sin carrito, cargando palos', '⛳'),
('Senderismo', 'recreacion', 5.0, 'Caminata por senderos naturales', '🥾');

-- ============================================================================
-- CATEGORÍA: EJERCICIO (8 actividades)
-- ============================================================================

INSERT INTO activities_catalog (name, category, mets, description, icon) VALUES
('Estiramientos', 'ejercicio', 3.5, 'Ejercicios de flexibilidad', '🤸'),
('Pilates', 'ejercicio', 4.0, 'Entrenamiento de pilates', '🧘‍♀️'),
('Entrenamiento de fuerza ligero', 'ejercicio', 4.5, 'Pesas ligeras o bandas', '💪'),
('Entrenamiento de fuerza moderado', 'ejercicio', 6.0, 'Pesas moderadas con intensidad', '🏋️'),
('Entrenamiento de fuerza intenso', 'ejercicio', 8.0, 'Levantamiento de pesas pesado', '🏋️‍♂️'),
('Aeróbicos/step', 'ejercicio', 7.0, 'Clase de aeróbicos o step', '🤸‍♀️'),
('Spinning/bicicleta estática', 'ejercicio', 7.0, 'Clase de spinning moderado', '🚴'),
('Saltar la cuerda', 'ejercicio', 11.0, 'Saltar cuerda continuo', '🪢');

-- ============================================================================
-- ACTIVIDADES ADICIONALES
-- ============================================================================

INSERT INTO activities_catalog (name, category, mets, description, icon) VALUES
('Patinar', 'recreacion', 5.0, 'Patinaje recreativo', '⛸️'),
('Esquiar (nieve)', 'recreacion', 7.0, 'Esquí recreativo', '⛷️'),
('Remar en kayak', 'recreacion', 5.0, 'Remar en kayak o canoa', '🛶'),
('Escalada deportiva', 'recreacion', 8.0, 'Escalar paredes o rocas', '🧗'),
('Boxeo (saco)', 'ejercicio', 7.0, 'Golpear saco de boxeo', '🥊');

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Contar actividades por categoría
DO $$
DECLARE
  total_count INTEGER;
  hogar_count INTEGER;
  transporte_count INTEGER;
  trabajo_count INTEGER;
  recreacion_count INTEGER;
  ejercicio_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO total_count FROM activities_catalog;
  SELECT COUNT(*) INTO hogar_count FROM activities_catalog WHERE category = 'hogar';
  SELECT COUNT(*) INTO transporte_count FROM activities_catalog WHERE category = 'transporte';
  SELECT COUNT(*) INTO trabajo_count FROM activities_catalog WHERE category = 'trabajo';
  SELECT COUNT(*) INTO recreacion_count FROM activities_catalog WHERE category = 'recreacion';
  SELECT COUNT(*) INTO ejercicio_count FROM activities_catalog WHERE category = 'ejercicio';

  RAISE NOTICE '==============================================';
  RAISE NOTICE 'SEED ACTIVITIES - RESUMEN';
  RAISE NOTICE '==============================================';
  RAISE NOTICE 'Total de actividades: %', total_count;
  RAISE NOTICE 'Hogar: %', hogar_count;
  RAISE NOTICE 'Transporte: %', transporte_count;
  RAISE NOTICE 'Trabajo: %', trabajo_count;
  RAISE NOTICE 'Recreación: %', recreacion_count;
  RAISE NOTICE 'Ejercicio: %', ejercicio_count;
  RAISE NOTICE '==============================================';
END $$;

-- ============================================================================
-- FIN DEL SEED
-- ============================================================================
