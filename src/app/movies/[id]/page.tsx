'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { formatDateShort, formatCurrency } from '@/lib/utils';
import { Clock, Film, Calendar, Play, Ticket, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Schedule } from '@/types';

export default function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const { data: movie, isLoading: loadingMovie } = useQuery({
    queryKey: ['movie', id],
    queryFn: () => moviesApi.getOne(id),
  });

  const { data: schedulesRaw, isLoading: loadingSchedules } = useQuery({
    queryKey: ['schedules', id, selectedDate],
    queryFn: () => moviesApi.getSchedules(id, selectedDate),
    enabled: !!id,
  });

  const schedules: Schedule[] = Array.isArray(schedulesRaw)
    ? schedulesRaw
    : (schedulesRaw as { data?: Schedule[] })?.data ?? [];

  // Group jadwal per bioskop
  const schedulesByCinema = schedules.reduce<Record<string, { cinemaName: string; schedules: Schedule[] }>>(
    (acc, schedule) => {
      const cinemaId = schedule.studio?.cinema?.id ?? 'unknown';
      const cinemaName = schedule.studio?.cinema?.name ?? 'Unknown Cinema';
      if (!acc[cinemaId]) acc[cinemaId] = { cinemaName, schedules: [] };
      acc[cinemaId].schedules.push(schedule);
      return acc;
    },
    {}
  );

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  if (loadingMovie) {
    return (
      <div className="min-h-screen bg-gray-950 animate-pulse">
        <div className="h-[70vh] bg-gray-900" />
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-4">
          <div className="h-10 bg-gray-800 rounded w-2/3" />
          <div className="h-4 bg-gray-800 rounded w-1/3" />
          <div className="h-32 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="min-h-screen bg-gray-950">

      {/* ─── Hero Section ─────────────────────────────────────────── */}
      <div className="relative w-full h-[75vh] min-h-[600px] overflow-hidden">

        {/* Backdrop blur background dari poster */}
        {movie.posterUrl ? (
          <>
            <div
              className="absolute inset-0 scale-110"
              style={{
                backgroundImage: `url(${movie.posterUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center top',
                filter: 'blur(40px) brightness(0.4) saturate(1.5)',
              }}
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-950/90 via-transparent to-gray-950/30" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-gray-900 to-gray-950" />
        )}

        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 h-full flex items-end pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 w-full items-end">

            {/* Poster */}
            <div className="hidden md:block md:col-span-3">
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
                {movie.posterUrl ? (
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-gray-800 text-6xl">
                    🎬
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="md:col-span-9">
              {/* Genre badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="bg-white/10 backdrop-blur border border-white/20 text-white text-xs px-3 py-1 rounded-full font-medium uppercase tracking-wider">
                  {movie.genre}
                </span>
                <span className="bg-red-600/80 backdrop-blur border border-red-500/50 text-white text-xs px-3 py-1 rounded-full font-medium">
                  {movie.rating}
                </span>
                {movie.format && movie.format !== 'TWO_D' && (
                  <span className="bg-blue-600/80 backdrop-blur border border-blue-500/50 text-white text-xs px-3 py-1 rounded-full font-medium">
                    {movie.format.replace('_', ' ')}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg leading-tight">
                {movie.title}
              </h1>

              {/* Meta */}
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

              {/* Synopsis */}
              <p className="text-gray-300 text-base leading-relaxed max-w-2xl mb-6 line-clamp-3">
                {movie.synopsis}
              </p>

              {/* Cast */}
              {movie.cast && (
                <p className="text-gray-400 text-sm mb-6">
                  <span className="text-gray-200 font-medium">Pemain: </span>
                  {movie.cast}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    document.getElementById('booking-section')?.scrollIntoView({
                      behavior: 'smooth',
                    });
                  }}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-full font-semibold transition-all shadow-lg shadow-red-600/30 active:scale-95"
                >
                  <Ticket className="w-4 h-4" />
                  Beli Tiket
                </button>

                {movie.trailerUrl && (
                  <a
                    href={movie.trailerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur border border-white/20 text-white px-8 py-3 rounded-full font-semibold transition-all active:scale-95"
                  >
                    <Play className="w-4 h-4" />
                    Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Booking Section ──────────────────────────────────────── */}
      <div id="booking-section" className="max-w-6xl mx-auto px-6 py-10">

        {/* Glassmorphism card */}
        <div className="bg-gray-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Pilih Jadwal Tayang</h2>
          </div>

          {/* Date Picker */}
          <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
            {dates.map((date) => {
              const dateStr = date.toISOString().split('T')[0];
              const isSelected = dateStr === selectedDate;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDate(dateStr)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center w-20 py-3 rounded-xl transition-all ${
                    isSelected
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 scale-105 border border-red-500'
                      : 'bg-gray-800/80 text-gray-300 hover:bg-gray-700 border border-white/10'
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">
                    {date.toLocaleDateString('id-ID', { month: 'short' })}
                  </span>
                  <span className="text-2xl font-bold leading-none">{date.getDate()}</span>
                  <span className="text-xs mt-1 opacity-80">
                    {isToday ? 'Hari ini' : date.toLocaleDateString('id-ID', { weekday: 'short' })}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Schedule List */}
          {loadingSchedules ? (
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-4 animate-pulse">
                  <div className="h-5 bg-gray-700 rounded w-1/3 mb-3" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-10 w-20 bg-gray-700 rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : Object.keys(schedulesByCinema).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>Tidak ada jadwal untuk tanggal ini.</p>
              <p className="text-sm mt-1">Coba pilih tanggal lain.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(schedulesByCinema).map(([cinemaId, group]) => (
                <div key={cinemaId} className="border-t border-white/5 pt-6 first:border-0 first:pt-0">
                  {/* Cinema Name */}
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-red-500 rounded-full" />
                    <h3 className="text-white font-semibold">{group.cinemaName}</h3>
                  </div>

                  {/* Time Buttons */}
                  <div className="flex flex-wrap gap-2">
                    {group.schedules.map((schedule) => (
                      <button
                        key={schedule.id}
                        onClick={() =>
                          router.push(`/movies/${id}/seats?scheduleId=${schedule.id}`)
                        }
                        disabled={schedule.isSoldOut}
                        className={`group relative px-5 py-2.5 rounded-xl border transition-all font-medium text-sm ${
                          schedule.isSoldOut
                            ? 'border-gray-700 text-gray-600 cursor-not-allowed bg-gray-800/30'
                            : 'border-white/15 bg-gray-800/80 text-white hover:border-red-500/60 hover:bg-red-600/10 hover:text-red-400 active:scale-95'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold">
                            {new Date(schedule.showTime).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                          {schedule.format && schedule.format !== 'TWO_D' && (
                            <span className="text-xs bg-white/10 px-1.5 py-0.5 rounded text-gray-400 font-semibold tracking-wider">
                              {schedule.format.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {formatCurrency(Number(schedule.basePrice))}
                        </div>
                        {schedule.isSoldOut && (
                          <span className="absolute -top-2 -right-2 text-xs bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded-full">
                            Habis
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Synopsis full (di bawah booking card) */}
        <div className="mt-8 bg-gray-900/40 border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-3">Sinopsis</h2>
          <p className="text-gray-300 leading-relaxed">{movie.synopsis}</p>
        </div>
      </div>
    </div>
  );
}