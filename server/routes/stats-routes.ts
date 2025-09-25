import { Router } from 'express';
import { db } from '../database.js';
import { authenticateToken } from '../middleware/auth.js';
import { sendErrorResponse, ERROR_CODES } from '../utils/validation.js';
import { SystemLogger } from '../utils/logging.js';

const router = Router();

const toDateString = (value: string | Date) => {
  if (value instanceof Date) {
    return value.toISOString().split('T')[0];
  }
  return value.split('T')[0];
};

const mapHabitLogRow = (row: any) => {
  const date = toDateString(row.day);
  const exercise = Boolean(row.exercise);
  const nutrition = Boolean(row.nutrition);
  const movement = Boolean(row.movement);
  const meditation = Boolean(row.meditation);
  const daily_points = [exercise, nutrition, movement, meditation].reduce((sum, flag) => sum + (flag ? 1 : 0), 0);

  return {
    date,
    daily_points,
    steps: row.steps || 0,
    training_completed: exercise ? 1 : 0,
    nutrition_completed: nutrition ? 1 : 0,
    movement_completed: movement ? 1 : 0,
    meditation_completed: meditation ? 1 : 0,
  };
};

// Get user statistics endpoint
router.get('/users/:id/stats', authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const requestingUserId = String(req.user.id);
    const requestingUserRole = req.user.role;

    // Users can only view their own stats unless they're admin
    if (requestingUserRole !== 'admin' && id !== requestingUserId) {
      sendErrorResponse(res, ERROR_CODES.AUTHORIZATION_ERROR, 'Acceso denegado');
      return;
    }

    const userId = String(id);
    console.log('Fetching statistics for user:', userId);

    // Calculate date ranges
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6); // Last 7 days including today

    const monthStart = new Date(today);
    monthStart.setDate(today.getDate() - 29); // Last 30 days including today

    const weekStartStr = weekStart.toISOString().split('T')[0];
    const monthStartStr = monthStart.toISOString().split('T')[0];

    console.log('Date ranges - Week:', weekStartStr, 'Month:', monthStartStr);

    // Weekly data - last 7 days
    const weeklyHabitLogs = await db
      .selectFrom('habit_logs')
      .select(['day', 'exercise', 'nutrition', 'movement', 'meditation', 'steps'])
      .where('user_id', '=', userId)
      .where('day', '>=', weekStart)
      .execute();
    const weeklyHabits = weeklyHabitLogs.map(mapHabitLogRow);

    // Monthly data - last 30 days
    const monthlyHabitLogs = await db
      .selectFrom('habit_logs')
      .select(['day', 'exercise', 'nutrition', 'movement', 'meditation', 'steps'])
      .where('user_id', '=', userId)
      .where('day', '>=', monthStart)
      .execute();
    const monthlyHabits = monthlyHabitLogs.map(mapHabitLogRow);

    const weeklyStats = processWeeklyStats(weeklyHabits, weekStartStr);
    const monthlyStats = processMonthlyStats(monthlyHabits);

    console.log('Statistics processed - Weekly points:', weeklyStats.totalPoints, 'Monthly sessions:', monthlyStats.totalMeditationSessions);

    const stats = {
      weekly: weeklyStats,
      monthly: monthlyStats,
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching user stats:', error);
    await SystemLogger.logCriticalError('User stats fetch error', error as Error, { userId: req.user?.id, req });
    sendErrorResponse(res, ERROR_CODES.SERVER_ERROR, 'Error al obtener estadísticas');
  }
});

function processWeeklyStats(weeklyHabits: any[], weekStartStr: string) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const base = new Date(weekStartStr);
    base.setDate(base.getDate() + i);
    days.push(base.toISOString().split('T')[0]);
  }

  const dailyData = days.map((date) => {
    const dayData = weeklyHabits.find((h) => h.date === date);
    const meditationCompleted = dayData?.meditation_completed || 0;

    return {
      date,
      points: dayData?.daily_points || 0,
      steps: dayData?.steps || 0,
      training: dayData?.training_completed || 0,
      nutrition: dayData?.nutrition_completed || 0,
      movement: dayData?.movement_completed || 0,
      meditation: meditationCompleted,
      meditationSessions: meditationCompleted,
      meditationMinutes: 0,
    };
  });

  const totalPoints = dailyData.reduce((sum, day) => sum + day.points, 0);
  const totalSteps = dailyData.reduce((sum, day) => sum + day.steps, 0);
  const totalMeditationSessions = dailyData.reduce((sum, day) => sum + day.meditationSessions, 0);
  const totalMeditationMinutes = 0;
  const averageDailyPoints = totalPoints / 7;

  return {
    dailyData,
    totalPoints,
    totalSteps,
    totalMeditationSessions,
    totalMeditationMinutes,
    averageDailyPoints: Math.round(averageDailyPoints * 10) / 10,
  };
}

function processMonthlyStats(monthlyHabits: any[]) {
  const totalDays = 30;

  const trainingDays = monthlyHabits.filter((h) => h.training_completed).length;
  const nutritionDays = monthlyHabits.filter((h) => h.nutrition_completed).length;
  const movementDays = monthlyHabits.filter((h) => h.movement_completed).length;
  const meditationDays = monthlyHabits.filter((h) => h.meditation_completed).length;

  const habitCompletionRates = {
    training: Math.round((trainingDays / totalDays) * 100),
    nutrition: Math.round((nutritionDays / totalDays) * 100),
    movement: Math.round((movementDays / totalDays) * 100),
    meditation: Math.round((meditationDays / totalDays) * 100),
  };

  const totalPoints = monthlyHabits.reduce((sum, h) => sum + (h.daily_points || 0), 0);
  const totalSteps = monthlyHabits.reduce((sum, h) => sum + (h.steps || 0), 0);

  const habitCompletionData = [
    { name: 'Entrenamiento', completed: trainingDays, total: totalDays, percentage: habitCompletionRates.training },
    { name: 'Nutrición', completed: nutritionDays, total: totalDays, percentage: habitCompletionRates.nutrition },
    { name: 'Movimiento', completed: movementDays, total: totalDays, percentage: habitCompletionRates.movement },
    { name: 'Meditación', completed: meditationDays, total: totalDays, percentage: habitCompletionRates.meditation },
  ];

  return {
    habitCompletionData,
    habitCompletionRates,
    totalPoints,
    totalSteps,
    totalMeditationSessions: meditationDays,
    totalMeditationMinutes: 0,
    completionCounts: {
      training: trainingDays,
      nutrition: nutritionDays,
      movement: movementDays,
      meditation: meditationDays,
    },
  };
}

export default router;
