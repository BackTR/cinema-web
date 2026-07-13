'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { adminApi } from '@/lib/api/admin';
import { Movie } from '@/types';
import { formatDateShort } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, X } from 'lucide-react';
import { profileApi } from '@/lib/api/profile';
import { useState as useStateUpload } from 'react';
import { Upload, Loader2 } from 'lucide-react';

export default function AdminMoviesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [isUploadingPoster, setIsUploadingPoster] = useState(false);
  const [editMovie, setEditMovie] = useState<Movie | null>(null);
  const [form, setForm] = useState({
    title: '',
    synopsis: '',
    durationMinutes: 90,
    genre: '',
    rating: 'SU',
    releaseDate: '',
    director: '',
    cast: '',
    posterUrl: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: () => moviesApi.getAll({ limit: 50 }),
  });

  const movies: Movie[] = Array.isArray(data)
    ? data
    : (data as { data?: Movie[] })?.data ?? [];

  const createMutation = useMutation({
    mutationFn: adminApi.createMovie,
    onSuccess: () => {
      toast.success('Film berhasil ditambahkan!');
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
      setShowForm(false);
      resetForm();
    },
    onError: () => toast.error('Gagal menambahkan film'),
  });

  const deleteMutation = useMutation({
    mutationFn: adminApi.deleteMovie,
    onSuccess: () => {
      toast.success('Film berhasil dihapus');
      queryClient.invalidateQueries({ queryKey: ['admin-movies'] });
    },
    onError: () => toast.error('Gagal menghapus film'),
  });

  const resetForm = () => {
    setForm({
      title: '', synopsis: '', durationMinutes: 90,
      genre: '', rating: 'SU', releaseDate: '',
      director: '', cast: '', posterUrl: '',
    });
    setEditMovie(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      ...form,
      durationMinutes: Number(form.durationMinutes),
    });
  };

  const handleDelete = (movie: Movie) => {
    if (!confirm(`Hapus film "${movie.title}"?`)) return;
    deleteMutation.mutate(movie.id);
  };

  const handlePosterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPoster(true);
    try {
      const { url } = await profileApi.uploadPoster(file);
      setForm({ ...form, posterUrl: url });
      toast.success('Poster berhasil diupload!');
    } catch {
      toast.error('Gagal mengupload poster');
    } finally {
      setIsUploadingPoster(false);
    }
  };


  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manajemen Film</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Film
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Tambah Film Baru</h2>
              <button onClick={() => { setShowForm(false); resetForm(); }}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="label">Judul Film</label>
                  <input
                    className="input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    required
                  />
                </div>
                <div className="col-span-2">
                  <label className="label">Sinopsis</label>
                  <textarea
                    className="input min-h-24 resize-none"
                    value={form.synopsis}
                    onChange={(e) => setForm({ ...form, synopsis: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Durasi (menit)</label>
                  <input
                    type="number"
                    className="input"
                    value={form.durationMinutes}
                    onChange={(e) => setForm({ ...form, durationMinutes: Number(e.target.value) })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Genre</label>
                  <input
                    className="input"
                    value={form.genre}
                    onChange={(e) => setForm({ ...form, genre: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Rating</label>
                  <select
                    className="input"
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: e.target.value })}
                  >
                    {['SU', '13+', '17+', '21+'].map((r) => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Tanggal Rilis</label>
                  <input
                    type="date"
                    className="input"
                    value={form.releaseDate}
                    onChange={(e) => setForm({ ...form, releaseDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="label">Sutradara</label>
                  <input
                    className="input"
                    value={form.director}
                    onChange={(e) => setForm({ ...form, director: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">Pemain</label>
                  <input
                    className="input"
                    value={form.cast}
                    onChange={(e) => setForm({ ...form, cast: e.target.value })}
                  />
                </div>
                  <div className="col-span-2">
                    <label className="label">Poster Film</label>

                    {/* Preview */}
                    {form.posterUrl && (
                      <div className="relative w-24 h-36 mb-3 rounded-lg overflow-hidden border border-gray-700">
                        <img src={form.posterUrl} alt="Poster" className="w-full h-full object-cover" />
                      </div>
                    )}

                    {/* Upload button */}
                    <div className="flex gap-3">
                      <label className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-4 py-2.5 rounded-lg cursor-pointer transition-colors text-sm">
                        {isUploadingPoster ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4" />
                            Upload Poster
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handlePosterUpload}
                          disabled={isUploadingPoster}
                          className="hidden"
                        />
                      </label>

                      {/* atau input URL manual */}
                      <input
                        className="input flex-1 text-sm"
                        value={form.posterUrl}
                        onChange={(e) => setForm({ ...form, posterUrl: e.target.value })}
                        placeholder="atau paste URL poster..."
                      />
                    </div>
                    <p className="text-gray-600 text-xs mt-1">JPG, PNG, WebP • Maks 5MB</p>
                  </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="btn-primary flex-1"
                >
                  {createMutation.isPending ? 'Menyimpan...' : 'Simpan Film'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowForm(false); resetForm(); }}
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
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 rounded-lg p-4 animate-pulse h-16" />
          ))}
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-6 py-4 text-gray-400 text-sm font-medium">Film</th>
                <th className="px-6 py-4 text-gray-400 text-sm font-medium">Genre</th>
                <th className="px-6 py-4 text-gray-400 text-sm font-medium">Rating</th>
                <th className="px-6 py-4 text-gray-400 text-sm font-medium">Rilis</th>
                <th className="px-6 py-4 text-gray-400 text-sm font-medium">Status</th>
                <th className="px-6 py-4 text-gray-400 text-sm font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {movies.map((movie) => (
                <tr key={movie.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{movie.title}</p>
                    <p className="text-gray-400 text-xs">{movie.durationMinutes} menit</p>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">{movie.genre}</td>
                  <td className="px-6 py-4">
                    <span className="bg-red-900/50 text-red-400 text-xs px-2 py-1 rounded">
                      {movie.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300 text-sm">
                    {formatDateShort(movie.releaseDate)}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-2 py-1 rounded ${
                      movie.isActive
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                      {movie.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(movie)}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}