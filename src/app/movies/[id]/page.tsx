'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { formatDateShort } from '@/lib/utils';
import { Clock, Calendar, Film, ChevronRight } from 'lucide-react';
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
  queryFn: async () => {
    const result = await moviesApi.getSchedules(id, selectedDate);
    console.log('Date selected:', selectedDate);
    console.log('Schedules result:', JSON.stringify(result, null, 2));
    return result;
  },
  enabled: !!id,
});

  // Normalize response — bisa array langsung atau { data: [] }
  const schedules: Schedule[] = Array.isArray(schedulesRaw)
    ? schedulesRaw
    : (schedulesRaw as { data?: Schedule[] })?.data ?? [];

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    return d;
  });

  if (loadingMovie) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse">
        <div className="flex gap-8">
          <div className="w-64 aspect-[2/3] bg-gray-800 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-gray-800 rounded w-2/3" />
            <div className="h-4 bg-gray-800 rounded w-1/3" />
            <div className="h-32 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Movie Info */}
      <div className="flex flex-col md:flex-row gap-8 mb-10">
        <div className="relative w-48 md:w-64 aspect-[2/3] flex-shrink-0 rounded-xl overflow-hidden bg-gray-800 self-start">
          {movie.posterUrl ? (
            <Image src={movie.posterUrl} alt={movie.title} fill className="object-cover" />
          ) : (
            <div className="flex items-center justify-center h-full text-5xl">🎬</div>
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{movie.title}</h1>
            <span className="bg-red-600 text-white text-sm px-2 py-1 rounded mt-1 flex-shrink-0">
              {movie.rating}
            </span>
          </div>

          <div className="flex flex-wrap gap-4 text-gray-400 text-sm mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {movie.durationMinutes} menit
            </span>
            <span className="flex items-center gap-1">
              <Film className="w-4 h-4" />
              {movie.genre}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {formatDateShort(movie.releaseDate)}
            </span>
          </div>

          {movie.director && (
            <p className="text-gray-400 text-sm mb-2">
              <span className="text-gray-300 font-medium">Sutradara:</span> {movie.director}
            </p>
          )}

          {movie.cast && (
            <p className="text-gray-400 text-sm mb-4">
              <span className="text-gray-300 font-medium">Pemain:</span> {movie.cast}
            </p>
          )}

          <p className="text-gray-300 leading-relaxed">{movie.synopsis}</p>
        </div>
      </div>

      {/* Schedule Section */}
      <div>
        <h2 className="text-xl font-bold text-white mb-4">Pilih Jadwal</h2>

        {/* Date Picker */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {dates.map((date) => {
            const dateStr = date.toISOString().split('T')[0];
            const isSelected = dateStr === selectedDate;
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`flex-shrink-0 px-4 py-3 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <div className="text-xs font-medium">
                  {isToday ? 'Hari ini' : date.toLocaleDateString('id-ID', { weekday: 'short' })}
                </div>
                <div className="text-lg font-bold">{date.getDate()}</div>
                <div className="text-xs">
                  {date.toLocaleDateString('id-ID', { month: 'short' })}
                </div>
              </button>
            );
          })}
        </div>

        {/* Schedule List */}
        {loadingSchedules ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-5 bg-gray-800 rounded w-1/4 mb-2" />
                <div className="h-4 bg-gray-800 rounded w-1/3" />
              </div>
            ))}
          </div>
        ) : schedules.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>Tidak ada jadwal untuk tanggal ini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <button
                key={schedule.id}
                onClick={() => router.push(`/movies/${id}/seats?scheduleId=${schedule.id}`)}
                disabled={schedule.isSoldOut}
                className="w-full card p-4 text-left hover:border-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className="text-2xl font-bold text-white">
                        {new Date(schedule.showTime).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {schedule.isSoldOut && (
                        <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded">
                          Habis
                        </span>
                      )}
                    </div>
                    <div className="flex gap-3 text-sm text-gray-400">
                      <span>{schedule.studio?.cinema?.name}</span>
                      <span>•</span>
                      <span>{schedule.studio?.name}</span>
                      <span>•</span>
                      <span>{schedule.format?.replace('_', ' ')}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-red-400 font-semibold">
                      Rp {Number(schedule.basePrice).toLocaleString('id-ID')}
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-600 group-hover:text-red-400 ml-auto mt-1 transition-colors" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}