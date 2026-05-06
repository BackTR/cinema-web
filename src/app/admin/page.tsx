'use client';

import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { StatsCard } from '@/components/admin/StatsCard';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: adminApi.getDashboard,
    refetchInterval: 30000,
  });

  if (isLoading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-6 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-3" />
              <div className="h-8 bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="Total Film"
          value={data?.overview?.totalMovies ?? 0}
          icon="🎬"
          color="text-blue-400"
        />
        <StatsCard
          title="Total Bioskop"
          value={data?.overview?.totalCinemas ?? 0}
          icon="🏢"
          color="text-purple-400"
        />
        <StatsCard
          title="Booking Hari Ini"
          value={data?.overview?.todayBookings ?? 0}
          icon="🎫"
          color="text-yellow-400"
        />
        <StatsCard
          title="Booking Confirmed"
          value={data?.overview?.confirmedBookings ?? 0}
          icon="✅"
          color="text-green-400"
          subtitle={`Konversi: ${data?.overview?.conversionRate ?? '0%'}`}
        />
      </div>

      {/* Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <p className="text-gray-400 text-sm mb-2">Revenue Bulan Ini</p>
          <p className="text-3xl font-bold text-green-400">
            {formatCurrency(data?.revenue?.monthly ?? 0)}
          </p>
        </div>
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <p className="text-gray-400 text-sm mb-2">Total Revenue</p>
          <p className="text-3xl font-bold text-green-400">
            {formatCurrency(data?.revenue?.total ?? 0)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold text-white mb-4">Booking Terbaru</h2>
          <div className="space-y-3">
            {data?.recentBookings?.map((booking: {
              id: string;
              bookingCode: string;
              status: string;
              user: { name: string };
              schedule: { movie: { title: string } };
              payment?: { amount: string };
            }) => (
              <div key={booking.id} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">
                    {booking.user?.name}
                  </p>
                  <p className="text-gray-400 text-xs">
                    {booking.schedule?.movie?.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-white text-sm">
                    {formatCurrency(Number(booking.payment?.amount ?? 0))}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded ${
                    booking.status === 'CONFIRMED'
                      ? 'bg-green-900/50 text-green-400'
                      : booking.status === 'PENDING'
                      ? 'bg-yellow-900/50 text-yellow-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Movies */}
        <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
          <h2 className="font-semibold text-white mb-4">Film Terpopuler</h2>
          <div className="space-y-3">
            {data?.topMovies?.length === 0 ? (
              <p className="text-gray-500 text-sm">Belum ada data</p>
            ) : (
              data?.topMovies?.map((movie: { movieTitle: string; totalBookings: number }, index: number) => (
                <div key={index} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-500 text-sm w-5">{index + 1}</span>
                    <p className="text-white text-sm">{movie.movieTitle}</p>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {movie.totalBookings} booking
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}