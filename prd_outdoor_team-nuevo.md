# PRD - Outdoor Team Academia de Hábitos Saludables v2.0

## 1. Resumen Ejecutivo

**Outdoor Team** es una aplicación móvil (APK Android) que gamifica el bienestar integral mediante un sistema de **Puntos de Vitalidad**. Los usuarios mejoran su avatar personalizado completando actividades diarias, bloques de entrenamiento y evaluaciones periódicas, todo bajo la supervisión de entrenadores/administradores.

---

## 2. Objetivos del Producto

- Motivar hábitos saludables mediante gamificación con avatar evolutivo
- Cuantificar actividad física y bienestar mental con sistema de Puntos de Vitalidad
- Ofrecer planes personalizados según nivel de actividad física
- Crear comunidad en torno a la "Academia de Hábitos Saludables"
- Generar ingresos mediante suscripción de bajo costo post-prueba

---

## 3. Usuarios y Niveles

### 3.1 Tipos de Usuario
- **Usuario Regular**: Acceso a funcionalidades según nivel y suscripción
- **Entrenador/Admin**: Gestiona usuarios, asigna objetivos y habilita evaluaciones

### 3.2 Niveles de Actividad Física

| Nivel | Nombre Positivo | Descripción | Público Objetivo |
|-------|----------------|-------------|------------------|
| **1** | Adaptación | Comenzando el camino del movimiento | Adultos mayores, personas con obesidad, principiantes absolutos |
| **2** | Activación | Despertando el cuerpo | Trabajadores de oficina, sedentarios que buscan cambio |
| **3** | Consolidación | Manteniendo el impulso | Personas activas que buscan no volver al sedentarismo |

*Los niveles se determinan mediante evaluaciones PARQ+ e IPAQ*

---

## 4. Sistema de Puntos de Vitalidad

### 4.1 Reglas de Obtención

#### Actividades Físicas (METs)
- **Cada 2 METs acumulados = 1 Punto Vital**
- Se incluyen +50 actividades cotidianas con METs ≥ 3.5-4.0
- Ejemplos:
  - Caminar rápido (4 METs) × 30 min = 60 METs = 30 PV
  - Limpiar casa (3.5 METs) × 20 min = 70 METs = 35 PV
  - Subir escaleras (8 METs) × 10 min = 80 METs = 40 PV

#### Actividades de Bienestar Mental
- **Leer: 1 Punto Vital** (sin importar duración mínima razonable)
- **Meditar: 1 Punto Vital** (por sesión)

#### Las 4 Actividades Principales Diarias
Cada una suma **2 Puntos Vitales diarios**:
1. **Objetivo de Pasos** (según nivel del usuario)
2. **Bloque de Entrenamiento de 10 min**
3. **Pausa Activa**
4. **Meditación/Mindfulness**

#### Bloques de Entrenamiento
- **Cada bloque de 10 minutos completado**: Puntos según intensidad
  - HIIT: 3 PV
  - Fuerza: 2.5 PV
  - Aeróbico: 2 PV
  - Adultos mayores: 1.5 PV
  - Estiramientos/Relajación: 1 PV

### 4.2 Gestión de Puntos
- **Objetivo Semanal**: Asignado por el entrenador/admin según nivel
- **Reset Semanal**: Los puntos se reinician cada lunes
- **Acumulación Mensual**: Se registra el total mensual para estadísticas y logros
- **No hay pérdida de puntos**: Sistema 100% positivo

---

## 5. Sistema de Avatar

### 5.1 Creación Inicial
**Dos opciones de avatar:**
1. **Foto personalizada**: El usuario sube una foto y se genera un avatar 2D estilizado
2. **Personaje predefinido**: Elige entre 10 diseños diferentes en formato 2D

### 5.2 Personalización del Cuerpo
- El usuario puede ajustar el avatar para que refleje su IMC actual
- Proporciones corporales realistas y saludables (no caricaturizadas)
- Personalización de:
  - Complexión corporal
  - Tono muscular
  - Postura

### 5.3 Evolución del Avatar
**El avatar mejora con Puntos de Vitalidad acumulados:**

