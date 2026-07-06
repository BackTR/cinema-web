import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types';
import { Clock, Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`}>
      <motion.div
        whileHover={{ y: -4 }}
        transition={{ duration: 0.2 }}
        className="card hover:border-gray-600 transition-colors cursor-pointer group"
      >
        {/* Poster */}
        <div className="relative aspect-[2/3] overflow-hidden rounded-t-xl bg-gray-800">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              <span className="text-5xl">🎬</span>
            </div>
          )}

          {/* Overlay gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Rating badge */}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium backdrop-blur-sm">
            {movie.rating}
          </div>

          {/* Genre badge on hover */}
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="bg-red-600/80 text-white text-xs px-2 py-0.5 rounded-md backdrop-blur-sm">
              {movie.genre}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-white text-sm line-clamp-2 mb-1.5 group-hover:text-red-400 transition-colors">
            {movie.title}
          </h3>
          <div className="flex items-center gap-1 text-gray-500 text-xs">
            <Clock className="w-3 h-3" />
            {movie.durationMinutes} menit
            {movie.averageRating && movie.averageRating > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              <span className="text-yellow-400">{movie.averageRating}</span>
              <span className="text-gray-600">({movie.totalReviews})</span>
            </span>
          )}
          </div>
        </div>
      </motion.div>
    </Link>
  );
}