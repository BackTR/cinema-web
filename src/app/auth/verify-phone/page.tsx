'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';
import { Film, ArrowLeft, MessageCircle, Loader2 } from 'lucide-react';

function VerifyPhoneForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const phone = searchParams.get('phone') ?? '';
    const { verifyPhoneOtp, requestPhoneOtp, isLoading } = useAuthStore();

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [cooldown, setCooldown] = useState(60);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!phone) {
        router.push('/auth/login');
        return;
        }
        inputRefs.current[0]?.focus();
    }, [phone, router]);

    useEffect(() => {
        if (cooldown <= 0) return;
        const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(timer);
    }, [cooldown]);

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
        setOtp(pasted.split(''));
        inputRefs.current[5]?.focus();
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length !== 6) {
        toast.error('Masukkan 6 digit kode OTP');
        return;
        }

        try {
        await verifyPhoneOtp(phone, code);
        toast.success('Verifikasi berhasil!');
        router.push('/movies');
        } catch (error: unknown) {
        const msg = (error as { response?: { data?: { message?: string } } })
            ?.response?.data?.message;
        toast.error(msg ?? 'Kode OTP salah');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
        }
    };

    const handleResend = async () => {
        try {
        await requestPhoneOtp(phone);
        toast.success('Kode OTP baru telah dikirim');
        setCooldown(60);
        } catch {
        toast.error('Gagal mengirim ulang OTP');
        }
    };

    return (
        <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <Film className="w-8 h-8 text-red-500" />
            Cinema App
            </Link>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
            <Link
            href="/auth/login"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
            >
            <ArrowLeft className="w-4 h-4" />
            Kembali
            </Link>

            <div className="text-center mb-6">
            <div className="w-14 h-14 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-7 h-7 text-green-400" />
            </div>
            <h1 className="text-xl font-bold text-white mb-2">Verifikasi WhatsApp</h1>
            <p className="text-gray-400 text-sm">
                Kode OTP telah dikirim ke{' '}
                <span className="text-white font-medium">{phone}</span>
            </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {otp.map((digit, index) => (
                <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    className="w-12 h-14 text-center text-xl font-bold bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
                />
                ))}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Memverifikasi...' : 'Verifikasi'}
            </button>
            </form>

            <div className="text-center mt-6">
            {cooldown > 0 ? (
                <p className="text-gray-500 text-sm">
                Kirim ulang kode dalam {cooldown}s
                </p>
            ) : (
                <button onClick={handleResend} className="text-red-400 hover:text-red-300 text-sm">
                Kirim ulang kode OTP
                </button>
            )}
            </div>
        </div>
        </div>
    );
    }

    export default function VerifyPhonePage() {
    return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <Suspense
            fallback={
            <div className="text-center">
                <Loader2 className="w-10 h-10 text-red-500 animate-spin mx-auto" />
            </div>
            }
        >
            <VerifyPhoneForm />
        </Suspense>
        </div>
    );
    }