| Rango de PV Semanal | Estado del Avatar |
|---------------------|-------------------|
| 0-20% objetivo | Apagado, postura encorvada, colores apagados |
| 21-50% objetivo | Mejora gradual, más vitalidad |
| 51-80% objetivo | Postura erguida, colores vivos, energía visible |
| 81-100% objetivo | Radiante, postura perfecta, efectos de brillo |
| +100% objetivo | Avatar "premium" con efectos especiales dorados |

**Mejoras visuales progresivas:**
- Mejora de postura
- Aumento de brillo/luminosidad
- Cambios en expresión facial (más sonriente)
- Efectos de partículas (estrellas, brillo)
- Tono muscular más definido

---

## 6. Actividades del Día a Día (Catálogo METs)

### 6.1 Lista de 50+ Actividades

| Categoría | Actividad | METs | PV por 30 min |
|-----------|-----------|------|---------------|
| **Hogar** | Limpiar ventanas | 3.5 | 52.5 → 26 PV |
| | Pasar aspiradora | 3.5 | 52.5 → 26 PV |
| | Barrer | 3.5 | 52.5 → 26 PV |
| | Cocinar activamente | 3.5 | 52.5 → 26 PV |
| | Jardinería | 4.0 | 60 → 30 PV |
| | Lavar el auto | 4.0 | 60 → 30 PV |
| **Transporte** | Caminar (5 km/h) | 3.8 | 57 → 28 PV |
| | Caminar rápido (6 km/h) | 4.3 | 64.5 → 32 PV |
| | Subir escaleras | 8.0 | 120 → 60 PV |
| | Andar en bici (casual) | 4.0 | 60 → 30 PV |
| **Trabajo** | Trabajo de oficina de pie | 3.5 | 52.5 → 26 PV |
| | Cargar cajas ligeras | 4.0 | 60 → 30 PV |
| | Trabajo de construcción ligero | 4.5 | 67.5 → 33 PV |
| **Recreación** | Bailar (moderado) | 4.5 | 67.5 → 33 PV |
| | Jugar con niños (activo) | 4.0 | 60 → 30 PV |
| | Pasear perro | 3.5 | 52.5 → 26 PV |
| | Yoga suave | 3.5 | 52.5 → 26 PV |

*(Continuar hasta 50+ actividades en el catálogo final)*

### 6.2 Registro de Actividades

**Métodos de registro:**
1. **Manual**: Usuario selecciona actividad y duración del catálogo
2. **Notificación Inteligente**: Si detecta inactividad o cambio de movimiento, pregunta "¿Qué estás haciendo?"
3. **Integración con Dispositivos**: Si el usuario tiene smartwatch/banda, estima actividad por frecuencia cardíaca y movimiento

---

## 7. Evaluaciones Iniciales y Periódicas

### 7.1 Evaluaciones Implementadas

| Evaluación | Propósito | Frecuencia |
|------------|-----------|------------|
| **IMC** | Índice de Masa Corporal y categoría OMS | Habilitada por admin |
| **PAR-Q+** | Chequeo de aptitud para actividad física | Habilitada por admin |
| **IPAQ (corto)** | Clasificación de nivel de actividad (Bajo/Moderado/Alto) | Habilitada por admin |
| **PSS-10** | Escala de Estrés Percibido | Habilitada por admin |
| **WHOQOL-BREF** | Calidad de vida (físico, psicológico, social, ambiente) | Habilitada por admin |

### 7.2 Flujo de Evaluaciones
1. El admin habilita evaluación para un usuario específico
2. Usuario recibe notificación
3. Usuario completa evaluación en la app
4. Resultados se guardan y son visibles para usuario y admin
5. Admin puede comparar resultados históricos

### 7.3 Uso de Resultados
- **PAR-Q+ e IPAQ**: Determinan nivel de actividad (Adaptación/Activación/Consolidación)
- **IMC**: Ajusta configuración inicial del avatar
- **PSS-10 y WHOQOL-BREF**: Monitoreo del bienestar integral

---

## 8. Bloques de Entrenamiento de 10 Minutos

### 8.1 Tipos de Bloques

