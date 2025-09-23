import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/error-handling';
import { useAuth } from '@/contexts/AuthContext';

// Query keys
export const AUTH_KEYS = {
  all: ['auth'] as const,
  user: () => [...AUTH_KEYS.all, 'user'] as const,
};

// This hook now gets the user data from the AuthContext,
// which is the source of truth for the authenticated user state.
export function useCurrentUser() {
  const { user, isLoading } = useAuth();
  return { data: user, isLoading };
}

// The login, register, and logout logic is now primarily handled by the AuthContext
// using the Supabase client. These hooks can be kept for consistency in component-level
// API interactions if needed, but they will wrap the context methods.

export function useLogin() {
  const { login } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      await login(credentials.email, credentials.password);
    },
    onSuccess: () => {
      // Invalidate queries to refetch data for the new user
      queryClient.invalidateQueries();
    },
  });
}

export function useRegister() {
  const { register } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: { full_name: string; email: string; password: string }) => {
      await register(userData.full_name, userData.email, userData.password);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
  });
}

export function useLogout() {
  const { logout } = useAuth();
  const queryClient = useQueryClient();

  return () => {
    logout().then(() => {
      // Clear all cached data on logout
      queryClient.clear();
    });
  };
}
