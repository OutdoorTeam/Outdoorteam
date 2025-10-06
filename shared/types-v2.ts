/**
 * Tipos TypeScript V2.0
 * Academia de Hábitos Saludables
 * Sistema de Puntos de Vitalidad
 */

// ============================================================================
// ACTIVIDADES METs
// ============================================================================

export interface Activity {
  id: number;
  name: string;
  category: 'hogar' | 'transporte' | 'trabajo' | 'recreacion' | 'ejercicio';
  mets: number;
  description?: string;
  icon: string;
  base_duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface UserActivity {
  id: string;
  user_id: string;
  activity_id?: number;
  activity_name: string;
  duration_minutes: number;
  mets_value: number;
  vitality_points_earned: number;
  date: string;
  created_at: string;
}

export interface ActivityCategory {
  value: string;
  label: string;
}

// ============================================================================
// BLOQUES DE ENTRENAMIENTO
// ============================================================================

export type TrainingBlockType = 'hiit' | 'strength' | 'aerobic' | 'seniors' | 'stretching' | 'relaxation';

export interface TrainingBlock {
  id: number;
  title: string;
  type: TrainingBlockType;
  duration_minutes: number;
  intensity: 'low' | 'medium' | 'high';
  video_url?: string;
  thumbnail_url?: string;
  description?: string;
  vitality_points: number;
  min_activity_level: 1 | 2 | 3;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface TrainingBlockTypeInfo {
  value: TrainingBlockType;
  label: string;
  points: number;
  intensity: string;
  icon: string;
}

export interface UserTrainingSession {
  id: string;
  user_id: string;
  block_id?: number;
  block_title: string;
  vitality_points_earned: number;
  date: string;
  completed_at: string;
}

// ============================================================================
// EVALUACIONES
// ============================================================================

export type EvaluationType = 'imc' | 'parq' | 'ipaq' | 'pss10' | 'whoqol';

export interface Evaluation {
  id: string;
  user_id: string;
  type: EvaluationType;
  results: Record<string, any>;
  score?: number;
  interpretation?: string;
  assigned_by?: string;
  status: 'pending' | 'completed';
  completed_at?: string;
  created_at: string;
}

// ============================================================================
// PUNTOS DE VITALIDAD
// ============================================================================

export interface DailyVitality {
  id: string;
  user_id: string;
  date: string;

  // 4 actividades principales (2 PV cada una)
  daily_steps: number;
  steps_goal_reached: boolean;
  training_block_completed: boolean;
  active_pause_completed: boolean;
  meditation_completed: boolean;

  // Puntos
  main_activities_points: number;
  extra_activities_points: number;
  total_points: number;

  created_at: string;
  updated_at: string;
}

export interface VitalityPointsHistory {
  id: string;
  user_id: string;
  week_start: string;
  week_end: string;
  total_points: number;
  goal_points: number;
  goal_achieved: boolean;
  percentage: number;
  created_at: string;
}

// ============================================================================
// LOGROS
// ============================================================================

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  category: string;
  requirement: Record<string, any>;
  points_reward: number;
  is_active: boolean;
  created_at: string;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: number;
  unlocked_at: string;
  achievement?: Achievement; // Populated cuando se hace join
}

// ============================================================================
// USUARIO Y AVATAR
// ============================================================================

export type ActivityLevel = 1 | 2 | 3;

export type SubscriptionStatus = 'trial' | 'active' | 'inactive' | 'cancelled';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  name?: string;
  profile_picture_url?: string;
  is_admin: boolean;
  is_active: boolean;
  created_at: string;

  // Nuevos campos V2
  activity_level: ActivityLevel;
  weekly_vitality_goal: number;
  subscription_status: SubscriptionStatus;
  trial_end_date?: string;
  avatar_type: 'photo' | 'character';
  avatar_character_id: number;
  current_streak_days: number;
  longest_streak_days: number;
  total_vitality_points: number;
}

export interface UserAvatar {
  id: string;
  user_id: string;

  // Personalización visual
  gender: string;
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  shirt_style: string;
  shirt_color: string;
  pants_style: string;
  pants_color: string;
  accessory: string;

  // Sistema de evolución
  vitality_level: 1 | 2 | 3 | 4 | 5;
  custom_photo_url?: string;
  character_preset_id?: number;
  evolution_effects: {
    glow: number;
    posture: string;
    brightness: number;
    special?: string;
  };

