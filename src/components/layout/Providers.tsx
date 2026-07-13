// src/components/layout/Providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { useNotificationStore } from '@/stores/notification.store';
import { useAuthStore } from '@/stores/auth.store';

function AuthInitializer() {
  const hasChecked = useRef(false);
  const connect = useNotificationStore((s) => s.connect);
  const disconnect = useNotificationStore((s) => s.disconnect);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    const init = async () => {
      const token = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');
      if (!token && !refreshToken) return;

      if (!token && refreshToken) {
        try {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } },
          );
          const { accessToken, refreshToken: newRefreshToken } = data.data;
          Cookies.set('accessToken', accessToken, { expires: 1 / 96 }); // 15 mins
          Cookies.set('refreshToken', newRefreshToken, { expires: 7 });
          
          if (isAuthenticated) {
            connect();
          }
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
        }
      }
    };

    void init();
  }, []);

  // Connect SSE saat user login
  useEffect(() => {
    if (isAuthenticated) {
      connect();
    } else {
      disconnect();
    }

    return () => { /* cleanup handled by store */ };
  }, [isAuthenticated, connect, disconnect]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: { queries: { staleTime: 60 * 1000, retry: 1 } },
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}