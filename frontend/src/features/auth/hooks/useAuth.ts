import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, RegisterRequest, ChangePasswordRequest, UpdateProfileRequest } from '../types/auth.types';

export const useLogin = () => {
  const { setAuth } = useAuthStore();
  
  return useMutation({
    mutationFn: (credentials: LoginRequest) => authService.login(credentials),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });
};

export const useRegister = () => {
  const { setAuth } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token);
    },
  });
};

export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      logout();
      queryClient.clear();
    },
  });
};

export const useMe = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['user', 'me'],
    queryFn: () => authService.getMe(),
    enabled: isAuthenticated,
  });
};

export const useMyProfile = () => {
  const { isAuthenticated } = useAuthStore();
  
  return useQuery({
    queryKey: ['profile', 'me'],
    queryFn: () => authService.getMyProfile(),
    enabled: isAuthenticated,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => authService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) => authService.changePassword(data),
  });
};

export const useDeleteAccount = () => {
  const { logout } = useAuthStore();
  
  return useMutation({
    mutationFn: () => authService.deleteAccount(),
    onSuccess: () => {
      logout();
    },
  });
};
