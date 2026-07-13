'use client';

import { useState, useEffect, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { bookingsApi } from '@/lib/api/bookings';
import { useAuthStore } from '@/stores/auth.store';
import { SeatInfo } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { showToast } from '@/lib/toast';
import { ArrowLeft, Info, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';

function SeatPickerContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get('scheduleId') ?? '';
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  const [selectedSeats, setSelectedSeats] = useState<SeatInfo[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      showToast.warning('Silakan login terlebih dahulu');
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: schedule } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: async () => {
      const { data } = await api.get(`/schedules/${scheduleId}`);
      return data.data;
    },
    enabled: !!scheduleId,
  });

  const { data: pricingData } = useQuery({
    queryKey: ['pricing', scheduleId],
    queryFn: () => moviesApi.getPricingRules(scheduleId),
    enabled: !!scheduleId,
  });

  const { data: seatMap, isLoading, refetch } = useQuery({
    queryKey: ['seatMap', scheduleId],
    queryFn: () => moviesApi.getSeatMap(scheduleId),
    enabled: !!scheduleId,
    refetchInterval: 15000,
  });

  const getPriceForSeat = (seatType: 'REGULAR' | 'VIP'): number => {
    const basePrice = Number(schedule?.basePrice ?? 0);
    if (!pricingData) return basePrice;
    const rules = pricingData.pricingRules ?? [];
    const specificRule = rules.find((r) => r.seatType === seatType);
    const fallbackRule = rules.find((r) => r.seatType === null);
    return Number(specificRule?.price ?? fallbackRule?.price ?? pricingData.basePrice ?? basePrice);
  };

  const totalPrice = selectedSeats.reduce(
    (sum, seat) => sum + getPriceForSeat(seat.type as 'REGULAR' | 'VIP'),
    0,
  );

  const toggleSeat = (seat: SeatInfo) => {
    if (seat.status !== 'AVAILABLE') return;
    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => s.id === seat.id);
      if (isSelected) return prev.filter((s) => s.id !== seat.id);
      if (prev.length >= 8) {
        showToast.warning('Maksimal 8 kursi per transaksi');
        return prev;
      }
      return [...prev, seat];
    });
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      showToast.warning('Pilih minimal 1 kursi');
      return;
    }
    setIsBooking(true);
    try {
      const booking = await bookingsApi.create(scheduleId, selectedSeats.map((s) => s.id));
      showToast.success('Booking berhasil! Lanjutkan pembayaran.');
      router.push(`/bookings/${booking.bookingCode}`);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      showToast.error(msg ?? 'Gagal membuat booking', 'Booking Gagal');
      refetch();
      setSelectedSeats([]);
    } finally {
      setIsBooking(false);
    }
  };

  const getSeatStyle = (seat: SeatInfo, isSelected: boolean) => {
    if (isSelected) return 'bg-red-600 border-red-500 text-white shadow-lg shadow-red-600/30';
    if (seat.status === 'BOOKED') return 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed';
    if (seat.status === 'LOCKED') return 'bg-yellow-900/40 border-yellow-700/50 text-yellow-300 cursor-not-allowed';
    if (seat.type === 'VIP') return 'bg-purple-900/40 border-purple-700/60 text-purple-100 hover:bg-purple-800/60 hover:text-white cursor-pointer';
    return 'bg-gray-800 border-gray-600 text-gray-100 hover:bg-gray-700 hover:text-white hover:border-gray-400 cursor-pointer';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <motion.button
        onClick={() => router.back()}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </motion.button>

      {/* Schedule info */}
      {schedule && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-4 mb-6"
        >
          <h1 className="text-lg font-bold text-white mb-1">
            {schedule.movie?.title}
          </h1>
          <p className="text-gray-400 text-sm">
            {schedule.studio?.cinema?.name} • {schedule.studio?.name} •{' '}
            {formatDate(schedule.showTime)}
          </p>
        </motion.div>
      )}

      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 mb-6 text-xs"
      >
        {[
          { color: 'bg-gray-800 border-gray-600', label: 'Regular' },
          { color: 'bg-purple-900/40 border-purple-700/60', label: 'VIP' },
          { color: 'bg-red-600 border-red-500', label: 'Dipilih' },
          { color: 'bg-yellow-900/40 border-yellow-700/50', label: 'Sedang Dipilih Orang Lain' },
          { color: 'bg-gray-700 border-gray-600', label: 'Terpesan' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5 text-gray-400">
            <div className={`w-4 h-4 rounded border ${item.color}`} />
            {item.label}
          </div>
        ))}
      </motion.div>

      {/* Interactive Seat Map Area */}
      <div className="w-full overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
        <div className="min-w-max px-4 flex flex-col items-center mx-auto">
          {/* Screen */}
          <motion.div
            initial={{ opacity: 0, scaleX: 0.8 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ delay: 0.15 }}
            className="text-center mb-8 w-full"
          >
            <div className="inline-block bg-gradient-to-b from-gray-500 to-gray-700 text-gray-200 text-xs px-20 py-1.5 rounded-sm mb-1 shadow-lg shadow-gray-700/50 font-bold tracking-wider">
              LAYAR
            </div>
            <div className="h-1.5 bg-gradient-to-b from-gray-600/50 to-transparent rounded-full mx-auto w-3/4" />
          </motion.div>

          {/* Seat Map */}
          {isLoading ? (
            <div className="space-y-3 mb-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gray-800 rounded animate-pulse" />
                  <div className="flex gap-1.5">
                    {Array.from({ length: 10 }).map((_, j) => (
                      <div key={j} className="w-8 h-8 bg-gray-800 rounded animate-pulse" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <motion.div
              className="space-y-2 mb-8"
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.04 } },
              }}
            >
              {seatMap && Object.entries(seatMap.rows).map(([row, seats]) => (
                <motion.div
                  key={row}
                  variants={{
                    hidden: { opacity: 0, x: -10 },
                    show: { opacity: 1, x: 0 },
                  }}
                  className="flex items-center gap-2"
                >
                  <span className="text-gray-400 text-sm w-6 text-center font-bold flex-shrink-0">
                    {row}
                  </span>
                  <div className="flex gap-1.5 flex-nowrap">
                    {seats.map((seat) => {
                      const isSelected = selectedSeats.some((s) => s.id === seat.id);
                      return (
                        <motion.button
                          key={seat.id}
                          onClick={() => toggleSeat(seat)}
                          disabled={seat.status !== 'AVAILABLE'}
                          animate={
                            isSelected
                              ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }
                              : { scale: 1, rotate: 0 }
                          }
                          transition={{ duration: 0.3 }}
                          whileHover={
                            seat.status === 'AVAILABLE' ? { scale: 1.15 } : {}
                          }
                          whileTap={
                            seat.status === 'AVAILABLE' ? { scale: 0.9 } : {}
                          }
                          className={`w-8 h-8 rounded text-xs font-semibold border transition-colors ${getSeatStyle(seat, isSelected)}`}
                          title={`${seat.rowLabel}${seat.seatNumber} — ${seat.type} — ${seat.status}`}
                        >
                          {seat.seatNumber}
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Summary + Booking CTA */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className="card p-5 sticky bottom-4 border-gray-700 bg-gray-900/95 backdrop-blur"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-gray-400 text-sm mb-1">
                  <span className="text-white font-semibold">{selectedSeats.length} kursi</span> dipilih
                </p>
                <div className="flex flex-wrap gap-1">
                  {selectedSeats
                    .sort((a, b) => a.rowLabel.localeCompare(b.rowLabel) || a.seatNumber - b.seatNumber)
                    .map((s) => (
                      <motion.span
                        key={s.id}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className={`text-xs px-2 py-0.5 rounded font-medium ${
                          s.type === 'VIP'
                            ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
                            : 'bg-gray-800 text-gray-300'
                        }`}
                      >
                        {s.rowLabel}{s.seatNumber}
                      </motion.span>
                    ))}
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <p className="text-gray-400 text-xs mb-0.5">Total</p>
                <motion.p
                  key={totalPrice}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="text-red-400 font-bold text-xl"
                >
                  {formatCurrency(totalPrice)}
                </motion.p>
              </div>
            </div>

            {/* Breakdown per seat type */}
            {selectedSeats.some((s) => s.type === 'VIP') &&
              selectedSeats.some((s) => s.type === 'REGULAR') && (
              <div className="flex gap-3 text-xs text-gray-500 mb-3">
                <span>
                  Regular: {selectedSeats.filter((s) => s.type === 'REGULAR').length} ×{' '}
                  {formatCurrency(getPriceForSeat('REGULAR'))}
                </span>
                <span>•</span>
                <span>
                  VIP: {selectedSeats.filter((s) => s.type === 'VIP').length} ×{' '}
                  {formatCurrency(getPriceForSeat('VIP'))}
                </span>
              </div>
            )}

            <div className="flex items-center gap-3">
              <motion.button
                onClick={handleBooking}
                disabled={isBooking}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn-primary flex-1"
              >
                {isBooking ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                    />
                    Memproses...
                  </span>
                ) : (
                  'Pesan Sekarang'
                )}
              </motion.button>
            </div>

            <div className="flex items-center gap-1.5 text-yellow-500/80 text-xs mt-3">
              <Info className="w-3 h-3 flex-shrink-0" />
              Kursi akan direservasi selama 10 menit setelah pemesanan
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function SeatPickerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-red-500/30 border-t-red-500 rounded-full"
        />
      </div>
    }>
      <SeatPickerContent />
    </Suspense>
  );
}