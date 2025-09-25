import { Router } from 'express';
import type { Request, Response } from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendErrorResponse, ERROR_CODES } from '../utils/validation.js';

const router = Router();

// GET goals by user
router.get('/user-goals/:userId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    const existing = await db
      .selectFrom('goals')
      .select(['user_id', 'week_points_goal', 'daily_steps_goal'])
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!existing) {
      res.json({ user_id: userId, week_points_goal: 18, daily_steps_goal: 6500 });
      return;
    }
    res.json(existing);
  } catch {
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error fetching goals');
  }
});

// UPSERT goals
router.put('/user-goals/:userId', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = String(req.params.userId);
    const { daily_steps_goal, week_points_goal } = req.body as { daily_steps_goal?: number; week_points_goal?: number };

    const existing = await db
      .selectFrom('goals')
      .select(['user_id', 'week_points_goal', 'daily_steps_goal'])
      .where('user_id', '=', userId)
      .executeTakeFirst();

    const nextDaily = daily_steps_goal ?? existing?.daily_steps_goal ?? 6500;
    const nextWeekly = week_points_goal ?? existing?.week_points_goal ?? 18;

    if (existing) {
      const updated = await db
        .updateTable('goals')
        .set({ daily_steps_goal: nextDaily, week_points_goal: nextWeekly, updated_at: new Date() })
        .where('user_id', '=', userId)
        .returning(['user_id', 'week_points_goal', 'daily_steps_goal'])
        .executeTakeFirst();

      res.json(updated);
      return;
    }

    const inserted = await db
      .insertInto('goals')
      .values({ user_id: userId, daily_steps_goal: nextDaily, week_points_goal: nextWeekly, updated_at: new Date() })
      .returning(['user_id', 'week_points_goal', 'daily_steps_goal'])
      .executeTakeFirst();

    res.json(inserted);
  } catch {
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error saving goals');
  }
});

export default router;
