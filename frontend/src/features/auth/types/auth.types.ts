export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  date_of_birth?: string;
}

export interface UserProfile {
  id: number;
  user: number;
  bio?: string;
  gender?: 'M' | 'F' | 'O';
  profile_picture?: string;
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  password_confirm: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  message: string;
}

export interface RegisterResponse {
  user: User;
  token: string;
  message: string;
}

export interface UpdateProfileRequest {
  bio?: string;
  gender?: 'M' | 'F' | 'O';
  address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
}
