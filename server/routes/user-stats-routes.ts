import express from 'express';
import { db } from '../database.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { SystemLogger } from '../utils/logging.js';
import { ERROR_CODES, sendErrorResponse } from '../utils/validation.js';

const router = express.Router();

const isoDate = (value: string | Date) => {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  return value.split('T')[0];
};

const mapHabitLog = (row: any) => {
  const exercise = Boolean(row.exercise);
  const nutrition = Boolean(row.nutrition);
  const movement = Boolean(row.movement);
  const meditation = Boolean(row.meditation);
  const points = [exercise, nutrition, movement, meditation].reduce((sum, flag) => sum + (flag ? 1 : 0), 0);

  return {
    date: isoDate(row.day),
    exercise,
    nutrition,
    movement,
    meditation,
    points,
    steps: row.steps || 0,
  };
};

const aggregateWeekly = (logs: ReturnType<typeof mapHabitLog>[], weekStartStr: string) => {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStartStr);
    day.setDate(day.getDate() + i);
    days.push(day.toISOString().split('T')[0]);
  }

  return days.map((date) => {
    const entry = logs.find((log) => log.date === date);
    return {
      date,
      points: entry?.points || 0,
    };
  });
};

const computeHabitCompletion = (logs: ReturnType<typeof mapHabitLog>[]) => {
  const totalDays = logs.length;
  if (totalDays === 0) {
    return {
      training: 0,
      nutrition: 0,
      movement: 0,
      meditation: 0,
    };
  }

  return {
    training: (logs.filter((log) => log.exercise).length / totalDays) * 100,
    nutrition: (logs.filter((log) => log.nutrition).length / totalDays) * 100,
    movement: (logs.filter((log) => log.movement).length / totalDays) * 100,
    meditation: (logs.filter((log) => log.meditation).length / totalDays) * 100,
  };
};

const fetchHabitLogs = async (userId: string, startDate: string) => {
  const boundary = new Date(startDate);
  return db
    .selectFrom('habit_logs')
    .select(['day', 'exercise', 'nutrition', 'movement', 'meditation', 'steps'])
    .where('user_id', '=', userId)
    .where('day', '>=', boundary)
    .orderBy('day', 'asc')
    .execute();
};

const buildMonthlyData = (logs: ReturnType<typeof mapHabitLog>[]) =>
  logs.map((log) => ({
    date: log.date,
    training: log.exercise ? 1 : 0,
    nutrition: log.nutrition ? 1 : 0,
    movement: log.movement ? 1 : 0,
    meditation: log.meditation ? 1 : 0,
    points: log.points,
    steps: log.steps,
  }));

const summariseMonthly = (logs: ReturnType<typeof mapHabitLog>[]) => {
  const totalPoints = logs.reduce((sum, log) => sum + log.points, 0);
  const totalSteps = logs.reduce((sum, log) => sum + log.steps, 0);
  const totalDays = logs.length;
  const averageDailyPoints = totalDays > 0 ? totalPoints / totalDays : 0;
  const averageSteps = totalDays > 0 ? totalSteps / totalDays : 0;
  return { totalPoints, totalSteps, totalDays, averageDailyPoints, averageSteps };
};

const formatHabitCompletionPercentages = (completion: ReturnType<typeof computeHabitCompletion>) => ({
  training: completion.training,
  nutrition: completion.nutrition,
  movement: completion.movement,
  meditation: completion.meditation,
});

// Get user statistics (admin view or own stats)
router.get('/stats/user/:userId', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const { userId } = req.params;
    const requestingUserId = String(req.user.id);
    const requestingUserRole = req.user.role;
    const targetUserId = String(userId);

    if (requestingUserRole !== 'admin' && targetUserId !== requestingUserId) {
      sendErrorResponse(res, ERROR_CODES.AUTHORIZATION_ERROR, 'Acceso denegado');
      return;
    }

    console.log('Fetching user statistics for:', targetUserId);

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const weeklyLogsRaw = await fetchHabitLogs(targetUserId, weekStartStr);
    const monthlyLogsRaw = await fetchHabitLogs(targetUserId, thirtyDaysAgoStr);

    const weeklyLogs = weeklyLogsRaw.map(mapHabitLog);
    const monthlyLogs = monthlyLogsRaw.map(mapHabitLog);

    const weeklyData = aggregateWeekly(weeklyLogs, weekStartStr);
    const weekly_points = weeklyData.reduce((sum, entry) => sum + entry.points, 0);

    const monthlyData = buildMonthlyData(monthlyLogs);
    const { totalPoints, totalSteps, totalDays, averageDailyPoints, averageSteps } = summariseMonthly(monthlyLogs);

    const habitCompletionRaw = computeHabitCompletion(monthlyLogs);
    const habit_completion = formatHabitCompletionPercentages(habitCompletionRaw);
    const completion_rate = (habit_completion.training + habit_completion.nutrition + habit_completion.movement + habit_completion.meditation) / 4;

    const stats = {
      weekly_points,
      average_daily_points: averageDailyPoints,
      total_active_days: totalDays,
      average_steps: averageSteps,
      completion_rate,
      weekly_data: weeklyData,
      monthly_data: monthlyData,
      habit_completion,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user statistics:', error);
    await SystemLogger.logCriticalError('User statistics fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener estadísticas del usuario');
  }
});

// Get current user's own statistics
router.get('/stats/my-stats', authenticateToken, async (req: any, res: express.Response) => {
  try {
    const userId = req.user.id;

    console.log('Fetching own statistics for user:', userId);

    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekStartStr = weekStart.toISOString().split('T')[0];

    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    const weeklyLogsRaw = await fetchHabitLogs(userId, weekStartStr);
    const monthlyLogsRaw = await fetchHabitLogs(userId, thirtyDaysAgoStr);

    const weeklyLogs = weeklyLogsRaw.map(mapHabitLog);
    const monthlyLogs = monthlyLogsRaw.map(mapHabitLog);

    const weeklyData = aggregateWeekly(weeklyLogs, weekStartStr);
    const weekly_points = weeklyData.reduce((sum, entry) => sum + entry.points, 0);

    const monthlyData = buildMonthlyData(monthlyLogs);
    const { totalPoints, totalSteps, totalDays, averageDailyPoints, averageSteps } = summariseMonthly(monthlyLogs);

    const habitCompletionRaw = computeHabitCompletion(monthlyLogs);
    const habit_completion = formatHabitCompletionPercentages(habitCompletionRaw);
    const completion_rate = (habit_completion.training + habit_completion.nutrition + habit_completion.movement + habit_completion.meditation) / 4;

    const stats = {
      weekly_points,
      average_daily_points: averageDailyPoints,
      total_active_days: totalDays,
      average_steps: averageSteps,
      completion_rate,
      weekly_data: weeklyData,
      monthly_data: monthlyData,
      habit_completion,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching own statistics:', error);
    await SystemLogger.logCriticalError('Own statistics fetch error', error as Error, { userId: req.user?.id });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener tus estadísticas');
  }
});

export default router;


