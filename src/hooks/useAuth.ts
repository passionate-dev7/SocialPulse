// Authentication hook for the SocialPulse platform
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api';
import { ApiResponse } from '../types/trading';

interface User {
  address: string;
  username?: string;
  email?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
    autoFollowSettings: {
      enabled: boolean;
      maxRisk: number;
    };
  };
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// Get current authenticated user
export const useAuth = () => {
  return useQuery({
    queryKey: ['auth', 'user'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) return null;

      const response = await apiClient.get<ApiResponse<User>>('/auth/me');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: false, // Don't retry auth requests
  });
};

// Login with wallet
export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      address,
      signature,
      message,
    }: {
      address: string;
      signature: string;
      message: string;
    }) => {
      const response = await apiClient.post<ApiResponse<{
        user: User;
        token: string;
      }>>('/auth/login', {
        address,
        signature,
        message,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // Store token
      localStorage.setItem('auth_token', data.token);
      
      // Update cache
      queryClient.setQueryData(['auth', 'user'], data.user);
      
      // Invalidate other queries that depend on auth
      queryClient.invalidateQueries({
        queryKey: ['portfolio'],
      });
      
      queryClient.invalidateQueries({
        queryKey: ['copyTrading'],
      });
    },
  });
};

// Logout
export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      // Clear token
      localStorage.removeItem('auth_token');
      
      // Clear all cached data
      queryClient.clear();
    },
  });
};

// Update user preferences
export const useUpdatePreferences = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (preferences: Partial<User['preferences']>) => {
      const response = await apiClient.put<ApiResponse<User>>(
        '/auth/preferences',
        preferences
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'user'], data);
    },
  });
};