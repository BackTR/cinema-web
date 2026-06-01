// src/stores/auth.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import axios from 'axios';
import { api } from '@/lib/api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>; // ← tambah ke interface
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email, password) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { user, accessToken, refreshToken } = data.data;
          Cookies.set('accessToken', accessToken, { expires: 1 / 96 });
          Cookies.set('refreshToken', refreshToken, { expires: 7 });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', {
            name, email, password, phone,
          });
          const { user, accessToken, refreshToken } = data.data;
          Cookies.set('accessToken', accessToken, { expires: 1 / 96 });
          Cookies.set('refreshToken', refreshToken, { expires: 7 });
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        try {
          await api.post('/auth/logout');
        } finally {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
          set({ user: null, isAuthenticated: false });
        }
      },

      setUser: (user) => set({ user, isAuthenticated: true }),

      // ← implementasi checkAuth
      checkAuth: async () => {
        const token = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');

        // Kedua cookie habis — reset state
        if (!token && !refreshToken) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        // Access token habis tapi refresh masih ada
        if (!token && refreshToken) {
          try {
            const { data } = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
              {},
              { headers: { Authorization: `Bearer ${refreshToken}` } },
            );
            const { accessToken: newAccess, refreshToken: newRefresh } = data.data;
            Cookies.set('accessToken', newAccess, { expires: 1 / 96 });
            Cookies.set('refreshToken', newRefresh, { expires: 7 });
          } catch {
            // Refresh token juga expired
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            set({ user: null, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);