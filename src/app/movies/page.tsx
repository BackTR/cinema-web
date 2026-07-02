'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { MovieCard } from '@/components/movie/MovieCard';
import { Movie } from '@/types';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

const RATINGS = ['SU', '13+', '17+', '21+'];
const GENRES = ['Action', 'Drama', 'Comedy', 'Horror', 'Romance', 'Sci-Fi', 'Animation'];

export default function MoviesPage() {
  const [search, setSearch] = useState('');
  const [genre, setGenre] = useState('');
  const [rating, setRating] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['movies', { search, genre, rating, page }],
    queryFn: () => moviesApi.getAll({ search, genre, rating, page, limit: 12 }),
  });

  // data bisa array atau object { data: [], meta: {} }
  const movies: Movie[] = Array.isArray(data) ? data : (data as { data: Movie[] })?.data ?? [];
  const meta = Array.isArray(data) ? null : (data as { meta?: { totalPages: number } })?.meta;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-white mb-8">🎬 Film Sedang Tayang</h1>

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-8">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            className="input pl-10"
            placeholder="Cari film..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>

        <select
          className="input w-auto"
          value={genre}
          onChange={(e) => { setGenre(e.target.value); setPage(1); }}
        >
          <option value="">Semua Genre</option>
          {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        <select
          className="input w-auto"
          value={rating}
          onChange={(e) => { setRating(e.target.value); setPage(1); }}
        >
          <option value="">Semua Rating</option>
          {RATINGS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>

        {(search || genre || rating) && (
          <button
            onClick={() => { setSearch(''); setGenre(''); setRating(''); setPage(1); }}
            className="btn-secondary text-sm px-4 py-2"
          >
            Reset
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="card animate-pulse">
              <div className="aspect-[2/3] bg-gray-800 rounded-t-xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
                <div className="h-3 bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="text-center py-20">
          <p className="text-gray-400">Gagal memuat film. Coba lagi.</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-4xl mb-4">🎭</p>
          <p className="text-gray-400">Tidak ada film yang ditemukan.</p>
        </div>
      ) : (
        <>
          <motion.div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4"
            initial="hidden"
            animate="show"
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {movies.map((movie) => (
              <motion.div
                key={movie.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 },
                }}
                transition={{ duration: 0.3 }}
              >
                <MovieCard movie={movie} />
              </motion.div>
            ))}
          </motion.div>

          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-3 mt-10">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
              >
                ← Sebelumnya
              </button>
              <span className="text-gray-400 text-sm">
                Halaman {page} dari {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === meta.totalPages}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
              >
                Selanjutnya →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}