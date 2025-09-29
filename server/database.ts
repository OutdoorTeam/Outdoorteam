import { Kysely, PostgresDialect, sql } from 'kysely';
import type { ColumnType, Generated } from 'kysely';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

type TimestampColumn = ColumnType<Date, Date | string | undefined, Date | string | undefined>;
type DateColumn = ColumnType<Date, Date | string | undefined, Date | string | undefined>;
type JsonColumn = ColumnType<unknown, unknown, unknown>;
type NumericColumn = ColumnType<string, string | number | undefined, string | number | undefined>;

export interface DatabaseSchema {
  admin_roles: {
    id: Generated<string>;
    name: string;
    description: string | null;
    permissions: JsonColumn;
    created_at: TimestampColumn;
    updated_at: TimestampColumn;
  };
  admin_users: {
    id: Generated<string>;
    user_id: string;
    role_id: string;
    created_at: TimestampColumn;
    updated_at: TimestampColumn;
  };
  broadcast_messages: {
    id: Generated<string>;
    title: string;
    body: string;
    url: string | null;
    created_at: TimestampColumn;
    created_by: string | null;
  };
  challenge_progress: {
    challenge_id: string;
    user_id: string;
    progress_count: number;
    consecutive_days: number;
    completed: boolean;
    completed_at: TimestampColumn | null;
  };
  challenges: {
    id: Generated<string>;
    title: string;
    type: string;
    rule: JsonColumn;
    start_date: DateColumn;
    end_date: DateColumn;
    active: boolean;
    created_by: string | null;
    created_at: TimestampColumn;
  };
  content_library: {
    id: Generated<string>;
    title: string;
    description: string | null;
    video_url: string | null;
    category: 'exercise' | 'active_breaks' | 'meditation';
    subcategory: string | null;
    is_active: boolean;
    created_at: TimestampColumn;
    created_by: string | null;
  };
  database_alerts: {
    id: Generated<string>;
    severity: string;
    message: string;
    details: JsonColumn | null;
    resolved: boolean;
    resolved_at: TimestampColumn | null;
    resolved_by: string | null;
    resolution_notes: string | null;
    created_at: TimestampColumn;
  };
  entitlements: {
    user_id: string;
    plan: string;
    active: boolean;
    stripe_customer_id: string | null;
    stripe_subscription_id: string | null;
    updated_at: TimestampColumn;
  };
  goals: {
    user_id: string;
    week_points_goal: number;
    daily_steps_goal: number;
    updated_at: TimestampColumn;
  };
  habit_daily_tracking: {
    id: Generated<string>;
    user_id: string;
    date: DateColumn;
    habits_completed: number;
    total_points: number;
    streak_days: number;
    created_at: TimestampColumn;
    updated_at: TimestampColumn;
  };
  habit_logs: {
    user_id: string;
    day: DateColumn;
    exercise: boolean;
    nutrition: boolean;
    meditation: boolean;
    movement: boolean;
    steps: number;
    created_at: TimestampColumn;
    updated_at: TimestampColumn;
  };
  habits: {
    id: Generated<string>;
    name: string;
    description: string | null;
    points: number;
    category: string;
    active: boolean;
    created_at: TimestampColumn;
  };
  health_evaluations: {
    id: Generated<string>;
    user_id: string;
    created_at: TimestampColumn;
    updated_at: TimestampColumn;
    notes: string | null;
    health_assessment_results: JsonColumn | null;
  };
  health_surveys: {
    id: Generated<string>;
    user_id: string;
    submitted_at: TimestampColumn;
    data: JsonColumn;
  };
  logros: {
    id: Generated<string>;
    code: string;
    title: string;
    description: string | null;
    points: number;
    active: boolean;
  };
  notification_settings: {
    id: Generated<string>;
    user_id: string;
    push_enabled: boolean;
    email_enabled: boolean;
    habit_reminders: boolean;
    habit_reminder_time: string | null;
    training_reminders: boolean;
    training_reminder_time: string | null;
    meditation_reminders: boolean;
    meditation_reminder_time: string | null;
    weekly_summary: boolean;
    device_tokens: JsonColumn;
    created_at: TimestampColumn;
    updated_at: TimestampColumn;
  };
  nutrition_plans: {
    id: Generated<string>;
    title: string;
    description: string | null;
    data: JsonColumn | null;
    created_at: TimestampColumn;
  };
  profiles: {
    id: string;
    full_name: string | null;
    nombre: string | null;
    apellido: string | null;
    telefono: string | null;
    direccion: string | null;
    ciudad: string | null;
    pais: string | null;
    codigo_postal: string | null;
    fecha_nacimiento: DateColumn | null;
    avatar_url: string | null;
    biografia: string | null;
    name: string | null;
    profile_picture_url: string | null;
    created_at: TimestampColumn;
    updated_at: TimestampColumn;
    sitio_web: string | null;
  };
  recompensas: {
    id: Generated<string>;
    code: string;
    name: string;
    cost_points: number;
    active: boolean;
  };
  subscription_plans: {
    id: Generated<string>;
    name: string;
    price: NumericColumn;
    description: string | null;
    features: JsonColumn | null;
    created_at: TimestampColumn;
  };
  training_plans: {
    id: Generated<string>;
    slug: string;
    name: string;
    level: string | null;
    goal: string | null;
    weeks: number | null;
    created_at: TimestampColumn;
  };
  training_programs: {
    id: Generated<string>;
    plan_slug: string;
    day_index: number;
    title: string;
    description: string | null;
    focus: string | null;
  };
  user_plan_assignments: {
    user_id: string;
    plan_id: string;
    assigned_at: TimestampColumn;
  };
  user_roles: {
    id: Generated<string>;
    user_id: string;
    role: string;
    created_at: TimestampColumn;
  };
  users: {
    id: string;
    email: string;
    full_name: string | null;
    name: string | null;
    profile_picture_url: string | null;
    subscription_plan_id: string | null;
    is_admin: boolean;
    is_active: boolean;
    created_at: TimestampColumn;
    puntos: number;
    pasos: number;
    ranking_puntos: number | null;
    ranking_pasos: number | null;
    has_training_access: boolean;
    has_nutrition_access: boolean;
    has_pause_access: boolean;
    has_meditation_access: boolean;
    health_assessment_results: JsonColumn | null;
  };
  videos: {
    id: Generated<string>;
    code: string;
    title: string;
    url: string;
    duration_seconds: number | null;
    thumbnail_url: string | null;
  };
  videos_ejercicios: {
    video_code: string;
    exercise_code: string;
  };
}

let dbInstance: Kysely<DatabaseSchema> | null = null;

if (process.env.DATABASE_URL) {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      ssl: { rejectUnauthorized: false },
    }),
  });

  dbInstance = new Kysely<DatabaseSchema>({
    dialect,
    log: (event) => {
      if (event.level === 'query') {
        console.log(sql`-- Kysely Query: ${sql.raw(event.query.sql)}`.compile(dbInstance!).sql, event.query.parameters);
      }
      if (event.level === 'error') {
        console.error('Kysely Error:', event.error);
      }
    },
  });
} else {
  console.warn('DATABASE_URL is not set. Database client will not be available.');
}

export const db = dbInstance;
