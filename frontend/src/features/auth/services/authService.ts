import api from '../../../lib/api';
import type {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  User,
  UserProfile,
  UpdateProfileRequest,
  ChangePasswordRequest,
} from '../types/auth.types';

export const authService = {
  // Authentication
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/users/login/', credentials);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/api/auth/users/register/', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/users/logout/');
  },

  // User
  getMe: async (): Promise<User> => {
    const response = await api.get<User>('/api/auth/users/me/');
    return response.data;
  },

  // Profile
  getMyProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/api/auth/profiles/my_profile/');
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<{ profile: UserProfile; message: string }> => {
    const response = await api.put('/api/auth/users/update_profile/', data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordRequest): Promise<{ message: string }> => {
    const response = await api.post('/api/auth/users/change_password/', data);
    return response.data;
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/api/auth/users/delete_account/');
  },
};
