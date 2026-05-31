'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import toast from 'react-hot-toast';
import { Film, Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 8) {
      toast.error('Password minimal 8 karakter');
      return;
    }
    try {
      await register(form.name, form.email, form.password, form.phone);
      toast.success('Registrasi berhasil!');
      router.push('/movies');
    } catch {
      toast.error('Registrasi gagal. Email mungkin sudah digunakan.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-2xl font-bold text-white">
            <Film className="w-8 h-8 text-red-500" />
            Cinema App
          </Link>
          <p className="text-gray-400 mt-2">Buat akun baru</p>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="label">Nama Lengkap</label>
              <input
                name="name"
                type="text"
                className="input"
                placeholder="John Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">Email</label>
              <input
                name="email"
                type="email"
                className="input"
                placeholder="kamu@email.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="label">
                Nomor HP{' '}
                <span className="text-gray-500 font-normal">(opsional)</span>
              </label>
              <input
                name="phone"
                type="tel"
                className="input"
                placeholder="081234567890"
                value={form.phone}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input pr-12"
                  placeholder="Min. 8 karakter"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Min. 8 karakter, harus ada huruf kapital dan angka
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-center text-gray-400 mt-6 text-sm">
            Sudah punya akun?{' '}
            <Link href="/auth/login" className="text-red-400 hover:text-red-300">
              Masuk di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}