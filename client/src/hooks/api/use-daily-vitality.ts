/**
 * React Query hooks for Daily Vitality API
 * Manages weekly vitality points and daily progress
 */

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ============================================================================
// Types
// ============================================================================

export interface DailyVitality {
  id: string;
  user_id: string;
  date: string;
  daily_steps: number;
  steps_goal_reached: boolean;
  training_block_completed: boolean;
  active_pause_completed: boolean;
  meditation_completed: boolean;
  main_activities_points: number;
  extra_activities_points: number;
  total_points: number;
  created_at: string;
  updated_at: string;
}

export interface WeeklyVitalityResponse {
  week_start: string;
  week_end: string;
  current_points: number;
  goal_points: number;
  percentage: number;
  daily_breakdown: Array<{
    date: string;
    total_points: number;
    main_activities_points: number;
    extra_activities_points: number;
  }>;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Get current week vitality points
 */
export function useWeeklyVitality() {
  return useQuery<WeeklyVitalityResponse>({
    queryKey: ['weekly-vitality'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`${API_BASE}/api/vitality/weekly`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch weekly vitality');
      }

      return response.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });
}

/**
 * Get today's vitality data
 */
export function useTodayVitality() {
  return useQuery<DailyVitality>({
    queryKey: ['today-vitality'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`${API_BASE}/api/vitality/daily?date=${today}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch today vitality');
      }

      return response.json();
    },
    staleTime: 1000 * 30, // 30 seconds
  });
}

/**
 * Get vitality calendar data for a month
 */
export function useVitalityCalendar(month: Date) {
  const yearMonth = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;

  return useQuery<Array<{ date: string; total_points: number }>>({
    queryKey: ['vitality-calendar', yearMonth],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`${API_BASE}/api/vitality/calendar?month=${yearMonth}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch vitality calendar');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
