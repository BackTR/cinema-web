'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { showToast } from '@/lib/toast';
import { FormField, Input, PasswordInput } from '@/components/ui/FormField';
import { Film, Phone, Mail } from 'lucide-react';

type Tab = 'email' | 'phone';

// Schemas
const emailSchema = z.object({
  email: z.string().email('Format email tidak valid'),
  password: z.string().min(1, 'Password wajib diisi'),
});

const phoneSchema = z.object({
  phone: z
    .string()
    .min(1, 'Nomor HP wajib diisi')
    .regex(/^(\+62|62|0)8[0-9]{8,11}$/, 'Format nomor HP tidak valid (contoh: 081234567890)'),
});

type EmailForm = z.infer<typeof emailSchema>;
type PhoneForm = z.infer<typeof phoneSchema>;

export default function LoginPage() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const requestPhoneOtp = useAuthStore((s) => s.requestPhoneOtp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [tab, setTab] = useState<Tab>('email');

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: 'onBlur', // validasi saat user blur dari field
  });

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    mode: 'onBlur',
  });

  const handleEmailSubmit = async (data: EmailForm) => {
    try {
      await login(data.email, data.password);
      showToast.success('Login berhasil! Selamat datang kembali 👋');
      router.push('/movies');
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      if (status === 401) {
        // Error spesifik per kondisi
        if (msg?.includes('Email belum diverifikasi')) {
          showToast.warning(msg, { duration: 6000 });
          router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
        } else if (msg?.includes('dinonaktifkan')) {
          showToast.error('Akun kamu telah dinonaktifkan. Hubungi customer support.', 'Akun Dinonaktifkan');
        } else {
          showToast.error('Email atau password salah. Periksa kembali.', 'Login Gagal');
          emailForm.setError('password', { message: 'Email atau password salah' });
        }
      } else {
        showToast.error(msg ?? 'Terjadi kesalahan. Coba lagi.', 'Error');
      }
    }
  };

  const handlePhoneSubmit = async (data: PhoneForm) => {
    try {
      await requestPhoneOtp(data.phone);
      showToast.success('Kode OTP dikirim via WhatsApp!');
      router.push(`/auth/verify-phone?phone=${encodeURIComponent(data.phone)}`);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      if (msg?.includes('dinonaktifkan')) {
        showToast.error('Akun kamu telah dinonaktifkan.', 'Akun Dinonaktifkan');
      } else if (msg?.includes('Tunggu')) {
        showToast.warning(msg ?? 'Tunggu sebentar sebelum minta OTP baru');
      } else {
        showToast.error(msg ?? 'Gagal mengirim OTP. Coba lagi.', 'Error');
        phoneForm.setError('phone', { message: 'Gagal mengirim OTP' });
      }
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <Film className="w-8 h-8 text-red-500" />
            Cinema App
          </Link>
          <p className="text-gray-400 mt-2">Masuk ke akun kamu</p>
        </motion.div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-800 rounded-xl p-1">
            {(['email', 'phone'] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t ? 'bg-red-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'
                }`}
              >
                {t === 'email' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                {t === 'email' ? 'Email' : 'No. HP'}
              </button>
            ))}
          </div>

          {/* Form dengan AnimatePresence untuk transisi antar tab */}
          <AnimatePresence mode="wait">
            {tab === 'email' ? (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                className="space-y-5"
              >
                <FormField
                  label="Email"
                  required
                  error={emailForm.formState.errors.email?.message}
                  success={
                    !emailForm.formState.errors.email &&
                    !!emailForm.watch('email')
                  }
                >
                  <Input
                    type="email"
                    placeholder="kamu@email.com"
                    error={!!emailForm.formState.errors.email}
                    success={
                      !emailForm.formState.errors.email &&
                      !!emailForm.watch('email')
                    }
                    {...emailForm.register('email')}
                  />
                </FormField>

                <FormField
                  label="Password"
                  required
                  error={emailForm.formState.errors.password?.message}
                  rightLabel={
                    <Link
                      href="/auth/forgot-password"
                      className="text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                      Lupa password?
                    </Link>
                  }
                >
                  <PasswordInput
                    placeholder="••••••••"
                    error={!!emailForm.formState.errors.password}
                    {...emailForm.register('password')}
                  />
                </FormField>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full"
                >
                  {isLoading ? 'Memproses...' : 'Masuk'}
                </motion.button>
              </motion.form>
            ) : (
              <motion.form
                key="phone"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
                className="space-y-5"
              >
                <FormField
                  label="Nomor HP"
                  required
                  error={phoneForm.formState.errors.phone?.message}
                  hint="Kami akan kirim kode OTP via WhatsApp"
                  success={
                    !phoneForm.formState.errors.phone &&
                    !!phoneForm.watch('phone')
                  }
                >
                  <Input
                    type="tel"
                    placeholder="081234567890"
                    error={!!phoneForm.formState.errors.phone}
                    success={
                      !phoneForm.formState.errors.phone &&
                      !!phoneForm.watch('phone')
                    }
                    {...phoneForm.register('phone')}
                  />
                </FormField>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full"
                >
                  {isLoading ? 'Mengirim...' : 'Kirim Kode OTP'}
                </motion.button>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-500 text-xs">atau</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* OAuth */}
          <div className="space-y-3">
            <motion.button
              type="button"
              onClick={handleGoogleLogin}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </motion.button>

            <button
              disabled
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2]/20 cursor-not-allowed text-white/40 px-4 py-3 rounded-lg font-medium border border-[#1877F2]/20"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook (Segera Hadir)
            </button>
          </div>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-red-400 hover:text-red-300">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}