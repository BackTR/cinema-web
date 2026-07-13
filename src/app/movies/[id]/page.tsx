'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { formatDateShort, formatCurrency } from '@/lib/utils';
import {
  Clock, Film, Calendar, Play, Ticket,
  ChevronRight, MapPin, X, Users, AlertCircle,
} from 'lucide-react';
import Image from 'next/image';
import { Schedule } from '@/types';
import { useAuthStore } from '@/stores/auth.store';
import { useLocationStore } from '@/stores/location.store';
import { CinemaPicker } from '@/components/movie/CinemaPicker';
import { showToast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ReviewList } from '@/components/movie/ReviewList';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const selectedCinemaId = useLocationStore((s) => s.selectedCinemaId);
  const selectedCinemaName = useLocationStore((s) => s.selectedCinemaName);
  const setSelectedCinema = useLocationStore((s) => s.setSelectedCinema);
  const clearSelectedCinema = useLocationStore((s) => s.clearSelectedCinema);

  const [showBooking, setShowBooking] = useState(false);
  const [showCinemaPicker, setShowCinemaPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');

  // Helper to format date as YYYY-MM-DD in Asia/Jakarta timezone
  const getLocalDateString = (d: Date) => {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jakarta' }).format(d);
  };

  // Generate 7 hari ke depan
  const dates = useMemo(() =>
    Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    }), []);

  const startDate = getLocalDateString(dates[0]);
  const endDate = getLocalDateString(dates[6]);

  const { data: movie, isLoading: loadingMovie } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesApi.getOne(id),
  });

  // Fetch available dates — untuk highlight tanggal yang ada jadwalnya
  const { data: availabilityData } = useQuery({
    queryKey: ['available-dates', id, startDate, endDate],
    queryFn: () => moviesApi.getAvailableDates(id, startDate, endDate),
    enabled: !!id && showBooking,
  });

  const availableDates = availabilityData?.dates ?? [];

  // Auto-select tanggal pertama yang ada jadwal
  useMemo(() => {
    if (availableDates.length > 0 && !selectedDate) {
      setSelectedDate(availableDates[0]);
    }
  }, [availableDates, selectedDate]);

  const { data: schedulesRaw, isLoading: loadingSchedules } = useQuery({
    queryKey: ['schedules', id, selectedDate, selectedCinemaId],
    queryFn: () => moviesApi.getSchedules(id, selectedDate),
    enabled: !!id && showBooking && !!selectedDate,
    refetchInterval: 30000,
  });

  const allSchedules: Schedule[] = Array.isArray(schedulesRaw)
    ? schedulesRaw
    : (schedulesRaw as { data?: Schedule[] })?.data ?? [];

  const schedules = selectedCinemaId
    ? allSchedules.filter((s) => s.studio?.cinema?.id === selectedCinemaId)
    : allSchedules;

  // Group by cinema
  const schedulesByCinema = schedules.reduce<
    Record<string, { cinemaName: string; schedules: Schedule[] }>
  >((acc, schedule) => {
    const cinemaId = schedule.studio?.cinema?.id ?? 'unknown';
    const cinemaName = schedule.studio?.cinema?.name ?? 'Unknown';

    if (!acc[cinemaId]) {
      acc[cinemaId] = {
        cinemaName,
        schedules: [],
      };
    }

    acc[cinemaId].schedules.push(schedule);
    return acc;
  }, {});

  const handleBuyTicket = () => {
    if (!isAuthenticated) {
      showToast.warning('Silakan login terlebih dahulu');
      router.push('/auth/login');
      return;
    }
    setShowBooking(true);
    setTimeout(() => {
      document.getElementById('booking-section')?.scrollIntoView({
        behavior: 'smooth', block: 'start',
      });
    }, 100);
  };

  const handleCinemaSelect = (cinemaId: string, cinemaName: string) => {
    setSelectedCinema(cinemaId, cinemaName);
    setShowCinemaPicker(false);
    showToast.success(`Bioskop: ${cinemaName}`);
  };

  if (loadingMovie) {
    return (
      <div className="min-h-screen bg-gray-950 animate-pulse">
        <div className="h-[70vh] bg-gray-900" />
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-4">
          <div className="h-10 bg-gray-800 rounded w-2/3" />
          <div className="h-4 bg-gray-800 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-gray-950">

      {/* Hero */}
      <div className="relative w-full h-[75vh] min-h-[580px] overflow-hidden">
        {movie.posterUrl ? (
          <>
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${movie.posterUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                filter: 'blur(40px) brightness(0.35) saturate(1.5)',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-transparent to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950" />
        )}

        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex items-end pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-end">

            {/* Poster */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="hidden md:block md:col-span-3"
            >
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl shadow-black/50">
                {movie.posterUrl ? (
                  <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" priority />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-800 text-6xl">🎬</div>
                )}
              </div>
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="md:col-span-9"
            >
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                  {movie.genre}
                </span>
                <span className="bg-red-600/80 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {movie.rating}
                </span>
                {movie.format && movie.format !== 'TWO_D' && (
                  <span className="bg-blue-600/80 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {movie.format.replace('_', ' ')}
                  </span>
                )}
              </div>

              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
                {movie.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-gray-300 text-sm mb-5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {movie.durationMinutes} menit
                </span>
                <span className="text-gray-600">•</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {formatDateShort(movie.releaseDate)}
                </span>
                {movie.director && (
                  <>
                    <span className="text-gray-600">•</span>
                    <span className="flex items-center gap-1.5">
                      <Film className="w-4 h-4 text-gray-400" />
                      {movie.director}
                    </span>
                  </>
                )}
              </div>

              <p className="text-gray-300 text-base leading-relaxed max-w-2xl mb-6 line-clamp-3">
                {movie.synopsis}
              </p>

              {movie.cast && (
                <p className="text-gray-400 text-sm mb-6">
                  <span className="text-gray-200 font-medium">Pemain: </span>{movie.cast}
                </p>
              )}

              <div className="flex flex-wrap gap-3">
                <motion.button
                  onClick={handleBuyTicket}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-red-600/30"
                >
                  <Ticket className="w-4 h-4" />
                  Beli Tiket
                </motion.button>

                {movie.trailerUrl && (
                  <motion.a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white px-8 py-3 rounded-full font-semibold transition-all"
                  >
                    <Play className="w-4 h-4" />
                    Trailer
                  </motion.a>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <AnimatePresence>
        {showBooking && (
          <motion.div
            id="booking-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-6xl mx-auto px-6 py-8"
          >
            <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">

              {/* Header */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-white">Pilih Jadwal Tayang</h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {availableDates.length > 0
                      ? `Ada jadwal di ${availableDates.length} tanggal`
                      : 'Memuat ketersediaan jadwal...'}
                  </p>
                </div>

                {/* Cinema selector */}
                <motion.button
                  onClick={() => setShowCinemaPicker(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 text-white px-4 py-2.5 rounded-xl transition-all text-sm self-start md:self-auto"
                >
                  <MapPin className="w-4 h-4 text-red-400" />
                  {selectedCinemaName ?? (
                    <span className="text-gray-400">Semua Bioskop</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </motion.button>
              </div>

              {/* Selected cinema badge */}
              <AnimatePresence>
                {selectedCinemaName && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 mb-5 bg-red-600/10 border border-red-600/30 rounded-xl px-4 py-2.5"
                  >
                    <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <span className="text-red-300 text-sm font-medium flex-1">
                      {selectedCinemaName}
                    </span>
                    <button onClick={clearSelectedCinema} className="text-gray-400 hover:text-white">
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Date Picker — dengan visual availability */}
              <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
                {dates.map((date) => {
                  const dateStr = getLocalDateString(date);
                  const isSelected = dateStr === selectedDate;
                  const isToday = dateStr === getLocalDateString(new Date());
                  const hasSchedule = availableDates.includes(dateStr);
                  const isLoadingAvailability = availableDates.length === 0;

                  return (
                    <motion.button
                      key={dateStr}
                      onClick={() => {
                        if (!hasSchedule && !isLoadingAvailability) {
                          showToast.info('Tidak ada jadwal di tanggal ini');
                          return;
                        }
                        setSelectedDate(dateStr);
                      }}
                      whileHover={hasSchedule || isLoadingAvailability ? { scale: 1.05 } : {}}
                      whileTap={hasSchedule || isLoadingAvailability ? { scale: 0.95 } : {}}
                      className={`flex-shrink-0 flex flex-col items-center justify-center w-[72px] py-3 rounded-xl transition-all relative
                        ${isSelected
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 border border-red-500'
                          : hasSchedule
                          ? 'bg-gray-800 text-gray-200 hover:bg-gray-700 border border-white/10 cursor-pointer'
                          : isLoadingAvailability
                          ? 'bg-gray-800/50 text-gray-500 border border-white/5'
                          : 'bg-gray-900 text-gray-600 border border-gray-800 cursor-not-allowed opacity-50'
                        }`}
                    >
                      <span className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">
                        {date.toLocaleDateString('id-ID', { month: 'short' })}
                      </span>
                      <span className="text-xl font-bold leading-none">{date.getDate()}</span>
                      <span className="text-xs mt-1 opacity-80">
                        {isToday ? 'Hari ini' : date.toLocaleDateString('id-ID', { weekday: 'short' })}
                      </span>

                      {/* Dot indicator ada jadwal */}
                      {hasSchedule && !isSelected && (
                        <div className="absolute bottom-1.5 w-1 h-1 bg-red-400 rounded-full" />
                      )}

                      {/* Loading skeleton */}
                      {isLoadingAvailability && (
                        <div className="absolute bottom-1.5 w-4 h-0.5 bg-gray-700 rounded animate-pulse" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {/* Schedule Content */}
              <AnimatePresence mode="wait">
                {!selectedDate ? (
                  <motion.div
                    key="no-date"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10 text-gray-500"
                  >
                    <Calendar className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">Pilih tanggal untuk melihat jadwal</p>
                  </motion.div>
                ) : loadingSchedules ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-4"
                  >
                    {[1, 2].map((i) => (
                      <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
                        <div className="h-4 bg-gray-700 rounded w-1/3 mb-4" />
                        <div className="flex gap-2">
                          {[1, 2, 3].map((j) => (
                            <div key={j} className="h-16 w-24 bg-gray-700 rounded-xl" />
                          ))}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ) : Object.keys(schedulesByCinema).length === 0 ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-10"
                  >
                    <AlertCircle className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">Tidak ada jadwal tersedia</p>
                    {selectedCinemaId ? (
                      <p className="text-gray-500 text-sm mt-2">
                        di {selectedCinemaName} untuk tanggal ini.{' '}
                        <button
                          onClick={clearSelectedCinema}
                          className="text-red-400 hover:text-red-300 underline"
                        >
                          Tampilkan semua bioskop
                        </button>
                      </p>
                    ) : (
                      <p className="text-gray-500 text-sm mt-2">
                        Coba pilih tanggal lain yang ada titik merah
                      </p>
                    )}
                  </motion.div>
                ) : (
                  <motion.div
                    key="schedules"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    {Object.entries(schedulesByCinema).map(([cinemaId, group], groupIndex) => (
                      <motion.div
                        key={cinemaId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: groupIndex * 0.05 }}
                        className="border-t border-white/5 pt-6 first:border-0 first:pt-0"
                      >
                        {/* Cinema header */}
                        <div className="flex items-center gap-2 mb-4">
                          <div className="w-1 h-5 bg-red-500 rounded-full" />
                          <h3 className="text-white font-semibold">{group.cinemaName}</h3>
                        </div>

                        {/* Time buttons */}
                        <div className="flex flex-wrap gap-2">
                          {group.schedules.map((schedule) => {
                            const seatsLeft = schedule.isSoldOut ? 0 : null;

                            return (
                              <motion.button
                                key={schedule.id}
                                onClick={() =>
                                  router.push(`/movies/${id}/seats?scheduleId=${schedule.id}`)
                                }
                                disabled={schedule.isSoldOut}
                                whileHover={!schedule.isSoldOut ? { scale: 1.03 } : {}}
                                whileTap={!schedule.isSoldOut ? { scale: 0.97 } : {}}
                                className={`relative px-5 py-3 rounded-xl border transition-all text-left min-w-[96px]
                                  ${schedule.isSoldOut
                                    ? 'border-gray-700 text-gray-600 cursor-not-allowed bg-gray-800/30'
                                    : 'border-white/15 bg-gray-800/80 text-white hover:border-red-500/60 hover:bg-red-600/10'
                                  }`}
                              >
                                <div className="flex items-center gap-1.5 mb-1">
                                  <span className="text-base font-bold">
                                    {new Date(schedule.showTime).toLocaleTimeString('id-ID', {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      timeZone: 'Asia/Jakarta',
                                    })}
                                  </span>
                                  {schedule.format && schedule.format !== 'TWO_D' && (
                                    <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-400 font-semibold">
                                      {schedule.format.replace('_', ' ')}
                                    </span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-400">
                                  {formatCurrency(Number(schedule.basePrice))}
                                </div>
                                {schedule.isSoldOut && (
                                  <span className="absolute -top-2 -right-2 text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full">
                                    Habis
                                  </span>
                                )}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Synopsis */}
      <div className="max-w-6xl mx-auto px-6 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-900/40 border border-white/5 rounded-2xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-3">Sinopsis</h2>
          <p className="text-gray-300 leading-relaxed">{movie.synopsis}</p>
        </motion.div>
      </div>
      {/* Reviews Section */}
<div className="max-w-6xl mx-auto px-6 pb-12">
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
  >
    <ReviewList movieId={id} />
  </motion.div>
</div>

      {/* Cinema Picker Modal */}
      <AnimatePresence>
        {showCinemaPicker && (
          <CinemaPicker
            onSelect={handleCinemaSelect}
            onClose={() => setShowCinemaPicker(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}