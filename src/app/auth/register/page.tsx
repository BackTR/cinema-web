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
import { Film, Phone, Mail, CheckCircle2 } from 'lucide-react';

type Tab = 'email' | 'phone';

const emailSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama terlalu panjang'),
  email: z.string().email('Format email tidak valid'),
  phone: z
    .string()
    .regex(/^(\+62|62|0)8[0-9]{8,11}$/, 'Format nomor HP tidak valid')
    .optional()
    .or(z.literal('')),
  password: z
    .string()
    .min(8, 'Password minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus ada huruf kapital')
    .regex(/[0-9]/, 'Harus ada angka'),
});

const phoneSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  phone: z
    .string()
    .min(1, 'Nomor HP wajib diisi')
    .regex(/^(\+62|62|0)8[0-9]{8,11}$/, 'Format nomor HP tidak valid'),
});

type EmailForm = z.infer<typeof emailSchema>;
type PhoneForm = z.infer<typeof phoneSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const register = useAuthStore((s) => s.register);
  const requestPhoneOtp = useAuthStore((s) => s.requestPhoneOtp);
  const isLoading = useAuthStore((s) => s.isLoading);
  const [tab, setTab] = useState<Tab>('email');

  const emailForm = useForm<EmailForm>({
    resolver: zodResolver(emailSchema),
    mode: 'onBlur',
  });

  const phoneForm = useForm<PhoneForm>({
    resolver: zodResolver(phoneSchema),
    mode: 'onBlur',
  });

  const password = emailForm.watch('password', '');
  const passwordChecks = {
    minLength: password.length >= 8,
    hasUpperCase: /[A-Z]/.test(password),
    hasNumber: /[0-9]/.test(password),
  };

  const handleEmailSubmit = async (data: EmailForm) => {
    try {
      const result = await register(data.name, data.email, data.password, data.phone || undefined);
      if (!result.emailVerified) {
        showToast.info('Cek email kamu untuk kode verifikasi!');
        router.push(`/auth/verify-email?email=${encodeURIComponent(data.email)}`);
      } else {
        showToast.success('Registrasi berhasil!');
        router.push('/movies');
      }
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      if (status === 409) {
        showToast.error('Email ini sudah terdaftar. Coba login.', 'Email Sudah Dipakai');
        emailForm.setError('email', { message: 'Email sudah terdaftar' });
      } else {
        showToast.error(msg ?? 'Registrasi gagal. Coba lagi.', 'Error');
      }
    }
  };

  const handlePhoneSubmit = async (data: PhoneForm) => {
    try {
      await requestPhoneOtp(data.phone, data.name);
      showToast.success('Kode OTP dikirim via WhatsApp!');
      router.push(`/auth/verify-phone?phone=${encodeURIComponent(data.phone)}`);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      if (msg?.includes('Tunggu')) {
        showToast.warning(msg);
      } else if (msg?.includes('Nama wajib')) {
        phoneForm.setError('name', { message: 'Nama wajib diisi' });
      } else {
        showToast.error(msg ?? 'Gagal mengirim OTP.', 'Error');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <Film className="w-8 h-8 text-red-500" />
            Cinema App
          </Link>
          <p className="text-gray-400 mt-2">Buat akun baru</p>
        </div>

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

          <AnimatePresence mode="wait">
            {tab === 'email' ? (
              <motion.form
                key="email"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
                className="space-y-4"
              >
                <FormField
                  label="Nama Lengkap" required
                  error={emailForm.formState.errors.name?.message}
                >
                  <Input
                    type="text" placeholder="John Doe"
                    error={!!emailForm.formState.errors.name}
                    success={!emailForm.formState.errors.name && !!emailForm.watch('name')}
                    {...emailForm.register('name')}
                  />
                </FormField>

                <FormField
                  label="Email" required
                  error={emailForm.formState.errors.email?.message}
                >
                  <Input
                    type="email" placeholder="kamu@email.com"
                    error={!!emailForm.formState.errors.email}
                    success={!emailForm.formState.errors.email && !!emailForm.watch('email')}
                    {...emailForm.register('email')}
                  />
                </FormField>

                <FormField
                  label="Nomor HP"
                  error={emailForm.formState.errors.phone?.message}
                  hint="Opsional — untuk login via WhatsApp"
                >
                  <Input
                    type="tel" placeholder="081234567890"
                    error={!!emailForm.formState.errors.phone}
                    {...emailForm.register('phone')}
                  />
                </FormField>

                <FormField
                  label="Password" required
                  error={emailForm.formState.errors.password?.message}
                >
                  <PasswordInput
                    placeholder="Min. 8 karakter"
                    error={!!emailForm.formState.errors.password}
                    {...emailForm.register('password')}
                  />
                  {/* Password strength checklist */}
                  {password.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-2 space-y-1"
                    >
                      {[
                        { check: passwordChecks.minLength, label: 'Minimal 8 karakter' },
                        { check: passwordChecks.hasUpperCase, label: 'Ada huruf kapital' },
                        { check: passwordChecks.hasNumber, label: 'Ada angka' },
                      ].map((item) => (
                        <div key={item.label} className="flex items-center gap-1.5 text-xs">
                          <CheckCircle2
                            className={`w-3.5 h-3.5 transition-colors ${
                              item.check ? 'text-green-400' : 'text-gray-600'
                            }`}
                          />
                          <span className={item.check ? 'text-green-400' : 'text-gray-500'}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </FormField>

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn-primary w-full mt-2"
                >
                  {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
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
                  label="Nama Lengkap" required
                  error={phoneForm.formState.errors.name?.message}
                >
                  <Input
                    type="text" placeholder="John Doe"
                    error={!!phoneForm.formState.errors.name}
                    success={!phoneForm.formState.errors.name && !!phoneForm.watch('name')}
                    {...phoneForm.register('name')}
                  />
                </FormField>

                <FormField
                  label="Nomor HP" required
                  error={phoneForm.formState.errors.phone?.message}
                  hint="Kode OTP akan dikirim via WhatsApp"
                >
                  <Input
                    type="tel" placeholder="081234567890"
                    error={!!phoneForm.formState.errors.phone}
                    success={!phoneForm.formState.errors.phone && !!phoneForm.watch('phone')}
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

          {/* Divider + OAuth */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-500 text-xs">atau</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          <motion.button
            type="button"
            onClick={() => { window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`; }}
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
            Daftar dengan Google
          </motion.button>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-red-400 hover:text-red-300">
              Masuk di sini
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}