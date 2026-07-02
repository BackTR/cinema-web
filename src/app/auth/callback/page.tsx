'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Cookies from 'js-cookie';
import { useAuthStore } from '@/stores/auth.store';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const setUser = useAuthStore((s) => s.setUser);

    useEffect(() => {
        const handleCallback = async () => {
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');

        if (!accessToken || !refreshToken) {
            toast.error('Login gagal. Silakan coba lagi.');
            router.push('/auth/login');
            return;
        }

        Cookies.set('accessToken', accessToken, { expires: 1 / 96 });
        Cookies.set('refreshToken', refreshToken, { expires: 7 });

        try {
            const { data } = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
            });

            setUser(data.data);
            toast.success('Login berhasil!');
            router.push('/movies');
        } catch {
            toast.error('Gagal memuat data pengguna');
            router.push('/auth/login');
        }
        };

        void handleCallback();
    }, [searchParams, router, setUser]);

    return (
        <div className="text-center">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto mb-4" />
        <p className="text-gray-400">Memproses login...</p>
        </div>
    );
    }

    export default function AuthCallbackPage() {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <Suspense
            fallback={
            <div className="text-center">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto mb-4" />
                <p className="text-gray-400">Memuat...</p>
            </div>
            }
        >
            <CallbackHandler />
        </Suspense>
        </div>
    );
}