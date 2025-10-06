/**
 * React Query hooks for Evaluations API
 * Sistema de evaluaciones: IMC, PARQ+, IPAQ, PSS-10, WHOQOL-BREF
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ============================================================================
// Types
// ============================================================================

export type EvaluationType = 'imc' | 'parq' | 'ipaq' | 'pss10' | 'whoqol';

export interface Evaluation {
  id: string;
  user_id: string;
  type: EvaluationType;
  data: Record<string, any>;
  interpretation?: string;
  assigned_by?: string;
  status: 'pending' | 'completed';
  completed_at?: string;
  created_at: string;
}

export interface IMCData {
  weight: number;
  height: number;
  imc: number;
  category: string;
  recommendation: string;
}

export interface IMCCalculationResponse {
  imc: number;
  category: string;
  recommendation: string;
}

// ============================================================================
// Hooks
// ============================================================================

/**
 * Get all evaluations for current user
 */
export function useEvaluations(type?: EvaluationType) {
  return useQuery<Evaluation[]>({
    queryKey: ['evaluations', type],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      const url = type
        ? `${API_BASE}/api/evaluations?type=${type}`
        : `${API_BASE}/api/evaluations`;

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch evaluations');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Get latest evaluation by type
 */
export function useLatestEvaluation(type: EvaluationType) {
  return useQuery<Evaluation>({
    queryKey: ['evaluation-latest', type],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`${API_BASE}/api/evaluations/latest?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          return null as any;
        }
        throw new Error('Failed to fetch latest evaluation');
      }

      return response.json();
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Create new evaluation
 */
export function useCreateEvaluation() {
  const queryClient = useQueryClient();

  return useMutation<
    { message: string; evaluation: Evaluation },
    Error,
    { type: EvaluationType; data: Record<string, any>; interpretation?: string }
  >({
    mutationFn: async ({ type, data, interpretation }) => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`${API_BASE}/api/evaluations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, data, interpretation }),
      });

      if (!response.ok) {
        throw new Error('Failed to create evaluation');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations'] });
      queryClient.invalidateQueries({ queryKey: ['evaluation-latest', data.evaluation.type] });
    },
  });
}

/**
 * Calculate IMC
 */
export function useCalculateIMC() {
  return useMutation<
    IMCCalculationResponse,
    Error,
    { weight: number; height: number }
  >({
    mutationFn: async ({ weight, height }) => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        throw new Error('No authenticated session');
      }

      const response = await fetch(`${API_BASE}/api/evaluations/calculate-imc`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ weight, height }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate IMC');
      }

      return response.json();
    },
  });
}
