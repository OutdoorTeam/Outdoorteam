/**
 * Custom Hooks para Actividades METs
 * Academia de Hábitos Saludables
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabase';

// Importar tipos
import type {
  Activity,
  UserActivity,
  ActivityCategory,
  ActivitiesResponse,
  RegisterActivityResponse,
  ActivityHistoryResponse,
} from '@shared/types-v2';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Hook: Obtener catálogo completo de actividades
 *
 * @example
 * const { data, isLoading } = useActivitiesCatalog();
 * // data.activities - Array de actividades
 * // data.groupedByCategory - Actividades agrupadas por categoría
 */
export function useActivitiesCatalog(category?: string, search?: string) {
  return useQuery<ActivitiesResponse>({
    queryKey: ['activities-catalog', category, search],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (search) params.append('search', search);

      const url = `${API_BASE}/api/activities?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener actividades');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 10, // Los datos son válidos por 10 minutos
  });
}

/**
 * Hook: Obtener lista de categorías
 *
 * @example
 * const { data: categories } = useActivityCategories();
 * // categories = [{ value: 'hogar', label: 'Hogar' }, ...]
 */
export function useActivityCategories() {
  return useQuery<{ categories: ActivityCategory[] }>({
    queryKey: ['activity-categories'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(`${API_BASE}/api/activities/categories`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener categorías');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 30, // Categorías cambian raramente
  });
}

/**
 * Hook: Registrar una actividad completada
 *
 * @example
 * const registerActivity = useRegisterActivity();
 *
 * registerActivity.mutate({
 *   activity_id: 5,
 *   duration_minutes: 30,
 * });
 */
export function useRegisterActivity() {
  const queryClient = useQueryClient();

  return useMutation<
    RegisterActivityResponse,
    Error,
    { activity_id: number; duration_minutes: number; date?: string }
  >({
    mutationFn: async (data) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(`${API_BASE}/api/activities/register`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al registrar actividad');
      }

      return response.json();
    },
    onSuccess: () => {
      // Invalidar queries para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['activity-history'] });
      queryClient.invalidateQueries({ queryKey: ['daily-vitality'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
}

/**
 * Hook: Obtener historial de actividades del usuario
 *
 * @example
 * const { data } = useActivityHistory({ date: '2025-10-06' });
 * // data.activities - Array de actividades del día
 */
export function useActivityHistory(params?: {
  date?: string;
  from?: string;
  to?: string;
  limit?: number;
}) {
  return useQuery<ActivityHistoryResponse>({
    queryKey: ['activity-history', params],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const searchParams = new URLSearchParams();
      if (params?.date) searchParams.append('date', params.date);
      if (params?.from) searchParams.append('from', params.from);
      if (params?.to) searchParams.append('to', params.to);
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const url = `${API_BASE}/api/activities/history?${searchParams.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener historial');
      }

      return response.json();
    },
  });
}

/**
 * Hook: Obtener actividades del día actual
 *
 * @example
 * const { data: todayActivities } = useTodayActivities();
 */
export function useTodayActivities() {
  const today = new Date().toISOString().split('T')[0];
  return useActivityHistory({ date: today });
}

/**
 * Hook: Eliminar una actividad del historial
 *
 * @example
 * const deleteActivity = useDeleteActivity();
 * deleteActivity.mutate('activity-id-uuid');
 */
export function useDeleteActivity() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, string>({
    mutationFn: async (activityId) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(`${API_BASE}/api/activities/history/${activityId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al eliminar actividad');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity-history'] });
      queryClient.invalidateQueries({ queryKey: ['daily-vitality'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
}

/**
 * Hook: Calcular puntos de vitalidad estimados
 * Útil para mostrar cálculos antes de registrar
 *
 * @example
 * const points = useCalculateVitalityPoints(4.3, 30);
 * // points = 64
 */
export function useCalculateVitalityPoints(mets: number, durationMinutes: number): number {
  const totalMets = mets * durationMinutes;
  return Math.floor(totalMets / 2);
}
