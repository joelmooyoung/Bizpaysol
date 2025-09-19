import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import { queryKeys, staleTimeConfig } from '@/lib/query-client';
import { LoginRequest, RegisterRequest, AuthResponse, User } from '@/types';
import { toast } from 'react-hot-toast';

// Authentication Queries
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.currentUser,
    queryFn: async () => {
      const response = await apiClient.getCurrentUser();
      return response.data;
    },
    staleTime: staleTimeConfig.normal,
    // Don't refetch user data on window focus
    refetchOnWindowFocus: false,
    // Retry on failure
    retry: 1,
  });
}

// Authentication Mutations
export function useLogin() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.login(credentials);
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      // Cache user data
      queryClient.setQueryData(queryKeys.currentUser, data.user);
      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();
      toast.success('Successfully logged in');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Login failed';
      toast.error(message);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: RegisterRequest) => {
      const response = await apiClient.register(userData);
      return response.data;
    },
    onSuccess: (data: AuthResponse) => {
      // Cache user data
      queryClient.setQueryData(queryKeys.currentUser, data.user);
      // Invalidate all queries to refetch with new auth
      queryClient.invalidateQueries();
      toast.success('Successfully registered');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Registration failed';
      toast.error(message);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.logout();
    },
    onSuccess: () => {
      // Clear all cached data
      queryClient.clear();
      toast.success('Successfully logged out');
    },
    onError: (error: any) => {
      // Still clear cache even if logout request fails
      queryClient.clear();
      const message = error?.response?.data?.error || 'Logout failed';
      toast.error(message);
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (profileData: Partial<User>) => {
      const response = await apiClient.updateProfile(profileData);
      return response.data;
    },
    onSuccess: (updatedUser: User) => {
      // Update cached user data
      queryClient.setQueryData(queryKeys.currentUser, updatedUser);
      toast.success('Profile updated successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Profile update failed';
      toast.error(message);
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (passwordData: { currentPassword: string; newPassword: string }) => {
      const response = await apiClient.changePassword(passwordData);
      return response.data;
    },
    onSuccess: () => {
      toast.success('Password changed successfully');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.error || 'Password change failed';
      toast.error(message);
    },
  });
}