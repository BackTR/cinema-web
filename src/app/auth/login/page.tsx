'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';
import { Film, Eye, EyeOff, Phone, Mail } from 'lucide-react';

type Tab = 'email' | 'phone';

export default function LoginPage() {
  const router = useRouter();
  const { login, requestPhoneOtp, isLoading } = useAuthStore();
  const [tab, setTab] = useState<Tab>('email');
  const [showPassword, setShowPassword] = useState(false);

  // Email login
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Phone login
  const [phone, setPhone] = useState('');

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Login berhasil!');
      router.push('/movies');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Email atau password salah');
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestPhoneOtp(phone);
      toast.success('Kode OTP telah dikirim via WhatsApp');
      router.push(`/auth/verify-phone?phone=${encodeURIComponent(phone)}`);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Gagal mengirim OTP');
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <Film className="w-8 h-8 text-red-500" />
            Cinema App
          </Link>
          <p className="text-gray-400 mt-2">Masuk ke akun kamu</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setTab('email')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'email' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              Email
            </button>
            <button
              onClick={() => setTab('phone')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${
                tab === 'phone' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Phone className="w-4 h-4" />
              No. HP
            </button>
          </div>

          {/* Email Tab */}
          {tab === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <input
                  type="email"
                  className="input"
                  placeholder="kamu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                <label className="label">Password</label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs text-red-400 hover:text-red-300">Lupa password?
                </Link>
                </div>
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

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Memproses...' : 'Masuk'}
              </button>
            </form>
          )}

          {/* Phone Tab */}
          {tab === 'phone' && (
            <form onSubmit={handlePhoneSubmit} className="space-y-5">
              <div>
                <label className="label">Nomor HP</label>
                <input
                  type="tel"
                  className="input"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
                <p className="text-gray-500 text-xs mt-1">
                  Kami akan kirim kode OTP via WhatsApp
                </p>
              </div>

              <button type="submit" disabled={isLoading} className="btn-primary w-full">
                {isLoading ? 'Mengirim...' : 'Kirim Kode OTP'}
              </button>
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-500 text-xs">atau</span>
            <div className="flex-1 h-px bg-gray-800" />
          </div>

          {/* OAuth */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 px-4 py-3 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Masuk dengan Google
            </button>

            <button
              disabled
              type="button"
              title="Segera hadir"
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2]/40 cursor-not-allowed text-white/50 px-4 py-3 rounded-lg font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Masuk dengan Facebook (Segera)
            </button>
          </div>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Belum punya akun?{' '}
            <Link href="/auth/register" className="text-red-400 hover:text-red-300">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}