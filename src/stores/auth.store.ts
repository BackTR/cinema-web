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
  register: (name: string, email: string, password: string, phone?: string) => Promise<{ emailVerified: boolean }>;
  requestPhoneOtp: (phone: string, name?: string) => Promise<{ isNewUser: boolean }>;
  verifyPhoneOtp: (phone: string, otp: string) => Promise<void>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  resendEmailVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  checkAuth: () => Promise<void>;
}

function setTokens(accessToken: string, refreshToken: string) {
  Cookies.set('accessToken', accessToken, { expires: 1 / 96 });
  Cookies.set('refreshToken', refreshToken, { expires: 7 });
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
          setTokens(accessToken, refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name, email, password, phone) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/register', { name, email, password, phone });
          const { user, accessToken, refreshToken } = data.data;
          setTokens(accessToken, refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
          return { emailVerified: user.emailVerified };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      requestPhoneOtp: async (phone, name) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/phone/request-otp', { phone, name });
          set({ isLoading: false });
          return { isNewUser: data.data.isNewUser };
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      verifyPhoneOtp: async (phone, otp) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/phone/verify-otp', { phone, otp });
          const { user, accessToken, refreshToken } = data.data;
          setTokens(accessToken, refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      verifyEmail: async (email, code) => {
        set({ isLoading: true });
        try {
          const { data } = await api.post('/auth/email/verify', { email, code });
          const { user, accessToken, refreshToken } = data.data;
          setTokens(accessToken, refreshToken);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      resendEmailVerification: async (email) => {
        await api.post('/auth/email/resend-verification', { email });
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

      checkAuth: async () => {
        const token = Cookies.get('accessToken');
        const refreshToken = Cookies.get('refreshToken');

        if (!token && !refreshToken) {
          set({ user: null, isAuthenticated: false });
          return;
        }

        if (!token && refreshToken) {
          try {
            const { data } = await axios.post(
              `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
              {},
              { headers: { Authorization: `Bearer ${refreshToken}` } },
            );
            setTokens(data.data.accessToken, data.data.refreshToken);
          } catch {
            Cookies.remove('accessToken');
            Cookies.remove('refreshToken');
            set({ user: null, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }),
    },
  ),
);