'use client';

import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { showToast } from '@/lib/toast';
import { Film, Ticket, LogOut, LayoutDashboard, User, ChevronDown } from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NotificationBell } from '@/components/ui/NotificationBell';

export function Navbar() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setShowDropdown(false);
    await logout();
    showToast.success('Logout berhasil');
    router.push('/');
  };

  return (
    <nav className="bg-gray-900/80 backdrop-blur-xl text-white sticky top-0 z-50 border-b border-white/5">
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
              className="text-gray-300 hover:text-white transition-colors text-sm font-medium"
            >
              Film
            </Link>

            {isAuthenticated ? (
              <>
              <NotificationBell />

                {/* User Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-2 hover:bg-gray-800 px-3 py-2 rounded-xl transition-colors"
                  >
                    <Avatar
                      name={user?.name ?? 'U'}
                      avatarUrl={user?.avatarUrl}
                      size="sm"
                    />
                    <span className="text-gray-300 text-sm font-medium hidden md:block max-w-24 truncate">
                      {user?.name}
                    </span>
                    <motion.div
                      animate={{ rotate: showDropdown ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </motion.div>
                  </button>

                  <AnimatePresence>
                    {showDropdown && (
                      <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.96 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-gray-900 border border-gray-700 rounded-xl shadow-xl overflow-hidden"
                      >
                        {/* User Info */}
                        <div className="px-4 py-3 border-b border-gray-800">
                          <p className="text-white text-sm font-medium truncate">{user?.name}</p>
                          {user?.email && (
                            <p className="text-gray-500 text-xs truncate">{user.email}</p>
                          )}
                          {user?.phone && !user?.email && (
                            <p className="text-gray-500 text-xs">{user.phone}</p>
                          )}
                        </div>

                        {/* Menu Items */}
                        <div className="py-1">
                          <Link
                            href="/profile"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                          >
                            <User className="w-4 h-4" />
                            Profil Saya
                          </Link>
                          <Link
                            href="/bookings"
                            onClick={() => setShowDropdown(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors text-sm"
                          >
                            <Ticket className="w-4 h-4" />
                            Tiket Saya
                          </Link>
                          {user?.role === 'ADMIN' && (
                            <Link
                              href="/admin"
                              onClick={() => setShowDropdown(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-yellow-400 hover:bg-gray-800 transition-colors text-sm"
                            >
                              <LayoutDashboard className="w-4 h-4" />
                              Admin Dashboard
                            </Link>
                          )}
                        </div>

                        {/* Logout */}
                        <div className="border-t border-gray-800 py-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-900/20 transition-colors text-sm"
                          >
                            <LogOut className="w-4 h-4" />
                            Keluar
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm transition-colors font-medium"
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