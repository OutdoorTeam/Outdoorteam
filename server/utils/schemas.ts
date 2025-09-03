import { z } from 'zod';

export const DailyHabitInsertSchema = z.object({
  date: z.string(),
  user_id: z.number().int().positive(),
  training_completed: z.number().int().min(0).max(1),
  nutrition_completed: z.number().int().min(0).max(1),
  movement_completed: z.number().int().min(0).max(1),
  meditation_completed: z.number().int().min(0).max(1),
  daily_points: z.number().int().min(0),
  steps: z.number().int().min(0),
});
