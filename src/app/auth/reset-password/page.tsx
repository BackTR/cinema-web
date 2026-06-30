'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';
import { Film, Eye, EyeOff, Lock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { resetPassword } = useAuthStore();

  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Validasi real-time
  const validations = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    matches: password.length > 0 && password === confirmPassword,
  };
  const isValid = Object.values(validations).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error('Token reset tidak valid');
      return;
    }
    if (!isValid) {
      toast.error('Periksa kembali kriteria password');
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push('/auth/login'), 2500);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Link reset tidak valid atau sudah expired');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Link Tidak Valid</h1>
        <p className="text-gray-400 text-sm mb-6">
          Link reset password tidak ditemukan atau sudah tidak berlaku.
        </p>
        <Link href="/auth/forgot-password" className="btn-primary inline-block">
          Minta Link Baru
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Password Berhasil Direset!</h1>
        <p className="text-gray-400 text-sm">
          Mengalihkan ke halaman login...
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-7 h-7 text-red-400" />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Buat Password Baru</h1>
        <p className="text-gray-400 text-sm">
          Pastikan password baru kamu kuat dan mudah diingat
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Password Baru</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input pr-12"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <div>
          <label className="label">Konfirmasi Password</label>
          <input
            type={showPassword ? 'text' : 'password'}
            className="input"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        {/* Validation checklist */}
        <div className="bg-gray-800/50 rounded-xl p-3 space-y-1.5">
          {[
            { check: validations.minLength, label: 'Minimal 8 karakter' },
            { check: validations.hasUpperCase, label: 'Ada huruf kapital' },
            { check: validations.hasNumber, label: 'Ada angka' },
            { check: validations.matches, label: 'Password cocok' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2 text-xs">
              {item.check ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
              ) : (
                <div className="w-3.5 h-3.5 rounded-full border border-gray-600 flex-shrink-0" />
              )}
              <span className={item.check ? 'text-green-400' : 'text-gray-500'}>
                {item.label}
              </span>
            </div>
          ))}
        </div>

        <button type="submit" disabled={isLoading || !isValid} className="btn-primary w-full">
          {isLoading ? 'Memproses...' : 'Reset Password'}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <Film className="w-8 h-8 text-red-500" />
            Cinema App
          </Link>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <Suspense
            fallback={
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 text-red-500 animate-spin mx-auto" />
              </div>
            }
          >
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}