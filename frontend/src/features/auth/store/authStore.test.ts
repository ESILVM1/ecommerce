import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '../types/auth.types';

describe('authStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
    
    // Clear localStorage mock
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    const state = useAuthStore.getState();
    
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
  });

  it('sets auth state with user and token', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_staff: false,
    };
    const mockToken = 'test-token-123';

    useAuthStore.getState().setAuth(mockUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.token).toBe(mockToken);
    expect(state.isAuthenticated).toBe(true);
    expect(state.isAdmin).toBe(false);
  });

  it('sets isAdmin to true when user is staff', () => {
    const adminUser: User = {
      id: 2,
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      is_staff: true,
    };
    const mockToken = 'admin-token-456';

    useAuthStore.getState().setAuth(adminUser, mockToken);

    const state = useAuthStore.getState();
    expect(state.isAdmin).toBe(true);
    expect(state.isAuthenticated).toBe(true);
  });

  it('updates user information', () => {
    const initialUser: User = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_staff: false,
    };

    useAuthStore.getState().setAuth(initialUser, 'token-123');

    const updatedUser: User = {
      ...initialUser,
      first_name: 'Updated',
      last_name: 'Name',
    };

    useAuthStore.getState().setUser(updatedUser);

    const state = useAuthStore.getState();
    expect(state.user?.first_name).toBe('Updated');
    expect(state.user?.last_name).toBe('Name');
  });

  it('updates isAdmin when updating user with staff status', () => {
    const regularUser: User = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_staff: false,
    };

    useAuthStore.getState().setAuth(regularUser, 'token-123');
    expect(useAuthStore.getState().isAdmin).toBe(false);

    const promotedUser: User = {
      ...regularUser,
      is_staff: true,
    };

    useAuthStore.getState().setUser(promotedUser);
    expect(useAuthStore.getState().isAdmin).toBe(true);
  });

  it('clears auth state on logout', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_staff: false,
    };

    useAuthStore.getState().setAuth(mockUser, 'token-123');
    expect(useAuthStore.getState().isAuthenticated).toBe(true);

    useAuthStore.getState().logout();

    const state = useAuthStore.getState();
    expect(state.user).toBeNull();
    expect(state.token).toBeNull();
    expect(state.isAuthenticated).toBe(false);
    expect(state.isAdmin).toBe(false);
  });

  it('saves token to localStorage on setAuth', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_staff: false,
    };
    const mockToken = 'test-token-123';

    useAuthStore.getState().setAuth(mockUser, mockToken);

    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', mockToken);
    expect(localStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });

  it('removes items from localStorage on logout', () => {
    const mockUser: User = {
      id: 1,
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      is_staff: false,
    };

    useAuthStore.getState().setAuth(mockUser, 'token-123');
    useAuthStore.getState().logout();

    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(localStorage.removeItem).toHaveBeenCalledWith('user');
  });
});