  last_evolution_update: string;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// API RESPONSES
// ============================================================================

export interface ApiResponse<T> {
  success?: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ActivitiesResponse {
  activities: Activity[];
  groupedByCategory: Record<string, Activity[]>;
  total: number;
}

export interface RegisterActivityResponse {
  success: boolean;
  activity: UserActivity;
  vitality_points_earned: number;
  message: string;
}

export interface TrainingBlocksResponse {
  blocks: TrainingBlock[];
  groupedByType: Record<string, TrainingBlock[]>;
  total: number;
}

export interface CompleteTrainingBlockResponse {
  success: boolean;
  session: UserTrainingSession;
  vitality_points_earned: number;
  message: string;
}

export interface ActivityHistoryResponse {
  activities: UserActivity[];
  total: number;
}

export interface TrainingSessionsResponse {
  sessions: UserTrainingSession[];
  total: number;
}

export interface TrainingStatsResponse {
  total_sessions: number;
  total_vitality_points: number;
  month_sessions: number;
  month_vitality_points: number;
  sessions_by_type: Record<string, number>;
}

// ============================================================================
// CONSTANTES
// ============================================================================

export const ACTIVITY_LEVEL_LABELS: Record<ActivityLevel, string> = {
  1: 'Adaptación',
  2: 'Activación',
  3: 'Consolidación',
};

export const ACTIVITY_LEVEL_DESCRIPTIONS: Record<ActivityLevel, string> = {
  1: 'Comenzando el camino del movimiento',
  2: 'Despertando el cuerpo',
  3: 'Manteniendo el impulso',
};

export const AVATAR_VITALITY_LEVELS = {
  1: { label: 'Bajo', color: '#6B7280', description: '0-20% del objetivo' },
  2: { label: 'Regular', color: '#F59E0B', description: '21-50% del objetivo' },
  3: { label: 'Activo', color: '#10B981', description: '51-80% del objetivo' },
  4: { label: 'Radiante', color: '#3B82F6', description: '81-100% del objetivo' },
  5: { label: 'Premium', color: '#D3B869', description: '+100% del objetivo' },
};

export const TRAINING_BLOCK_TYPES: Record<TrainingBlockType, TrainingBlockTypeInfo> = {
  hiit: { value: 'hiit', label: 'HIIT', points: 3.0, intensity: 'Alta', icon: '🔥' },
  strength: { value: 'strength', label: 'Fuerza', points: 2.5, intensity: 'Media-Alta', icon: '💪' },
  aerobic: { value: 'aerobic', label: 'Aeróbico', points: 2.0, intensity: 'Media', icon: '🏃' },
  seniors: { value: 'seniors', label: 'Adultos Mayores', points: 1.5, intensity: 'Baja-Media', icon: '🚶' },
  stretching: { value: 'stretching', label: 'Estiramientos', points: 1.0, intensity: 'Baja', icon: '🧘' },
  relaxation: { value: 'relaxation', label: 'Relajación', points: 1.0, intensity: 'Muy Baja', icon: '☮️' },
};

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

/**
 * Calcula los Puntos de Vitalidad basados en METs y duración
 * Fórmula: (METs × minutos) / 2
 */
export function calculateVitalityPoints(mets: number, durationMinutes: number): number {
  const totalMets = mets * durationMinutes;
  return Math.floor(totalMets / 2);
}

/**
 * Obtiene el nivel de vitalidad del avatar según el porcentaje del objetivo
 */
export function getAvatarVitalityLevel(percentage: number): 1 | 2 | 3 | 4 | 5 {
  if (percentage === 0) return 1;
  if (percentage <= 20) return 1;
  if (percentage <= 50) return 2;
  if (percentage <= 80) return 3;
  if (percentage <= 100) return 4;
  return 5;
}

/**
 * Formatea los Puntos de Vitalidad con su icono
 */
export function formatVitalityPoints(points: number): string {
  return `${points} PV`;
}

/**
 * Obtiene el color según el porcentaje del objetivo
 */
export function getProgressColor(percentage: number): string {
  if (percentage === 0) return '#6B7280'; // Gris
  if (percentage < 50) return '#EF4444'; // Rojo
  if (percentage < 80) return '#F59E0B'; // Amarillo
  if (percentage < 100) return '#10B981'; // Verde
  return '#D3B869'; // Dorado
}
