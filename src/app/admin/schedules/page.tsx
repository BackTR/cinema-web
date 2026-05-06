'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { adminApi } from '@/lib/api/admin';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Schedule, Movie } from '@/types';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

export default function AdminSchedulesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    movieId: '',
    studioId: '',
    showTime: '',
    basePrice: 50000,
  });

  const { data: moviesRaw } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: () => moviesApi.getAll({ limit: 50 }),
  });

  const { data: cinemasRaw } = useQuery({
    queryKey: ['admin-cinemas'],
    queryFn: adminApi.getCinemas,
  });

  const { data: studiosRaw } = useQuery({
    queryKey: ['admin-studios', form.movieId ? (cinemasRaw as Array<{ id: string }>)?.[0]?.id : ''],
    queryFn: () => {
      const cinemas = Array.isArray(cinemasRaw) ? cinemasRaw : [];
      if (cinemas.length === 0) return [];
      return adminApi.getStudios((cinemas[0] as { id: string }).id);
    },
    enabled: !!(cinemasRaw && (Array.isArray(cinemasRaw) ? cinemasRaw.length > 0 : false)),
  });

  const { data: schedulesRaw, isLoading } = useQuery({
    queryKey: ['admin-schedules'],
    queryFn: () => moviesApi.getSchedules('', ''),
  });

  const movies: Movie[] = Array.isArray(moviesRaw)
    ? moviesRaw
    : (moviesRaw as { data?: Movie[] })?.data ?? [];

  const schedules: Schedule[] = Array.isArray(schedulesRaw)
    ? schedulesRaw
    : (schedulesRaw as { data?: Schedule[] })?.data ?? [];

  const studios = Array.isArray(studiosRaw) ? studiosRaw : [];

  const createMutation = useMutation({
    mutationFn: adminApi.createSchedule,
    onSuccess: () => {
      toast.success('Jadwal berhasil ditambahkan!');
      queryClient.invalidateQueries({ queryKey: ['admin-schedules'] });
      setShowForm(false);
      setForm({ movieId: '', studioId: '', showTime: '', basePrice: 50000 });
    },
    onError: () => toast.error('Gagal menambahkan jadwal'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      basePrice: Number(form.basePrice),
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manajemen Jadwal</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Jadwal
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Tambah Jadwal</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="label">Film</label>
                <select
                  className="input"
                  value={form.movieId}
                  onChange={(e) => setForm({ ...form, movieId: e.target.value })}
                  required
                >
                  <option value="">Pilih Film</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Studio</label>
                <select
                  className="input"
                  value={form.studioId}
                  onChange={(e) => setForm({ ...form, studioId: e.target.value })}
                  required
                >
                  <option value="">Pilih Studio</option>
                  {(studios as Array<{ id: string; name: string; cinema: { name: string } }>).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.cinema?.name} — {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Waktu Tayang</label>
                <input
                  type="datetime-local"
                  className="input"
                  value={form.showTime}
                  onChange={(e) => setForm({ ...form, showTime: new Date(e.target.value).toISOString() })}
                  required
                />
              </div>
              <div>
                <label className="label">Harga Dasar (Rp)</label>
                <input
                  type="number"
                  className="input"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                  required
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Film</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Bioskop</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Waktu</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Harga</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Memuat...
                </td>
              </tr>
            ) : schedules.map((schedule) => (
              <tr key={schedule.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                <td className="px-6 py-4 text-white text-sm">
                  {schedule.movie?.title}
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  <p>{schedule.studio?.cinema?.name}</p>
                  <p className="text-gray-500 text-xs">{schedule.studio?.name}</p>
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {formatDate(schedule.showTime)}
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {formatCurrency(Number(schedule.basePrice))}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    schedule.isSoldOut
                      ? 'bg-red-900/50 text-red-400'
                      : 'bg-green-900/50 text-green-400'
                  }`}>
                    {schedule.isSoldOut ? 'Habis' : 'Tersedia'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}