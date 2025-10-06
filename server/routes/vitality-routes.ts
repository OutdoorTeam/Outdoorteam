/**
 * API Routes: Daily Vitality
 * Manages weekly vitality points tracking
 */

import express, { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE || process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ============================================================================
// GET /api/vitality/weekly - Get current week vitality
// ============================================================================

router.get('/weekly', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Get user's weekly goal
    const { data: userData } = await supabase
      .from('users')
      .select('weekly_vitality_goal')
      .eq('id', userId)
      .single();

    const weeklyGoal = userData?.weekly_vitality_goal || 28;

    // Calculate current week boundaries (Monday to Sunday)
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const weekStart = monday.toISOString().split('T')[0];
    const weekEnd = sunday.toISOString().split('T')[0];

    // Get daily vitality for current week
    const { data: dailyData, error } = await supabase
      .from('daily_vitality')
      .select('date, total_points, main_activities_points, extra_activities_points')
      .eq('user_id', userId)
      .gte('date', weekStart)
      .lte('date', weekEnd)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching weekly vitality:', error);
      return res.status(500).json({ error: 'Failed to fetch weekly vitality' });
    }

    const dailyBreakdown = dailyData || [];
    const currentPoints = dailyBreakdown.reduce((sum, day) => sum + (day.total_points || 0), 0);
    const percentage = weeklyGoal > 0 ? (currentPoints / weeklyGoal) * 100 : 0;

    res.json({
      week_start: weekStart,
      week_end: weekEnd,
      current_points: currentPoints,
      goal_points: weeklyGoal,
      percentage: Math.round(percentage * 10) / 10,
      daily_breakdown: dailyBreakdown,
    });

  } catch (error) {
    console.error('Error in /api/vitality/weekly:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// GET /api/vitality/daily - Get daily vitality for a specific date
// ============================================================================

router.get('/daily', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { date } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const targetDate = date ? String(date) : new Date().toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_vitality')
      .select('*')
      .eq('user_id', userId)
      .eq('date', targetDate)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Error fetching daily vitality:', error);
      return res.status(500).json({ error: 'Failed to fetch daily vitality' });
    }

    // If no data exists for today, return default values
    if (!data) {
      return res.json({
        user_id: userId,
        date: targetDate,
        daily_steps: 0,
        steps_goal_reached: false,
        training_block_completed: false,
        active_pause_completed: false,
        meditation_completed: false,
        main_activities_points: 0,
        extra_activities_points: 0,
        total_points: 0,
      });
    }

    res.json(data);

  } catch (error) {
    console.error('Error in /api/vitality/daily:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ============================================================================
// GET /api/vitality/calendar - Get vitality calendar data for a month
// ============================================================================

router.get('/calendar', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { month } = req.query; // Format: YYYY-MM

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!month || !/^\d{4}-\d{2}$/.test(String(month))) {
      return res.status(400).json({ error: 'Invalid month format. Use YYYY-MM' });
    }

    const [year, monthNum] = String(month).split('-').map(Number);
    const startDate = new Date(year, monthNum - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, monthNum, 0).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('daily_vitality')
      .select('date, total_points')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching vitality calendar:', error);
      return res.status(500).json({ error: 'Failed to fetch vitality calendar' });
    }

    res.json(data || []);

  } catch (error) {
    console.error('Error in /api/vitality/calendar:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
