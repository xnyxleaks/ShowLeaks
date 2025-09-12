import { create } from 'zustand';
import type { User, AuthState, LoginCredentials, RegisterCredentials } from '../types/index';
import { authApi } from '../services/api';

interface AuthStore extends AuthState {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  fetchUser: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  login: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const data = await authApi.login(credentials);
  
      const user = data.user;
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(user));
  
      set({ user, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  register: async (credentials) => {
    try {
      set({ loading: true, error: null });
      const data = await authApi.register(credentials);
      
      // User is logged in immediately but needs verification for premium
      const user = data.user;
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      set({ user, loading: false });
      set({ loading: false, error: null });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  verifyEmail: async (token: string) => {
    try {
      set({ loading: true, error: null });
      const data = await authApi.verifyEmail(token);
      
      const user = data.user;
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(user));
      
      set({ user, loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Email verification failed';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  resendVerification: async (email: string) => {
    try {
      set({ loading: true, error: null });
      await authApi.resendVerification(email);
      set({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to resend verification';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  forgotPassword: async (email: string) => {
    try {
      set({ loading: true, error: null });
      await authApi.forgotPassword(email);
      set({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send reset email';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  resetPassword: async (token: string, password: string) => {
    try {
      set({ loading: true, error: null });
      await authApi.resetPassword(token, password);
      set({ loading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reset password';
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  logout: () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('ageConfirmed');
    set({ user: null });
  },

  fetchUser: async () => {
    const token = sessionStorage.getItem('token');

    if (!token) return;

    try {
      const user = await authApi.getDashboard();
      set({ user });
    } catch (error) {
      // If API call fails, try to use saved user data
      const savedUser = sessionStorage.getItem('user');
      if (savedUser) {
        try {
          set({ user: JSON.parse(savedUser) });
        } catch (parseError) {
          // If saved data is corrupted, clear everything
          sessionStorage.removeItem('token');
          sessionStorage.removeItem('user');
          set({ user: null });
        }
      }
    }
  },
}));