'use client';

import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import { motion } from 'framer-motion';
import {
  TrendingUp, Film, Building, Ticket,
  CheckCircle, DollarSign, Calendar,
} from 'lucide-react';

// Animated counter hook
function useCounter(target: number, duration = 1500) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (target === 0) return;
    const startTime = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);

  return count;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  delay?: number;
  isCurrency?: boolean;
}

function StatCard({
  title, value, icon: Icon, color, bgColor,
  prefix, suffix, subtitle, delay = 0, isCurrency = false,
}: StatCardProps) {
  const count = useCounter(value);

  const displayValue = isCurrency
    ? formatCurrency(count)
    : `${prefix ?? ''}${count.toLocaleString('id-ID')}${suffix ?? ''}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className={`rounded-xl border p-5 ${bgColor}`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-gray-400 text-sm font-medium">{title}</span>
        <div className={`w-9 h-9 rounded-lg bg-gray-900/50 flex items-center justify-center`}>
          <Icon className={`w-4.5 h-4.5 ${color}`} />
        </div>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{displayValue}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </motion.div>
  );
}

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
            <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-5 animate-pulse">
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-3" />
              <div className="h-7 bg-gray-800 rounded w-1/3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">
            Selamat datang kembali! Berikut ringkasan hari ini.
          </p>
        </div>
        <div className="text-gray-500 text-xs bg-gray-800 px-3 py-1.5 rounded-lg">
          <Calendar className="w-3.5 h-3.5 inline mr-1.5" />
          {new Date().toLocaleDateString('id-ID', {
            weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
          })}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Film Aktif"
          value={data?.overview?.totalMovies ?? 0}
          icon={Film}
          color="text-blue-400"
          bgColor="bg-blue-900/10 border-blue-800/30"
          delay={0}
        />
        <StatCard
          title="Total Bioskop"
          value={data?.overview?.totalCinemas ?? 0}
          icon={Building}
          color="text-purple-400"
          bgColor="bg-purple-900/10 border-purple-800/30"
          delay={0.05}
        />
        <StatCard
          title="Booking Hari Ini"
          value={data?.overview?.todayBookings ?? 0}
          icon={Ticket}
          color="text-yellow-400"
          bgColor="bg-yellow-900/10 border-yellow-800/30"
          delay={0.1}
        />
        <StatCard
          title="Booking Confirmed"
          value={data?.overview?.confirmedBookings ?? 0}
          icon={CheckCircle}
          color="text-green-400"
          bgColor="bg-green-900/10 border-green-800/30"
          subtitle={`Konversi: ${data?.overview?.conversionRate ?? '0%'}`}
          delay={0.15}
        />
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-900/20 to-emerald-900/10 border border-green-800/30 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Revenue Bulan Ini</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <p className="text-3xl font-bold text-green-400">
            {formatCurrency(data?.revenue?.monthly ?? 0)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-green-500 text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>Bulan berjalan</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-gradient-to-br from-blue-900/20 to-indigo-900/10 border border-blue-800/30 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">Total Revenue</span>
            <DollarSign className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-bold text-blue-400">
            {formatCurrency(data?.revenue?.total ?? 0)}
          </p>
          <div className="flex items-center gap-1 mt-2 text-blue-500 text-xs">
            <TrendingUp className="w-3 h-3" />
            <span>Sejak awal</span>
          </div>
        </motion.div>
      </div>

      {/* Recent + Top Movies */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-5"
        >
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Ticket className="w-4 h-4 text-gray-400" />
            Booking Terbaru
          </h2>
          <div className="space-y-3">
            {data?.recentBookings?.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada booking</p>
            ) : data?.recentBookings?.map((booking: {
              id: string;
              bookingCode: string;
              status: string;
              user: { name: string };
              schedule: { movie: { title: string } };
              payment?: { amount: string };
            }, i: number) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="flex justify-between items-center py-2.5 border-b border-gray-800 last:border-0"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-white text-sm font-medium truncate">
                    {booking.user?.name}
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    {booking.schedule?.movie?.title}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white text-sm font-medium">
                    {formatCurrency(Number(booking.payment?.amount ?? 0))}
                  </p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    booking.status === 'CONFIRMED'
                      ? 'bg-green-900/50 text-green-400'
                      : booking.status === 'PENDING'
                      ? 'bg-yellow-900/50 text-yellow-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {booking.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Top Movies */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-gray-900 rounded-xl border border-gray-800 p-5"
        >
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Film className="w-4 h-4 text-gray-400" />
            Film Terpopuler
          </h2>
          <div className="space-y-3">
            {data?.topMovies?.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">Belum ada data</p>
            ) : (
              data?.topMovies?.map((movie: {
                movieTitle: string;
                totalBookings: number;
              }, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + index * 0.05 }}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-800 last:border-0"
                >
                  <span className={`text-lg font-bold w-6 text-center ${
                    index === 0 ? 'text-yellow-400' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-600'
                  }`}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm truncate">{movie.movieTitle}</p>
                    {/* Progress bar */}
                    <div className="mt-1 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${Math.min((movie.totalBookings / (data?.topMovies?.[0]?.totalBookings ?? 1)) * 100, 100)}%`
                        }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.6 }}
                        className="h-full bg-red-500 rounded-full"
                      />
                    </div>
                  </div>
                  <span className="text-gray-400 text-xs flex-shrink-0">
                    {movie.totalBookings} booking
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}