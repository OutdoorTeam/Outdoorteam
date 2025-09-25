import { Router } from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendErrorResponse, ERROR_CODES } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';

const router = Router();

const isoDate = (value: string | Date) => (value instanceof Date ? value.toISOString().split('T')[0] : value.split('T')[0]);

const computeTotalPoints = (flags: { exercise: boolean; nutrition: boolean; movement: boolean; meditation: boolean }) =>
  Number(flags.exercise) + Number(flags.nutrition) + Number(flags.movement) + Number(flags.meditation);

const formatHabitLog = (row: any) => {
  const exercise = Boolean(row.exercise);
  const nutrition = Boolean(row.nutrition);
  const movement = Boolean(row.movement);
  const meditation = Boolean(row.meditation);

  return {
    day: isoDate(row.day),
    steps: row.steps || 0,
    exercise,
    nutrition,
    movement,
    meditation,
    total_points: computeTotalPoints({ exercise, nutrition, movement, meditation }),
  };
};

const validateDay = (value: string | undefined): Date | null => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
};

const upsertHabitLog = async (
  userId: string,
  day: Date,
  payload: {
    exercise?: boolean;
    nutrition?: boolean;
    movement?: boolean;
    meditation?: boolean;
    steps?: number;
  },
) => {
  const existing = await db
    .selectFrom('habit_logs')
    .select(['day', 'exercise', 'nutrition', 'movement', 'meditation', 'steps'])
    .where('user_id', '=', userId)
    .where('day', '=', day)
    .executeTakeFirst();

  const now = new Date();
  const nextExercise = payload.exercise ?? existing?.exercise ?? false;
  const nextNutrition = payload.nutrition ?? existing?.nutrition ?? false;
  const nextMovement = payload.movement ?? existing?.movement ?? false;
  const nextMeditation = payload.meditation ?? existing?.meditation ?? false;
  const nextSteps = payload.steps ?? existing?.steps ?? 0;

  if (existing) {
    const updated = await db
      .updateTable('habit_logs')
      .set({
        exercise: nextExercise,
        nutrition: nextNutrition,
        movement: nextMovement,
        meditation: nextMeditation,
        steps: nextSteps,
        updated_at: now,
      })
      .where('user_id', '=', userId)
      .where('day', '=', day)
      .returning(['day', 'exercise', 'nutrition', 'movement', 'meditation', 'steps', 'updated_at'])
      .executeTakeFirst();

    if (!updated) {
      throw new Error('Failed to update habit log');
    }

    return updated;
  }

  const inserted = await db
    .insertInto('habit_logs')
    .values({
      user_id: userId,
      day,
      exercise: nextExercise,
      nutrition: nextNutrition,
      movement: nextMovement,
      meditation: nextMeditation,
      steps: nextSteps,
      created_at: now,
      updated_at: now,
    })
    .returning(['day', 'exercise', 'nutrition', 'movement', 'meditation', 'steps', 'updated_at'])
    .executeTakeFirst();

  if (!inserted) {
    throw new Error('Failed to create habit log');
  }

  return inserted;
};

router.get('/daily-habits/today', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const todayStr = new Date().toISOString().split('T')[0];
    const todayDate = new Date(todayStr);

    console.log('Fetching today habits for user:', userId, 'date:', todayStr);

    let log = await db
      .selectFrom('habit_logs')
      .select(['day', 'exercise', 'nutrition', 'movement', 'meditation', 'steps'])
      .where('user_id', '=', userId)
      .where('day', '=', todayDate)
      .executeTakeFirst();

    if (!log) {
      log = await db
        .insertInto('habit_logs')
        .values({
          user_id: userId,
          day: todayDate,
          exercise: false,
          nutrition: false,
          movement: false,
          meditation: false,
          steps: 0,
          created_at: new Date(),
          updated_at: new Date(),
        })
        .returning(['day', 'exercise', 'nutrition', 'movement', 'meditation', 'steps'])
        .executeTakeFirst();
    }

    if (!log) {
      throw new Error('Unable to create habit log');
    }

    res.json(formatHabitLog(log));
  } catch (error) {
    console.error('Error fetching today habits:', error);
    await SystemLogger.logCriticalError('Today habits fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener hábitos de hoy');
  }
});

router.get('/daily-habits/weekly-points', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weeklyLogs = await db
      .selectFrom('habit_logs')
      .select(['day', 'exercise', 'nutrition', 'movement', 'meditation'])
      .where('user_id', '=', userId)
      .where('day', '>=', weekStart)
      .orderBy('day', 'asc')
      .execute();

    const dailyData = weeklyLogs.map((log) => ({
      date: isoDate(log.day),
      daily_points: computeTotalPoints({
        exercise: Boolean(log.exercise),
        nutrition: Boolean(log.nutrition),
        movement: Boolean(log.movement),
        meditation: Boolean(log.meditation),
      }),
    }));

    const totalPoints = dailyData.reduce((sum, day) => sum + day.daily_points, 0);

    res.json({
      total_points: totalPoints,
      daily_data: dailyData,
      week_start: weekStart.toISOString().split('T')[0],
    });
  } catch (error) {
    console.error('Error fetching weekly points:', error);
    await SystemLogger.logCriticalError('Weekly points fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener puntos semanales');
  }
});

router.get('/daily-habits/calendar', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    const startDate = new Date(today);
    startDate.setMonth(today.getMonth() - 3);

    const logs = await db
      .selectFrom('habit_logs')
      .select(['day', 'exercise', 'nutrition', 'movement', 'meditation'])
      .where('user_id', '=', userId)
      .where('day', '>=', startDate)
      .orderBy('day', 'desc')
      .execute();

    const calendarData = logs.map((log) => ({
      date: isoDate(log.day),
      daily_points: computeTotalPoints({
        exercise: Boolean(log.exercise),
        nutrition: Boolean(log.nutrition),
        movement: Boolean(log.movement),
        meditation: Boolean(log.meditation),
      }),
    }));

    res.json(calendarData);
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    await SystemLogger.logCriticalError('Calendar data fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener datos del calendario');
  }
});

router.put('/daily-habits/update', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;
    const { day, date, exercise, nutrition, movement, meditation, steps } = req.body as {
      day?: string;
      date?: string;
      exercise?: boolean;
      nutrition?: boolean;
      movement?: boolean;
      meditation?: boolean;
      steps?: number;
    };

    const target = validateDay(day ?? date);
    if (!target) {
      sendErrorResponse(res, ERROR_CODES.VALIDATION_ERROR, 'Fecha requerida (YYYY-MM-DD)');
      return;
    }

    console.log('Updating daily habits for user:', userId, 'day:', target.toISOString().split('T')[0], 'data:', req.body);

    const updatedLog = await upsertHabitLog(userId, target, {
      exercise: exercise !== undefined ? Boolean(exercise) : undefined,
      nutrition: nutrition !== undefined ? Boolean(nutrition) : undefined,
      movement: movement !== undefined ? Boolean(movement) : undefined,
      meditation: meditation !== undefined ? Boolean(meditation) : undefined,
      steps: steps !== undefined ? Number(steps) : undefined,
    });

    res.json(formatHabitLog(updatedLog));
  } catch (error) {
    console.error('Error updating daily habits:', error);
    await SystemLogger.logCriticalError('Daily habits update error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al actualizar hábitos diarios');
  }
});

export default router;
