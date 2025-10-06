/**
 * Custom Hooks para Bloques de Entrenamiento
 * Academia de Hábitos Saludables
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/supabase';

// Importar tipos
import type {
  TrainingBlock,
  TrainingBlockType,
  UserTrainingSession,
  TrainingBlocksResponse,
  CompleteTrainingBlockResponse,
  TrainingSessionsResponse,
  TrainingStatsResponse,
  TrainingBlockTypeInfo,
} from '@shared/types-v2';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Hook: Obtener bloques de entrenamiento
 *
 * @example
 * const { data, isLoading } = useTrainingBlocks('hiit');
 * // data.blocks - Array de bloques HIIT
 */
export function useTrainingBlocks(type?: TrainingBlockType, level?: number) {
  return useQuery<TrainingBlocksResponse>({
    queryKey: ['training-blocks', type, level],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const params = new URLSearchParams();
      if (type) params.append('type', type);
      if (level) params.append('level', level.toString());

      const url = `${API_BASE}/api/training-blocks?${params.toString()}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener bloques de entrenamiento');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });
}

/**
 * Hook: Obtener tipos de bloques disponibles
 *
 * @example
 * const { data: types } = useTrainingBlockTypes();
 * // types = [{ value: 'hiit', label: 'HIIT', points: 3.0, ... }]
 */
export function useTrainingBlockTypes() {
  return useQuery<{ types: TrainingBlockTypeInfo[] }>({
    queryKey: ['training-block-types'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(`${API_BASE}/api/training-blocks/types`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener tipos de bloques');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 30, // 30 minutos (raramente cambia)
  });
}

/**
 * Hook: Obtener detalle de un bloque específico
 *
 * @example
 * const { data: block } = useTrainingBlock(5);
 */
export function useTrainingBlock(blockId: number) {
  return useQuery<TrainingBlock>({
    queryKey: ['training-block', blockId],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(`${API_BASE}/api/training-blocks/${blockId}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Bloque no encontrado');
      }

      return response.json();
    },
    enabled: !!blockId, // Solo ejecutar si hay ID
  });
}

/**
 * Hook: Completar un bloque de entrenamiento
 *
 * @example
 * const completeBlock = useCompleteTrainingBlock();
 *
 * completeBlock.mutate({
 *   block_id: 5,
 *   date: '2025-10-06'
 * });
 */
export function useCompleteTrainingBlock() {
  const queryClient = useQueryClient();

  return useMutation<
    CompleteTrainingBlockResponse,
    Error,
    { block_id: number; date?: string }
  >({
    mutationFn: async (data) => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(`${API_BASE}/api/training-blocks/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Error al completar bloque');
      }

      return response.json();
    },
    onSuccess: () => {
      // Refrescar datos relacionados
      queryClient.invalidateQueries({ queryKey: ['training-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['training-stats'] });
      queryClient.invalidateQueries({ queryKey: ['daily-vitality'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
    },
  });
}

/**
 * Hook: Obtener historial de sesiones de entrenamiento
 *
 * @example
 * const { data } = useTrainingSessions({ date: '2025-10-06' });
 */
export function useTrainingSessions(params?: {
  date?: string;
  from?: string;
  to?: string;
  limit?: number;
}) {
  return useQuery<TrainingSessionsResponse>({
    queryKey: ['training-sessions', params],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const searchParams = new URLSearchParams();
      if (params?.date) searchParams.append('date', params.date);
      if (params?.from) searchParams.append('from', params.from);
      if (params?.to) searchParams.append('to', params.to);
      if (params?.limit) searchParams.append('limit', params.limit.toString());

      const url = `${API_BASE}/api/training-blocks/sessions/history?${searchParams.toString()}`;
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
 * Hook: Obtener sesiones de hoy
 *
 * @example
 * const { data: todaySessions } = useTodayTrainingSessions();
 */
export function useTodayTrainingSessions() {
  const today = new Date().toISOString().split('T')[0];
  return useTrainingSessions({ date: today });
}

/**
 * Hook: Obtener estadísticas de entrenamiento
 *
 * @example
 * const { data: stats } = useTrainingStats();
 * // stats.total_sessions, stats.month_vitality_points, etc.
 */
export function useTrainingStats() {
  return useQuery<TrainingStatsResponse>({
    queryKey: ['training-stats'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No autenticado');

      const response = await fetch(`${API_BASE}/api/training-blocks/sessions/stats`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook: Obtener bloques recomendados según nivel del usuario
 *
 * @example
 * const { data: recommended } = useRecommendedBlocks();
 */
export function useRecommendedBlocks() {
  // Obtener nivel del usuario desde el contexto o API
  // Por ahora retornamos todos
  return useTrainingBlocks();
}