| Tipo | Intensidad | Objetivo | Puntos Vitales |
|------|-----------|----------|----------------|
| **HIIT** | Alta | Quema grasa, resistencia cardiovascular | 3 PV |
| **Fuerza** | Media-Alta | Tonificación muscular | 2.5 PV |
| **Aeróbico** | Media | Resistencia cardiovascular | 2 PV |
| **Adultos Mayores** | Baja-Media | Movilidad, equilibrio | 1.5 PV |
| **Estiramientos** | Baja | Flexibilidad | 1 PV |
| **Relajación** | Muy Baja | Reducción de estrés | 1 PV |

### 8.2 Características
- **Duración fija**: 10 minutos
- **Formato**: Videos/GIFs guiados con instrucciones
- **Adaptabilidad**: Filtros por nivel de usuario
- **Progresión**: Se desbloquean bloques más avanzados según progreso

---

## 9. Dashboard y Calendario

### 9.1 Vista Principal del Dashboard
**Elementos visibles:**
- Avatar del usuario con estado actual
- Puntos de Vitalidad de la semana actual (con barra de progreso hacia objetivo)
- Puntos acumulados del mes
- Racha de días consecutivos con actividad
- Próxima evaluación pendiente (si hay)

### 9.2 Calendario de Actividades
**Visualización mensual con:**
- **Días Positivos**: Marcados en verde si se cumplió al menos 50% del objetivo diario
- **Días Excepcionales**: Dorados si se superó el 100% del objetivo
- **Días Inactivos**: Gris claro
- Al tocar un día: detalle de actividades completadas y PV ganados

### 9.3 Estadísticas y Gráficos
- Evolución semanal de Puntos de Vitalidad (gráfico de líneas)
- Distribución de actividades (gráfico circular)
- Comparación con semanas anteriores
- Progreso en evaluaciones (antes/después)

---

## 10. Sistema de Recompensas

### 10.1 Logros Desbloqueables
**Ejemplos:**
- "Primera Semana Completa": Cumplir objetivo 7 días seguidos
- "Madrugador": Completar actividad antes de las 8am, 5 días
- "Explorador": Probar 10 actividades diferentes
- "Constancia": 30 días consecutivos con actividad
- "Superación": Mejorar IMC en una categoría

### 10.2 Notificaciones de Celebración
- Animación especial al completar objetivo diario
- Mensaje motivacional al desbloquear logro
- Resumen semanal con felicitaciones

---

## 11. Modelo de Suscripción

### 11.1 Período de Prueba
- **Duración**: 7 días gratis
- **Acceso**: Funcionalidades completas durante prueba
- **Sin tarjeta requerida**: Registro solo con email

### 11.2 Membresía "Academia de Hábitos Saludables"
**Opciones:**
1. **Miembros Entrenados**: Acceso gratuito para clientes de otros servicios de Outdoor Team
2. **Suscripción Regular**: Pago mensual de bajo costo (ej: USD 5-10/mes)

**Beneficios de la membresía:**
- Acceso ilimitado a bloques de entrenamiento
- Historial completo de actividades y evaluaciones
- Soporte del equipo de entrenadores
- Nuevos contenidos mensuales
- Sin publicidad

### 11.3 Restricciones Post-Prueba (usuarios no suscritos)
- Máximo 2 bloques de entrenamiento por semana
- Sin acceso a evaluaciones periódicas
- Dashboard limitado (solo semana actual)
- Avatar básico sin personalizaciones avanzadas

---

## 12. Stack Tecnológico

### 12.1 Frontend
- **React** con **Vite** para desarrollo rápido
- **Capacitor** para compilación a APK Android
- **Tailwind CSS** para estilos
- **Recharts** para gráficos y visualizaciones

### 12.2 Backend
- **Node.js** + **Express**
- **Supabase** (PostgreSQL) para base de datos
- **Supabase Auth** para autenticación
- **Supabase Storage** para imágenes de avatar

### 12.3 Notificaciones
- **Push Notifications** mediante Capacitor plugin
- Programación de recordatorios diarios/semanales

---

## 13. Estructura de Base de Datos (Supabase)

### 13.1 Tablas Principales

