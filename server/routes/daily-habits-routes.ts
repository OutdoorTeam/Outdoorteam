import { Router } from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendErrorResponse, ERROR_CODES, validateRequest } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';
import { DailyHabitInsert } from '../types/daily-habits.js';
import { DailyHabitInsertSchema } from '../utils/schemas.js';

const router = Router();

// Get today's habits for the authenticated user
router.get('/daily-habits/today', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toISOString().split('T')[0];
    
    console.log('Fetching today habits for user:', userId, 'date:', today);

    let todayHabits = await db
      .selectFrom('daily_habits')
      .selectAll()
      .where('user_id', '=', userId)
      .where('date', '=', today)
      .executeTakeFirst();

    if (!todayHabits) {
      // Create default record for today
      const payload: DailyHabitInsert = {
        user_id: userId,
        date: today,
        training_completed: 0,
        nutrition_completed: 0,
        movement_completed: 0,
        meditation_completed: 0,
        daily_points: 0,
        steps: 0,
      };

      todayHabits = await db
        .insertInto('daily_habits')
        .values(payload)
        .returning([
          'id', 'user_id', 'date', 'training_completed', 'nutrition_completed',
          'movement_completed', 'meditation_completed', 'daily_points', 'steps',
          'created_at', 'updated_at'
        ])
        .executeTakeFirst();
    }

    console.log('Today habits fetched:', todayHabits);
    res.json(todayHabits);
  } catch (error) {
    console.error('Error fetching today habits:', error);
    await SystemLogger.logCriticalError('Today habits fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener hábitos de hoy');
  }
});

// Get weekly points for the authenticated user
router.get('/daily-habits/weekly-points', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
    const weekStartStr = weekStart.toISOString().split('T')[0];
    
    console.log('Fetching weekly points for user:', userId, 'from:', weekStartStr);

    const weeklyData = await db
      .selectFrom('daily_habits')
      .select(['date', 'daily_points'])
      .where('user_id', '=', userId)
      .where('date', '>=', weekStartStr)
      .orderBy('date', 'asc')
      .execute();

    const totalPoints = weeklyData.reduce((sum, day) => sum + (day.daily_points || 0), 0);

    const result = {
      total_points: totalPoints,
      daily_data: weeklyData,
      week_start: weekStartStr
    };

    console.log('Weekly points fetched:', result.total_points);
    res.json(result);
  } catch (error) {
    console.error('Error fetching weekly points:', error);
    await SystemLogger.logCriticalError('Weekly points fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener puntos semanales');
  }
});

// Get calendar data for the authenticated user
router.get('/daily-habits/calendar', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const monthsBack = 3; // Get last 3 months of data
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - monthsBack);
    const startDateStr = startDate.toISOString().split('T')[0];
    
    console.log('Fetching calendar data for user:', userId, 'from:', startDateStr);

    const calendarData = await db
      .selectFrom('daily_habits')
      .select(['date', 'daily_points'])
      .where('user_id', '=', userId)
      .where('date', '>=', startDateStr)
      .orderBy('date', 'desc')
      .execute();

    console.log('Calendar data fetched:', calendarData.length, 'days');
    res.json(calendarData);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    await SystemLogger.logCriticalError('Calendar data fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener datos del calendario');
  }
});

// Update daily habits
router.put(
  '/daily-habits/update',
  authenticateToken,
  validateRequest(DailyHabitInsertSchema, 'body'),
  async (req: any, res) => {
    try {
      const userId = req.user.id;
      const payload = req.body as DailyHabitInsert;
      payload.user_id = userId;

      console.log('Updating daily habits for user:', userId, 'date:', payload.date, 'data:', payload);

      // Recalculate daily points based on completed habits
      payload.daily_points =
        payload.training_completed +
        payload.nutrition_completed +
        payload.movement_completed +
        payload.meditation_completed;

      const currentHabits = await db
        .selectFrom('daily_habits')
        .selectAll()
        .where('user_id', '=', userId)
        .where('date', '=', payload.date)
        .executeTakeFirst();

      let result;
      if (currentHabits) {
        result = await db
          .updateTable('daily_habits')
          .set({
            training_completed: payload.training_completed,
            nutrition_completed: payload.nutrition_completed,
            movement_completed: payload.movement_completed,
            meditation_completed: payload.meditation_completed,
            daily_points: payload.daily_points,
            steps: payload.steps,
          })
          .where('user_id', '=', userId)
          .where('date', '=', payload.date)
          .returning([
            'id', 'user_id', 'date', 'training_completed', 'nutrition_completed',
            'movement_completed', 'meditation_completed', 'daily_points', 'steps'
          ])
          .executeTakeFirst();
      } else {
        result = await db
          .insertInto('daily_habits')
          .values(payload)
          .returning([
            'id', 'user_id', 'date', 'training_completed', 'nutrition_completed',
            'movement_completed', 'meditation_completed', 'daily_points', 'steps'
          ])
          .executeTakeFirst();
      }

      console.log('Daily habits updated successfully:', result);
      res.json(result);
    } catch (error) {
      console.error('Error updating daily habits:', error);
      await SystemLogger.logCriticalError('Daily habits update error', error as Error, { userId: req.user?.id });
      sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al actualizar hábitos diarios');
    }
  }
);

export default router;
