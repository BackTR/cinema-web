// src/components/layout/Providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, useRef } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';

function AuthInitializer() {
  const hasChecked = useRef(false);

  useEffect(() => {
    if (hasChecked.current) return;
    hasChecked.current = true;

    // Langsung handle di sini tanpa panggil store method
    // untuk menghindari re-render loop dari Zustand
    const init = async () => {
      const token = Cookies.get('accessToken');
      const refreshToken = Cookies.get('refreshToken');

      if (!token && !refreshToken) return;

      if (!token && refreshToken) {
        try {
          await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
            {},
            { headers: { Authorization: `Bearer ${refreshToken}` } },
          );
        } catch {
          Cookies.remove('accessToken');
          Cookies.remove('refreshToken');
        }
      }
    };

    void init();
  }, []); // ← empty deps, tidak ada dependency

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () => new QueryClient({
      defaultOptions: {
        queries: { staleTime: 60 * 1000, retry: 1 },
      },
    }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}