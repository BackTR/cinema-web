'use client';

import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api/bookings';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Booking } from '@/types';
import { Ticket, ChevronRight, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30 border-yellow-700/50',
    label: 'Menunggu Pembayaran',
  },
  CONFIRMED: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-900/30 border-green-700/50',
    label: 'Dikonfirmasi',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-900/30 border-red-700/50',
    label: 'Dibatalkan',
  },
  EXPIRED: {
    icon: AlertCircle,
    color: 'text-gray-400',
    bg: 'bg-gray-800 border-gray-700',
    label: 'Kadaluarsa',
  },
};

export default function BookingsPage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: () => bookingsApi.getMyBookings,
    enabled: isAuthenticated,
  });

  const bookings: Booking[] = Array.isArray(data)
    ? data
    : (data as { data?: Booking[] })?.data ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-white mb-8 flex items-center gap-3"
      >
        <Ticket className="w-8 h-8 text-red-500" />
        Tiket Saya
      </motion.h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-gray-800 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-1/3 mb-3" />
              <div className="h-6 bg-gray-800 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <Ticket className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Belum ada booking.</p>
          <Link href="/movies">
            <motion.span
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="btn-primary inline-block"
            >
              Cari Film
            </motion.span>
          </Link>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.07 } },
          }}
        >
          {bookings.map((booking) => {
            const status = STATUS_CONFIG[booking.status];
            const StatusIcon = status.icon;

            return (
              <motion.div
                key={booking.id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 },
                }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <Link href={`/bookings/${booking.bookingCode}`}>
                  <motion.div
                    whileHover={{ x: 4 }}
                    transition={{ duration: 0.15 }}
                    className="card p-5 hover:border-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-1 truncate">
                          {booking.schedule?.movie?.title ?? 'Film'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-2 truncate">
                          {booking.schedule?.studio?.cinema?.name} •{' '}
                          {formatDate(booking.schedule?.showTime)}
                        </p>

                        {/* Status badge */}
                        <div className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${status.bg}`}>
                          <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                          <span className={status.color}>{status.label}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-white font-semibold">
                          {formatCurrency(Number(booking.totalAmount))}
                        </p>
                        <p className="text-gray-500 text-xs mt-1 font-mono">
                          {booking.bookingCode}
                        </p>
                        <ChevronRight className="w-4 h-4 text-gray-600 ml-auto mt-2" />
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}