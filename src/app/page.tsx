'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { MovieCard } from '@/components/movie/MovieCard';
import { Movie } from '@/types';
import { Film, Ticket, Shield, ChevronRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0 },
};

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
  const { data } = useQuery({
    queryKey: ['movies-home'],
    queryFn: () => moviesApi.getAll({ limit: 6,}),
  });

  const movies: Movie[] = Array.isArray(data)
    ? data
    : (data as { data?: Movie[] })?.data ?? [];

  return (
    <main className="min-h-screen bg-gray-950 overflow-x-hidden">

      {/* ─── Hero ──────────────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-red-950/10 to-gray-950" />
          {/* Floating orbs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.15, 0.25, 0.15],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Badge */}
            <motion.div variants={fadeUp} className="mb-6">
              <span className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/30 text-red-400 text-sm px-4 py-1.5 rounded-full">
                <Star className="w-3.5 h-3.5" />
                Platform Tiket Bioskop #1
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={fadeUp}
              className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            >
              Nonton Film
              <span className="text-red-500"> Favorit </span>
              Lebih Mudah
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto leading-relaxed"
            >
              Pesan tiket bioskop online, pilih kursi favorit, bayar, dan tiket langsung di tangan kamu.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap gap-4 justify-center"
            >
              <Link href="/movies">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors shadow-lg shadow-red-600/30"
                >
                  <Film className="w-5 h-5" />
                  Lihat Film
                </motion.span>
              </Link>
              <Link href="/auth/register">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 border border-gray-600 hover:border-gray-400 text-gray-300 hover:text-white px-8 py-4 rounded-xl text-lg transition-colors"
                >
                  Daftar Gratis
                  <ChevronRight className="w-5 h-5" />
                </motion.span>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap justify-center gap-8 mt-14 text-center"
            >
              {[
                { value: '100+', label: 'Film Tersedia' },
                { value: '50+', label: 'Bioskop Partner' },
                { value: '10K+', label: 'Pengguna Aktif' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-gray-600 rounded-full flex justify-center pt-2">
            <div className="w-1 h-2 bg-gray-400 rounded-full" />
          </div>
        </motion.div>
      </section>

      {/* ─── Features ──────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-white mb-3">Kenapa Cinema App?</h2>
            <p className="text-gray-400">Pengalaman terbaik beli tiket bioskop online</p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{
              hidden: {},
              show: { transition: { staggerChildren: 0.15 } },
            }}
          >
            {[
              {
                icon: Film,
                title: 'Film Terbaru',
                desc: 'Temukan film terbaru dengan jadwal tayang lengkap di bioskop favoritmu.',
                color: 'text-red-400',
                bg: 'bg-red-600/10 border-red-600/20',
              },
              {
                icon: Ticket,
                title: 'Pilih Kursi Real-Time',
                desc: 'Pilih kursi favoritmu langsung dari peta kursi interaktif yang diupdate real-time.',
                color: 'text-blue-400',
                bg: 'bg-blue-600/10 border-blue-600/20',
              },
              {
                icon: Shield,
                title: 'Pembayaran Aman',
                desc: 'Bayar dengan berbagai metode pembayaran yang aman via Midtrans.',
                color: 'text-green-400',
                bg: 'bg-green-600/10 border-green-600/20',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  variants={{
                    hidden: { opacity: 0, y: 30 },
                    show: { opacity: 1, y: 0 },
                  }}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.3 }}
                  className={`rounded-2xl border p-6 ${feature.bg}`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── Now Playing ───────────────────────────────────────────── */}
      {movies.length > 0 && (
        <section className="py-16 px-6 bg-gray-900/30">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="flex items-center justify-between mb-8"
            >
              <div>
                <h2 className="text-2xl font-bold text-white">Sedang Tayang</h2>
                <p className="text-gray-400 text-sm mt-1">Film pilihan minggu ini</p>
              </div>
              <Link href="/movies">
                <motion.span
                  whileHover={{ x: 4 }}
                  className="flex items-center gap-1 text-red-400 hover:text-red-300 text-sm font-medium transition-colors"
                >
                  Lihat semua
                  <ChevronRight className="w-4 h-4" />
                </motion.span>
              </Link>
            </motion.div>

            <motion.div
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.1 }}
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.06 } },
              }}
            >
              {movies.map((movie) => (
                <motion.div
                  key={movie.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 },
                  }}
                >
                  <MovieCard movie={movie} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ─── CTA Bottom ────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="relative bg-gradient-to-br from-red-900/40 to-purple-900/20 border border-red-600/20 rounded-3xl p-10 overflow-hidden">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="absolute -top-20 -right-20 w-40 h-40 bg-red-600/10 rounded-full"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-600/10 rounded-full"
            />
            <div className="relative z-10">
              <h2 className="text-3xl font-bold text-white mb-3">
                Siap Nonton Hari Ini?
              </h2>
              <p className="text-gray-400 mb-6">
                Daftar sekarang dan dapatkan kemudahan beli tiket bioskop online
              </p>
              <Link href="/auth/register">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-semibold transition-colors shadow-lg shadow-red-600/30"
                >
                  <Ticket className="w-4 h-4" />
                  Mulai Sekarang — Gratis!
                </motion.span>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>
    </main>
  );
}