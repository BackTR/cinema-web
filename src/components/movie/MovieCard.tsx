import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '@/types';
import { Clock, Star } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
}

export function MovieCard({ movie }: MovieCardProps) {
  return (
    <Link href={`/movies/${movie.id}`}>
      <div className="card hover:border-gray-600 transition-all hover:-translate-y-1 cursor-pointer group">
        {/* Poster */}
        <div className="relative aspect-2/3 overflow-hidden rounded-t-xl bg-gray-800">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-600">
              <span className="text-5xl">🎬</span>
            </div>
          )}
          {/* Rating badge */}
          <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md font-medium">
            {movie.rating}
          </div>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2">
            {movie.title}
          </h3>
          <div className="flex items-center gap-3 text-gray-400 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {movie.durationMinutes} menit
            </span>
            <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">
              {movie.genre}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}