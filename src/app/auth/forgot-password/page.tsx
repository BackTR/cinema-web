'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';
import { Film, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuthStore();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

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
          <Link
            href="/auth/login"
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Kembali ke Login
          </Link>

          {!sent ? (
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-7 h-7 text-red-400" />
                </div>
                <h1 className="text-xl font-bold text-white mb-2">Lupa Password?</h1>
                <p className="text-gray-400 text-sm">
                  Masukkan email akun kamu, kami akan kirim link untuk reset password
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <button type="submit" disabled={isLoading} className="btn-primary w-full">
                  {isLoading ? 'Mengirim...' : 'Kirim Link Reset'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-green-400" />
              </div>
              <h1 className="text-xl font-bold text-white mb-2">Email Terkirim!</h1>
              <p className="text-gray-400 text-sm mb-6">
                Jika <span className="text-white font-medium">{email}</span> terdaftar, kami sudah
                kirim link reset password. Cek inbox kamu.
              </p>
              <p className="text-gray-500 text-xs">
                Link berlaku selama 1 jam. Tidak menerima email?{' '}
                <button
                  onClick={() => setSent(false)}
                  className="text-red-400 hover:text-red-300"
                >
                  Coba lagi
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}