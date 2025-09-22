import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/utils/error-handling';

export interface AvatarConfig {
  id: number;
  user_id: number;
  gender: 'male' | 'female' | 'non-binary';
  skin_tone: string;
  hair_style: string;
  hair_color: string;
  shirt_style: string;
  shirt_color: string;
  pants_style: string;
  pants_color: string;
  accessory: string;
  vitality_level: number;
}

// Query keys
export const AVATAR_KEYS = {
  all: ['avatar'] as const,
  mine: () => [...AVATAR_KEYS.all, 'mine'] as const,
};

// Hook to get current user's avatar
export function useAvatar() {
  return useQuery<AvatarConfig>({
    queryKey: AVATAR_KEYS.mine(),
    queryFn: () => apiRequest('/api/avatar'),
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: true,
  });
}

// Hook to update user's avatar
export function useUpdateAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: Partial<Omit<AvatarConfig, 'id' | 'user_id' | 'vitality_level'>>) =>
      apiRequest('/api/avatar', {
        method: 'PUT',
        body: JSON.stringify(config),
      }),
    onSuccess: (updatedAvatar) => {
      // Optimistically update the cache
      queryClient.setQueryData(AVATAR_KEYS.mine(), updatedAvatar);
      // Invalidate to ensure it's fresh on next fetch
      queryClient.invalidateQueries({ queryKey: AVATAR_KEYS.mine() });
    },
  });
}
