import express from 'express';
import { db } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { SystemLogger } from '../utils/logging.js';
import { ERROR_CODES, sendErrorResponse } from '../utils/validation.js';

const router = express.Router();

const booleanOrDefault = (value: unknown, fallback: boolean) => {
  if (value === undefined || value === null) return fallback;
  return Boolean(value);
};

const defaultPermissions = {
  has_training_access: false,
  has_nutrition_access: false,
  has_pause_access: false,
  has_meditation_access: false,
};

const mapGoalResponse = (row: any, userId: string) => ({
  user_id: userId,
  week_points_goal: row?.week_points_goal ?? 18,
  daily_steps_goal: row?.daily_steps_goal ?? 6500,
});

// Get user permissions
router.get('/users/:id/permissions', authenticateToken, requireAdmin, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = String(id);

    console.log('Admin fetching permissions for user:', userId);

    const userRecord = await db
      .selectFrom('users')
      .select(['has_training_access', 'has_nutrition_access', 'has_pause_access', 'has_meditation_access'])
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!userRecord) {
      sendErrorResponse(res, ERROR_CODES.NOT_FOUND_ERROR, 'Usuario no encontrado');
      return;
    }

    res.json({
      has_training_access: booleanOrDefault(userRecord.has_training_access, false),
      has_nutrition_access: booleanOrDefault(userRecord.has_nutrition_access, false),
      has_pause_access: booleanOrDefault(userRecord.has_pause_access, false),
      has_meditation_access: booleanOrDefault(userRecord.has_meditation_access, false),
    });
  } catch (error) {
    console.error('Error fetching user permissions:', error);
    await SystemLogger.logCriticalError('User permissions fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener permisos del usuario');
  }
});

// Update user permissions
router.put('/users/:id/permissions', authenticateToken, requireAdmin, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = String(id);
    const {
      has_training_access,
      has_nutrition_access,
      has_pause_access,
      has_meditation_access,
    } = req.body;

    console.log('Admin updating permissions for user:', userId, 'data:', req.body);

    const userExists = await db
      .selectFrom('users')
      .select('id')
      .where('id', '=', userId)
      .executeTakeFirst();

    if (!userExists) {
      sendErrorResponse(res, ERROR_CODES.NOT_FOUND_ERROR, 'Usuario no encontrado');
      return;
    }

    const updatePayload: Record<string, boolean> = {};
    if (has_training_access !== undefined) updatePayload.has_training_access = Boolean(has_training_access);
    if (has_nutrition_access !== undefined) updatePayload.has_nutrition_access = Boolean(has_nutrition_access);
    if (has_pause_access !== undefined) updatePayload.has_pause_access = Boolean(has_pause_access);
    if (has_meditation_access !== undefined) updatePayload.has_meditation_access = Boolean(has_meditation_access);

    if (Object.keys(updatePayload).length === 0) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'No hay cambios para aplicar');
      return;
    }

    const updatedUser = await db
      .updateTable('users')
      .set(updatePayload)
      .where('id', '=', userId)
      .returning(['has_training_access', 'has_nutrition_access', 'has_pause_access', 'has_meditation_access'])
      .executeTakeFirst();

    if (!updatedUser) {
      throw new Error('Failed to update permissions');
    }

    await SystemLogger.log('info', 'User permissions updated', {
      userId: req.user.id,
      metadata: { target_user_id: userId, permissions: updatePayload },
    });

    res.json({
      has_training_access: updatedUser.has_training_access,
      has_nutrition_access: updatedUser.has_nutrition_access,
      has_pause_access: updatedUser.has_pause_access,
      has_meditation_access: updatedUser.has_meditation_access,
    });
  } catch (error) {
    console.error('Error updating user permissions:', error);
    await SystemLogger.logCriticalError('User permissions update error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al actualizar permisos del usuario');
  }
});

// Get user goals (admin)
router.get('/users/:id/goals', authenticateToken, requireAdmin, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = String(id);

    console.log('Admin fetching goals for user:', userId);

    const goalRow = await db
      .selectFrom('goals')
      .select(['week_points_goal', 'daily_steps_goal'])
      .where('user_id', '=', userId)
      .executeTakeFirst();

    res.json(mapGoalResponse(goalRow, userId));
  } catch (error) {
    console.error('Error fetching user goals:', error);
    await SystemLogger.logCriticalError('User goals fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener metas del usuario');
  }
});

// Update user goals (admin)
router.put('/users/:id/goals', authenticateToken, requireAdmin, async (req: any, res: express.Response) => {
  try {
    const { id } = req.params;
    const userId = String(id);
    const { daily_steps_goal, week_points_goal } = req.body;

    console.log('Admin updating goals for user:', userId, 'data:', req.body);

    if (daily_steps_goal !== undefined && (daily_steps_goal < 1000 || daily_steps_goal > 50000)) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'La meta de pasos debe estar entre 1,000 y 50,000');
      return;
    }

    if (week_points_goal !== undefined && (week_points_goal < 7 || week_points_goal > 100)) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'La meta semanal debe estar entre 7 y 100 puntos');
      return;
    }

    const now = new Date();
    const existing = await db
      .selectFrom('goals')
      .select(['week_points_goal', 'daily_steps_goal'])
      .where('user_id', '=', userId)
      .executeTakeFirst();

    const nextDaily = daily_steps_goal !== undefined ? daily_steps_goal : existing?.daily_steps_goal ?? 6500;
    const nextWeekly = week_points_goal !== undefined ? week_points_goal : existing?.week_points_goal ?? 18;

    let result;
    if (existing) {
      result = await db
        .updateTable('goals')
        .set({
          daily_steps_goal: nextDaily,
          week_points_goal: nextWeekly,
          updated_at: now,
        })
        .where('user_id', '=', userId)
        .returning(['week_points_goal', 'daily_steps_goal'])
        .executeTakeFirst();
    } else {
      result = await db
        .insertInto('goals')
        .values({
          user_id: userId,
          daily_steps_goal: nextDaily,
          week_points_goal: nextWeekly,
          updated_at: now,
        })
        .returning(['week_points_goal', 'daily_steps_goal'])
        .executeTakeFirst();
    }

    if (!result) {
      throw new Error('Failed to persist goals');
    }

    await SystemLogger.log('info', 'User goals updated', {
      userId: req.user.id,
      metadata: { target_user_id: userId, goals: { daily_steps_goal: nextDaily, week_points_goal: nextWeekly } },
    });

    res.json({
      user_id: userId,
      week_points_goal: result.week_points_goal,
      daily_steps_goal: result.daily_steps_goal,
    });
  } catch (error) {
    console.error('Error updating user goals:', error);
    await SystemLogger.logCriticalError('User goals update error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al actualizar metas del usuario');
  }
});

export default router;
