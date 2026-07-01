'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Film, Ticket, LogOut, User, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);


  const handleLogout = async () => {
    await logout();
    toast.success('Logout berhasil');
    router.push('/');
  };

  return (
    <nav className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Film className="w-6 h-6 text-red-500" />
            <span>Cinema App</span>
          </Link>

          {/* Nav Links */}
          <div className="flex items-center gap-6">
            <Link
              href="/movies"
              className="text-gray-300 hover:text-white transition-colors text-sm"
            >
              Film
            </Link>

            {isAuthenticated ? (
              <>
                <Link
                  href="/bookings"
                  className="flex items-center gap-1 text-gray-300 hover:text-white transition-colors text-sm"
                >
                  <Ticket className="w-4 h-4" />
                  Tiket Saya
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1 text-yellow-400 hover:text-yellow-300 transition-colors text-sm"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Admin
                  </Link>
                )}

                <div className="flex items-center gap-3">
                  <span className="text-gray-400 text-sm">
                    <User className="w-4 h-4 inline mr-1" />
                    {user?.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-gray-400 hover:text-red-400 transition-colors text-sm"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/auth/login"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}