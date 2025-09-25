import { Router } from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendErrorResponse, ERROR_CODES } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';

const router = Router();

const buildGoalResponse = (row: any) => ({
  id: row.user_id,
  user_id: row.user_id,
  daily_steps_goal: row.daily_steps_goal,
  weekly_points_goal: row.week_points_goal,
  updated_at: row.updated_at,
});

// Get current user's goals
router.get('/my-goals', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;

    console.log('Fetching goals for user:', userId);

    let goals = await db
      .selectFrom('goals')
      .select(['user_id', 'daily_steps_goal', 'week_points_goal', 'updated_at'])
      .where('user_id', '=', userId)
      .executeTakeFirst();

    if (!goals) {
      const now = new Date();
      goals = await db
        .insertInto('goals')
        .values({
          user_id: userId,
          daily_steps_goal: 8000,
          week_points_goal: 28,
          updated_at: now,
        })
        .returning(['user_id', 'daily_steps_goal', 'week_points_goal', 'updated_at'])
        .executeTakeFirst();
    }

    if (!goals) {
      throw new Error('Failed to fetch or create goals');
    }

    const response = buildGoalResponse(goals);
    console.log('User goals fetched:', response);
    res.json(response);
  } catch (error) {
    console.error('Error fetching user goals:', error);
    await SystemLogger.logCriticalError('User goals fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener metas del usuario');
  }
});

// Update current user's goals
router.put('/my-goals', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { daily_steps_goal, weekly_points_goal } = req.body;

    console.log('Updating goals for user:', userId, 'data:', req.body);

    // Validate inputs
    if (daily_steps_goal !== undefined && (daily_steps_goal < 1000 || daily_steps_goal > 50000)) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Meta de pasos debe estar entre 1,000 y 50,000');
      return;
    }

    if (weekly_points_goal !== undefined && (weekly_points_goal < 7 || weekly_points_goal > 100)) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Meta semanal debe estar entre 7 y 100 puntos');
      return;
    }

    const existingGoals = await db
      .selectFrom('goals')
      .select(['user_id', 'daily_steps_goal', 'week_points_goal'])
      .where('user_id', '=', userId)
      .executeTakeFirst();

    const now = new Date();
    const nextDailyGoal = daily_steps_goal !== undefined ? daily_steps_goal : existingGoals?.daily_steps_goal ?? 8000;
    const nextWeeklyGoal = weekly_points_goal !== undefined ? weekly_points_goal : existingGoals?.week_points_goal ?? 28;

    let result;
    if (existingGoals) {
      result = await db
        .updateTable('goals')
        .set({
          daily_steps_goal: nextDailyGoal,
          week_points_goal: nextWeeklyGoal,
          updated_at: now,
        })
        .where('user_id', '=', userId)
        .returning(['user_id', 'daily_steps_goal', 'week_points_goal', 'updated_at'])
        .executeTakeFirst();
    } else {
      result = await db
        .insertInto('goals')
        .values({
          user_id: userId,
          daily_steps_goal: nextDailyGoal,
          week_points_goal: nextWeeklyGoal,
          updated_at: now,
        })
        .returning(['user_id', 'daily_steps_goal', 'week_points_goal', 'updated_at'])
        .executeTakeFirst();
    }

    if (!result) {
      throw new Error('Failed to persist goals');
    }

    const response = buildGoalResponse(result);

    console.log('User goals updated successfully:', response);
    await SystemLogger.log('info', 'User goals updated', {
      userId: req.user.id,
      metadata: {
        daily_steps_goal: response.daily_steps_goal,
        weekly_points_goal: response.weekly_points_goal,
      },
    });

    res.json(response);
  } catch (error) {
    console.error('Error updating user goals:', error);
    await SystemLogger.logCriticalError('User goals update error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al actualizar metas del usuario');
  }
});

export default router;
