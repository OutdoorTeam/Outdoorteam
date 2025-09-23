import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export interface DatabaseSchema {
  users: {
    id: number;
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
    id: number;
    user_id: number;
    name: string;
    is_completed: number;
    date: string;
    created_at: Date;
  };
  daily_habits: {
    id: number;
    user_id: number;
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
    id: number;
    user_id: number;
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
    id: number;
    user_id: number;
    content: string;
    date: string;
    created_at: Date;
  };
  step_counts: {
    id: number;
    user_id: number;
    steps: number;
    date: string;
    created_at: Date;
  };
  user_files: {
    id: number;
    user_id: number;
    filename: string;
    file_type: string;
    file_path: string;
    uploaded_by: number;
    created_at: Date;
  };
  broadcast_messages: {
    id: number;
    sender_id: number;
    message: string;
    created_at: Date;
  };
  plans: {
    id: number;
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
    id: number;
    title: string;
    description: string | null;
    video_url: string | null;
    category: string;
    subcategory: string | null;
    is_active: number;
    created_at: Date;
  };
  content_videos: {
    id: number;
    title: string;
    description: string | null;
    category: string;
    video_url: string;
    is_active: number;
    created_at: Date;
  };
  workout_of_day: {
    id: number;
    title: string;
    description: string | null;
    exercises_json: string;
    date: string;
    is_active: number;
    created_at: Date;
    updated_at: Date;
  };
  meditation_sessions: {
    id: number;
    user_id: number;
    duration_minutes: number;
    meditation_type: string;
    breathing_cycle_json: string | null;
    comment: string | null;
    completed_at: Date;
  };
  daily_reset_log: {
    id: number;
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
    id: number;
    level: string;
    event: string;
    user_id: number | null;
    route: string | null;
    ip_address: string | null;
    user_agent: string | null;
    metadata: string | null;
    created_at: Date;
  };
  user_notifications: {
    id: number;
    user_id: number;
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
    id: number;
    user_id: number;
    habit_key: string;
    reminder_time: string;
    next_send_at: Date;
    created_at: Date;
  };
  nutrition_plans: {
    id: number;
    user_id: number;
    content_md: string | null;
    version: number;
    status: string;
    created_by: number | null;
    created_at: Date;
    updated_at: Date;
  };
  training_plans: {
    id: number;
    user_id: number;
    title: string | null;
    version: number;
    status: string;
    created_by: number | null;
    created_at: Date;
    updated_at: Date;
  };
  training_plan_days: {
    id: number;
    plan_id: number;
    day_index: number;
    title: string | null;
    notes: string | null;
    sort_order: number;
  };
  training_exercises: {
    id: number;
    day_id: number;
    sort_order: number;
    exercise_name: string;
    content_library_id: number | null;
    youtube_url: string | null;
    sets: number | null;
    reps: string | null;
    intensity: string | null;
    rest_seconds: number | null;
    tempo: string | null;
    notes: string | null;
  };
  training_plan_schedules: {
    id: number;
    user_id: number;
    plan_title: string | null;
    week_number: number;
    status: string;
    created_by: number | null;
    created_at: Date;
    updated_at: Date;
  };
  training_plan_exercises: {
    id: number;
    schedule_id: number;
    day_name: string;
    exercise_name: string;
    content_library_id: number | null;
    video_url: string | null;
    sets: number | null;
    reps: string | null;
    rest_seconds: number | null;
    intensity: string | null;
    notes: string | null;
    sort_order: number;
  };
  user_permissions: {
    id: number;
    user_id: number;
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
    id: number;
    user_id: number;
    daily_steps_goal: number;
    weekly_points_goal: number;
    created_at: Date;
    updated_at: Date;
  };
  user_avatars: {
    id: number;
    user_id: number;
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

const dialect = new PostgresDialect({
  pool: new Pool({
    connectionString: process.env.DATABASE_URL,
  }),
});

export const db = new Kysely<DatabaseSchema>({
  dialect,
  log: ['query', 'error'],
});
