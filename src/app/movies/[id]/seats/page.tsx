'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { bookingsApi } from '@/lib/api/bookings';
import { useAuthStore } from '@/stores/auth.store';
import { SeatInfo } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { ArrowLeft, Info } from 'lucide-react';

export default function SeatPickerPage() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get('scheduleId') ?? '';
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  const [selectedSeats, setSelectedSeats] = useState<SeatInfo[]>([]);
  const [isBooking, setIsBooking] = useState(false);

  // Redirect ke login kalau belum auth
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Silakan login terlebih dahulu');
      router.push('/auth/login');
    }
  }, [isAuthenticated, router]);

  const { data: schedule } = useQuery({
    queryKey: ['schedule', scheduleId],
    queryFn: async () => {
      const { data } = await import('@/lib/api').then((m) => m.api.get(`/schedules/${scheduleId}`));
      return data.data;
    },
    enabled: !!scheduleId,
  });

  const { data: seatMap, isLoading, refetch } = useQuery({
    queryKey: ['seatMap', scheduleId],
    queryFn: () => moviesApi.getSeatMap(scheduleId),
    enabled: !!scheduleId,
    refetchInterval: 15000, // Refresh tiap 15 detik
  });

  const toggleSeat = (seat: SeatInfo) => {
    if (seat.status !== 'AVAILABLE') return;

    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => s.id === seat.id);
      if (isSelected) return prev.filter((s) => s.id !== seat.id);
      if (prev.length >= 8) {
        toast.error('Maksimal 8 kursi per transaksi');
        return prev;
      }
      return [...prev, seat];
    });
  };

  const handleBooking = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Pilih minimal 1 kursi');
      return;
    }

    setIsBooking(true);
    try {
      const booking = await bookingsApi.create(
        scheduleId,
        selectedSeats.map((s) => s.id),
      );
      toast.success('Booking berhasil! Lanjutkan pembayaran.');
      router.push(`/bookings/${booking.bookingCode}`);
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Gagal membuat booking');
      refetch();
      setSelectedSeats([]);
    } finally {
      setIsBooking(false);
    }
  };

  const totalPrice = selectedSeats.length * Number(schedule?.basePrice ?? 0);

  const getSeatColor = (seat: SeatInfo, isSelected: boolean) => {
    if (isSelected) return 'bg-red-600 border-red-500 text-white';
    if (seat.status === 'BOOKED') return 'bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed';
    if (seat.status === 'LOCKED') return 'bg-yellow-900/50 border-yellow-700 text-yellow-600 cursor-not-allowed';
    if (seat.type === 'VIP') return 'bg-purple-900/50 border-purple-700 text-purple-300 hover:bg-purple-800 cursor-pointer';
    return 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 cursor-pointer';
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali
      </button>

      {schedule && (
        <div className="card p-4 mb-6">
          <h1 className="text-xl font-bold text-white mb-1">
            {schedule.movie?.title}
          </h1>
          <p className="text-gray-400 text-sm">
            {schedule.studio?.cinema?.name} • {schedule.studio?.name} •{' '}
            {formatDate(schedule.showTime)}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs">
        {[
          { color: 'bg-gray-800 border-gray-600', label: 'Tersedia (Regular)' },
          { color: 'bg-purple-900/50 border-purple-700', label: 'Tersedia (VIP)' },
          { color: 'bg-red-600 border-red-500', label: 'Dipilih' },
          { color: 'bg-yellow-900/50 border-yellow-700', label: 'Sedang Dipilih Orang Lain' },
          { color: 'bg-gray-700 border-gray-600', label: 'Sudah Terpesan' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2 text-gray-400">
            <div className={`w-5 h-5 rounded border ${item.color}`} />
            {item.label}
          </div>
        ))}
      </div>

      {/* Screen */}
      <div className="text-center mb-8">
        <div className="inline-block bg-gray-700 text-gray-400 text-xs px-16 py-1 rounded-sm mb-1">
          LAYAR
        </div>
        <div className="h-1 bg-gradient-to-b from-gray-600 to-transparent rounded mx-auto w-3/4" />
      </div>

      {/* Seat Map */}
      {isLoading ? (
        <div className="text-center py-12 text-gray-400">Memuat peta kursi...</div>
      ) : (
        <div className="space-y-2 mb-8">
          {seatMap && Object.entries(seatMap.rows).map(([row, seats]) => (
            <div key={row} className="flex items-center gap-2">
              <span className="text-gray-500 text-sm w-6 text-center font-medium">{row}</span>
              <div className="flex gap-1.5 flex-wrap">
                {seats.map((seat) => {
                  const isSelected = selectedSeats.some((s) => s.id === seat.id);
                  return (
                    <button
                      key={seat.id}
                      onClick={() => toggleSeat(seat)}
                      disabled={seat.status !== 'AVAILABLE'}
                      className={`w-8 h-8 rounded text-xs font-medium border transition-all ${getSeatColor(seat, isSelected)}`}
                      title={`${seat.rowLabel}${seat.seatNumber} - ${seat.type} - ${seat.status}`}
                    >
                      {seat.seatNumber}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary & Booking */}
      {selectedSeats.length > 0 && (
        <div className="card p-6 sticky bottom-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-gray-400 text-sm">
                {selectedSeats.length} kursi dipilih:{' '}
                <span className="text-white font-medium">
                  {selectedSeats
                    .sort((a, b) => a.rowLabel.localeCompare(b.rowLabel) || a.seatNumber - b.seatNumber)
                    .map((s) => `${s.rowLabel}${s.seatNumber}`)
                    .join(', ')}
                </span>
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Total:{' '}
                <span className="text-red-400 font-bold text-lg">
                  {formatCurrency(totalPrice)}
                </span>
              </p>
            </div>
            <button
              onClick={handleBooking}
              disabled={isBooking}
              className="btn-primary px-8"
            >
              {isBooking ? 'Memproses...' : 'Pesan Sekarang'}
            </button>
          </div>
          <div className="flex items-center gap-2 text-yellow-500 text-xs">
            <Info className="w-3 h-3" />
            Kursi akan direservasi selama 10 menit setelah pemesanan
          </div>
        </div>
      )}
    </div>
  );
}