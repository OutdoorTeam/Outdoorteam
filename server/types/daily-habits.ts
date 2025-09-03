export interface DailyHabitBase {
  date: string;
  user_id: number;
  training_completed: number;
  nutrition_completed: number;
  movement_completed: number;
  meditation_completed: number;
  daily_points: number;
  steps: number;
}
export interface DailyHabitRow extends DailyHabitBase {
  id: number;
  created_at: string;
  updated_at: string;
}
export type DailyHabitInsert = Omit<DailyHabitRow, 'id' | 'created_at' | 'updated_at'>;
