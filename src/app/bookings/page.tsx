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

const STATUS_ICON = {
  PENDING: <Clock className="w-4 h-4 text-yellow-400" />,
  CONFIRMED: <CheckCircle className="w-4 h-4 text-green-400" />,
  CANCELLED: <XCircle className="w-4 h-4 text-red-400" />,
  EXPIRED: <AlertCircle className="w-4 h-4 text-gray-400" />,
};

const STATUS_LABEL = {
  PENDING: 'Menunggu Pembayaran',
  CONFIRMED: 'Dikonfirmasi',
  CANCELLED: 'Dibatalkan',
  EXPIRED: 'Kadaluarsa',
};

export default function BookingsPage() {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) router.push('/auth/login');
  }, [isAuthenticated, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['myBookings'],
    queryFn: async () => {
      const result = await bookingsApi.getMyBookings();
      return result;
    },
    enabled: isAuthenticated,
  });

  const bookings: Booking[] = Array.isArray(data)
    ? data
    : (data as { data?: Booking[] })?.data ?? [];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
        <Ticket className="w-8 h-8 text-red-500" />
        Tiket Saya
      </h1>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-5 bg-gray-800 rounded w-1/2 mb-2" />
              <div className="h-4 bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-20">
          <Ticket className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Belum ada booking.</p>
          <Link href="/movies" className="btn-primary inline-block">
            Cari Film
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Link key={booking.id} href={`/bookings/${booking.bookingCode}`}>
              <div className="card p-5 hover:border-gray-600 transition-all cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">
                      {booking.schedule?.movie?.title ?? 'Film'}
                    </h3>
                    <p className="text-gray-400 text-sm mb-2">
                      {booking.schedule?.studio?.cinema?.name} •{' '}
                      {formatDate(booking.schedule?.showTime)}
                    </p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        {STATUS_ICON[booking.status]}
                        <span className="text-gray-300">
                          {STATUS_LABEL[booking.status]}
                        </span>
                      </div>
                      <span className="text-gray-500 font-mono text-xs">
                        {booking.bookingCode}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-white font-semibold">
                      {formatCurrency(Number(booking.totalAmount))}
                    </p>
                    <p className="text-gray-500 text-xs mt-1">
                      {booking.seats?.length ?? 0} kursi
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-600 ml-auto mt-2" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}