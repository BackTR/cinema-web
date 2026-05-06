'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Film, Calendar, Ticket,
  Users, Building, QrCode, LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/movies', icon: Film, label: 'Film' },
  { href: '/admin/schedules', icon: Calendar, label: 'Jadwal' },
  { href: '/admin/bookings', icon: Ticket, label: 'Booking' },
  { href: '/admin/users', icon: Users, label: 'Pengguna' },
  { href: '/admin/cinemas', icon: Building, label: 'Bioskop' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    toast.success('Logout berhasil');
    router.push('/');
  };

  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col min-h-screen">
      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">🎬 Cinema Admin</h1>
        <p className="text-gray-400 text-xs mt-1">Dashboard Panel</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-sm ${
                isActive
                  ? 'bg-red-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-red-400 transition-all text-sm w-full"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </aside>
  );
}