```
users
├── id (uuid)
├── email (text)
├── name (text)
├── activity_level (1, 2, 3)
├── weekly_goal (int) - puntos vitales objetivo
├── subscription_status (enum: trial, active, inactive)
├── trial_end_date (timestamp)
├── avatar_type (enum: photo, character)
├── avatar_url (text)
├── avatar_character_id (int)
├── created_at (timestamp)

activities_catalog
├── id (int)
├── name (text)
├── category (text)
├── mets (decimal)
├── description (text)
├── icon (text)

user_activities
├── id (uuid)
├── user_id (uuid) FK
├── activity_id (int) FK
├── duration_minutes (int)
├── vitality_points (int)
├── date (date)
├── created_at (timestamp)

training_blocks
├── id (int)
├── title (text)
├── type (enum: hiit, strength, aerobic, seniors, stretching, relaxation)
├── duration (int) - siempre 10
├── intensity (text)
├── video_url (text)
├── vitality_points (decimal)
├── min_level (int)

user_training_sessions
├── id (uuid)
├── user_id (uuid) FK
├── block_id (int) FK
├── completed_at (timestamp)
├── vitality_points (int)

evaluations
├── id (uuid)
├── user_id (uuid) FK
├── type (enum: imc, parq, ipaq, pss10, whoqol)
├── results (jsonb)
├── assigned_by (uuid) FK - admin que asignó
├── completed_at (timestamp)

vitality_points_history
├── id (uuid)
├── user_id (uuid) FK
├── week_start (date)
├── total_points (int)
├── goal_achieved (boolean)

achievements
├── id (int)
├── name (text)
├── description (text)
├── icon (text)
├── requirement (jsonb)

user_achievements
├── user_id (uuid) FK
├── achievement_id (int) FK
├── unlocked_at (timestamp)
```

---

## 14. Roadmap de Desarrollo

### Fase 1: MVP (Semanas 1-4)
- [ ] Configuración inicial del proyecto (React + Vite + Capacitor)
- [ ] Conexión con Supabase
- [ ] Sistema de autenticación
- [ ] Dashboard básico
- [ ] Catálogo de actividades con METs
- [ ] Sistema de Puntos de Vitalidad
- [ ] Avatar básico (solo personajes predefinidos)

### Fase 2: Gamificación (Semanas 5-6)
- [ ] Evolución del avatar según PV
- [ ] Calendario de actividades
- [ ] Sistema de logros básico
- [ ] Notificaciones push

### Fase 3: Entrenamiento (Semanas 7-8)
- [ ] Bloques de entrenamiento de 10 min
- [ ] Sistema de niveles (Adaptación/Activación/Consolidación)
- [ ] Panel de administrador básico

### Fase 4: Evaluaciones (Semanas 9-10)
- [ ] Implementación de 5 evaluaciones
- [ ] Asignación de evaluaciones por admin
- [ ] Comparación histórica de resultados

### Fase 5: Suscripción y Pulido (Semanas 11-12)
- [ ] Sistema de suscripción
- [ ] Pasarela de pago
- [ ] Avatar desde foto
- [ ] Optimización de rendimiento
- [ ] Testing y corrección de bugs
- [ ] Generación de APK para producción

---

## 15. Métricas de Éxito

### KPIs del Producto
- **Retención**: % de usuarios que continúan después de la semana de prueba
- **Engagement**: Promedio de días activos por semana
- **Conversión**: % de usuarios trial que se suscriben
- **NPS**: Satisfacción del usuario

### KPIs de Salud
- Promedio de Puntos de Vitalidad semanales por nivel
- % de usuarios que completan evaluaciones
- Mejora en resultados de evaluaciones (IPAQ, PSS-10, WHOQOL-BREF)

---

## 16. Próximos Pasos

1. **Validar PRD** con el equipo
2. **Configurar proyecto** en VS Code
3. **Crear estructura de carpetas** siguiendo buenas prácticas
4. **Configurar Supabase**: crear tablas y políticas de seguridad
5. **Comenzar Fase 1** del roadmap

---

**Documento vivo - Última actualización**: Octubre 2025
**Versión**: 2.0