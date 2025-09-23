import { Kysely, PostgresDialect, sql } from 'kysely';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseSchema {
  users: {
    id: string; // Changed to string for UUID
    email: string;
    password_hash: string | null;
    full_name: string;
    role: string;
    plan_type: string | null;
    is_active: number;
    features_json: string;
    created_at: Date;
    updated_at: Date;
  };
  habits: {
    id: string;
    user_id: string;
    name: string;
    is_completed: number;
    date: string;
    created_at: Date;
  };
  daily_habits: {
    id: string;
    user_id: string;
    date: string;
    training_completed: number;
    nutrition_completed: number;
    movement_completed: number;
    meditation_completed: number;
    daily_points: number;
    steps: number;
    created_at: Date;
    updated_at: Date;
  };
  daily_history: {
    id: string;
    user_id: string;
    date: string;
    daily_points: number;
    steps: number;
    training_completed: number;
    nutrition_completed: number;
    movement_completed: number;
    meditation_completed: number;
    notes_content: string | null;
    archived_at: Date;
  };
  user_notes: {
    id: string;
    user_id: string;
    content: string;
    date: string;
    created_at: Date;
  };
  step_counts: {
    id: string;
    user_id: string;
    steps: number;
    date: string;
    created_at: Date;
  };
  user_files: {
    id: string;
    user_id: string;
    filename: string;
    file_type: string;
    file_path: string;
    uploaded_by: string;
    created_at: Date;
  };
  broadcast_messages: {
    id: string;
    sender_id: string;
    message: string;
    created_at: Date;
  };
  plans: {
    id: string;
    name: string;
    description: string;
    price: number;
    services_included: string;
    features_json: string;
    is_active: number;
    created_at: Date;
    updated_at: Date;
  };
  content_library: {
    id: string;
    title: string;
    description: string | null;
    video_url: string | null;
    category: string;
    subcategory: string | null;
    is_active: number;
    created_at: Date;
  };
  content_videos: {
    id: string;
    title: string;
    description: string | null;
    category: string;
    video_url: string;
    is_active: number;
    created_at: Date;
  };
  workout_of_day: {
    id: string;
    title: string;
    description: string | null;
    exercises_json: string;
    date: string;
    is_active: number;
    created_at: Date;
    updated_at: Date;
  };
  meditation_sessions: {
    id: string;
    user_id: string;
    duration_minutes: number;
    meditation_type: string;
    breathing_cycle_json: string | null;
    comment: string | null;
    completed_at: Date;
  };
  daily_reset_log: {
    id: string;
    reset_date: string;
    executed_at: Date;
    users_processed: number;
    total_daily_points: number;
    total_steps: number;
    total_notes: number;
    status: string;
    error_message: string | null;
    execution_time_ms: number;
    created_at: Date;
  };
  system_logs: {
    id: string;
    level: string;
    event: string;
    user_id: string | null;
    route: string | null;
    ip_address: string | null;
    user_agent: string | null;
    metadata: string | null;
    created_at: Date;
  };
  user_notifications: {
    id: string;
    user_id: string;
    enabled: number;
    habits: string;
    times: string;
    push_token: string | null;
    push_endpoint: string | null;
    push_keys: string | null;
    created_at: Date;
    updated_at: Date;
  };
  notification_jobs: {
    id: string;
    user_id: string;
    habit_key: string;
    reminder_time: string;
    next_send_at: Date;
    created_at: Date;
  };
  nutrition_plans: {
    id: string;
    user_id: string;
    content_md: string | null;
    version: number;
    status: string;
    created_by: string | null;
    created_at: Date;
    updated_at: Date;
  };
  training_plans: {
    id: string;
    user_id: string;
    title: string | null;
    version: number;
    status: string;
    created_by: string | null;
    created_at: Date;
    updated_at: Date;
  };
  training_plan_days: {
    id: string;
    plan_id: string;
    day_index: number;
    title: string | null;
    notes: string | null;
    sort_order: number;
  };
  training_exercises: {
    id: string;
    day_id: string;
    sort_order: number;
    exercise_name: string;
    content_library_id: string | null;
    youtube_url: string | null;
    sets: number | null;
    reps: string | null;
    intensity: string | null;
    rest_seconds: number | null;
    tempo: string | null;
    notes: string | null;
  };
  training_plan_schedules: {
    id: string;
    user_id: string;
    plan_title: string | null;
    week_number: number;
    status: string;
    created_by: string | null;
    created_at: Date;
    updated_at: Date;
  };
  training_plan_exercises: {
    id: string;
    schedule_id: string;
    day_name: string;
    exercise_name: string;
    content_library_id: string | null;
    video_url: string | null;
    sets: number | null;
    reps: string | null;
    rest_seconds: number | null;
    intensity: string | null;
    notes: string | null;
    sort_order: number;
  };
  user_permissions: {
    id: string;
    user_id: string;
    dashboard_enabled: number;
    training_enabled: number;
    nutrition_enabled: number;
    meditation_enabled: number;
    active_breaks_enabled: number;
    exercises_enabled: number;
    created_at: Date;
    updated_at: Date;
  };
  user_goals: {
    id: string;
    user_id: string;
    daily_steps_goal: number;
    weekly_points_goal: number;
    created_at: Date;
    updated_at: Date;
  };
  user_avatars: {
    id: string;
    user_id: string;
    gender: string;
    skin_tone: string;
    hair_style: string;
    hair_color: string;
    shirt_style: string;
    shirt_color: string;
    pants_style: string;
    pants_color: string;
    accessory: string;
    vitality_level: number;
    created_at: Date;
    updated_at: Date;
  };
}

let dbInstance: Kysely<DatabaseSchema> | null = null;

if (process.env.DATABASE_URL) {
  const dialect = new PostgresDialect({
    pool: new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
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
