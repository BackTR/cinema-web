'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { adminApi } from '@/lib/api/admin';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Schedule, Movie } from '@/types';
import toast from 'react-hot-toast';
import { Plus, X, ChevronRight } from 'lucide-react';

export default function AdminSchedulesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1=film, 2=bioskop+studio, 3=waktu+harga
  const [form, setForm] = useState({
    movieId: '',
    cinemaId: '',
    studioId: '',
    showTime: '',
    basePrice: 50000,
    regularPrice: 0,
    vipPrice: 0,
    useCustomPricing: false,
  });

  const { data: moviesRaw } = useQuery({
    queryKey: ['admin-movies'],
    queryFn: () => moviesApi.getAll({ limit: 50 }),
  });

  const { data: cinemasRaw } = useQuery({
    queryKey: ['admin-cinemas'],
    queryFn: adminApi.getCinemas,
  });

  // Fetch studios hanya saat cinema dipilih
  const { data: studiosRaw } = useQuery({
    queryKey: ['admin-studios', form.cinemaId],
    queryFn: () => adminApi.getStudios(form.cinemaId),
    enabled: !!form.cinemaId,
  });

  const { data: schedulesRaw, isLoading } = useQuery({
    queryKey: ['admin-schedules'],
    queryFn: async () => {
      const { data } = await import('@/lib/api').then((m) =>
        m.api.get('/schedules', { params: { limit: 50 } })
      );
      return data.data;
    },
  });

  const movies: Movie[] = Array.isArray(moviesRaw)
    ? moviesRaw
    : (moviesRaw as { data?: Movie[] })?.data ?? [];

  const schedules: Schedule[] = Array.isArray(schedulesRaw)
    ? schedulesRaw
    : (schedulesRaw as { data?: Schedule[] })?.data ?? [];

  const cinemas = Array.isArray(cinemasRaw) ? cinemasRaw : [];
  const studios = Array.isArray(studiosRaw) ? studiosRaw : [];

  const selectedMovie = movies.find((m) => m.id === form.movieId);
  const selectedCinema = (cinemas as Array<{ id: string; name: string }>)
    .find((c) => c.id === form.cinemaId);
  const selectedStudio = (studios as Array<{ id: string; name: string; type: string }>)
    .find((s) => s.id === form.studioId);

  const createMutation = useMutation({
    mutationFn: async () => {
      const { data: apiModule } = await import('@/lib/api').then((m) =>
        m.api.post('/schedules', {
          movieId: form.movieId,
          studioId: form.studioId,
          showTime: new Date(form.showTime).toISOString(),
          basePrice: form.basePrice,
        })
      );

      const scheduleId = apiModule.data.id;

      // Buat pricing rules jika custom pricing diaktifkan
      if (form.useCustomPricing && scheduleId) {
        const { api } = await import('@/lib/api');
        // Regular price rule
        if (form.regularPrice > 0) {
          await api.post(`/schedules/${scheduleId}/pricing`, {
            seatType: 'REGULAR',
            pricingType: 'BASE',
            price: form.regularPrice,
          });
        }
        // VIP price rule
        if (form.vipPrice > 0) {
          await api.post(`/schedules/${scheduleId}/pricing`, {
            seatType: 'VIP',
            pricingType: 'BASE',
            price: form.vipPrice,
          });
        }
      }

      return apiModule.data;
    },
    onSuccess: () => {
      toast.success('Jadwal berhasil ditambahkan!');
      queryClient.invalidateQueries({ queryKey: ['admin-schedules'] });
      handleCloseForm();
    },
    onError: (error: unknown) => {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      toast.error(msg ?? 'Gagal menambahkan jadwal');
    },
  });

  const handleCloseForm = () => {
    setShowForm(false);
    setStep(1);
    setForm({
      movieId: '', cinemaId: '', studioId: '',
      showTime: '', basePrice: 50000,
      regularPrice: 0, vipPrice: 0,
      useCustomPricing: false,
    });
  };

  const handleNextStep = () => {
    if (step === 1 && !form.movieId) {
      toast.error('Pilih film terlebih dahulu');
      return;
    }
    if (step === 2 && (!form.cinemaId || !form.studioId)) {
      toast.error('Pilih bioskop dan studio');
      return;
    }
    setStep((prev) => (prev + 1) as 1 | 2 | 3);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.showTime) { toast.error('Pilih waktu tayang'); return; }
    createMutation.mutate();
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
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-lg">

            {/* Header + Step indicator */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Tambah Jadwal</h2>
                <div className="flex items-center gap-2 mt-2">
                  {[
                    { n: 1, label: 'Film' },
                    { n: 2, label: 'Lokasi' },
                    { n: 3, label: 'Waktu & Harga' },
                  ].map((s, i) => (
                    <div key={s.n} className="flex items-center gap-2">
                      <div className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
                        step === s.n
                          ? 'bg-red-600 text-white'
                          : step > s.n
                          ? 'bg-green-600/30 text-green-400 border border-green-600/30'
                          : 'bg-gray-800 text-gray-500'
                      }`}>
                        <span>{step > s.n ? '✓' : s.n}</span>
                        <span>{s.label}</span>
                      </div>
                      {i < 2 && <ChevronRight className="w-3 h-3 text-gray-600" />}
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleCloseForm}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>

            <div className="p-6">

              {/* Step 1 — Pilih Film */}
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">Pilih film yang akan ditayangkan</p>
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {movies.map((movie) => (
                      <button
                        key={movie.id}
                        type="button"
                        onClick={() => setForm({ ...form, movieId: movie.id })}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                          form.movieId === movie.id
                            ? 'border-red-500 bg-red-600/10'
                            : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-medium text-sm truncate">
                            {movie.title}
                          </p>
                          <p className="text-gray-400 text-xs">
                            {movie.durationMinutes} menit • {movie.genre} • {movie.rating}
                          </p>
                        </div>
                        {form.movieId === movie.id && (
                          <span className="text-red-400 text-xs font-bold flex-shrink-0">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={!form.movieId}
                    className="btn-primary w-full disabled:opacity-50"
                  >
                    Selanjutnya →
                  </button>
                </div>
              )}

              {/* Step 2 — Pilih Bioskop & Studio */}
              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-gray-400 text-sm">
                    Film: <span className="text-white font-medium">{selectedMovie?.title}</span>
                  </p>

                  {/* Pilih Bioskop */}
                  <div>
                    <label className="label">Pilih Bioskop</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {(cinemas as Array<{ id: string; name: string; city: string }>).map((cinema) => (
                        <button
                          key={cinema.id}
                          type="button"
                          onClick={() => setForm({ ...form, cinemaId: cinema.id, studioId: '' })}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                            form.cinemaId === cinema.id
                              ? 'border-red-500 bg-red-600/10'
                              : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                          }`}
                        >
                          <div className="text-left">
                            <p className="text-white text-sm font-medium">{cinema.name}</p>
                            <p className="text-gray-400 text-xs">{cinema.city}</p>
                          </div>
                          {form.cinemaId === cinema.id && (
                            <span className="text-red-400 text-xs font-bold">✓</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pilih Studio — muncul setelah bioskop dipilih */}
                  {form.cinemaId && (
                    <div>
                      <label className="label">Pilih Studio</label>
                      {studios.length === 0 ? (
                        <p className="text-gray-500 text-sm bg-gray-800 rounded-xl p-3">
                          Bioskop ini belum punya studio. Tambahkan studio terlebih dahulu.
                        </p>
                      ) : (
                        <div className="space-y-2">
                          {(studios as Array<{ id: string; name: string; type: string; _count?: { seats: number } }>).map((studio) => (
                            <button
                              key={studio.id}
                              type="button"
                              onClick={() => setForm({ ...form, studioId: studio.id })}
                              className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${
                                form.studioId === studio.id
                                  ? 'border-red-500 bg-red-600/10'
                                  : 'border-gray-700 hover:border-gray-500 bg-gray-800/50'
                              }`}
                            >
                              <div className="text-left">
                                <p className="text-white text-sm font-medium">{studio.name}</p>
                                <p className="text-gray-400 text-xs">
                                  {studio.type} • {studio._count?.seats ?? 0} kursi
                                </p>
                              </div>
                              {form.studioId === studio.id && (
                                <span className="text-red-400 text-xs font-bold">✓</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="btn-secondary flex-1"
                    >
                      ← Kembali
                    </button>
                    <button
                      type="button"
                      onClick={handleNextStep}
                      disabled={!form.cinemaId || !form.studioId}
                      className="btn-primary flex-1 disabled:opacity-50"
                    >
                      Selanjutnya →
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3 — Waktu & Harga */}
              {step === 3 && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="bg-gray-800/50 rounded-xl p-3 text-sm">
                    <p className="text-gray-400">
                      Film: <span className="text-white font-medium">{selectedMovie?.title}</span>
                    </p>
                    <p className="text-gray-400 mt-1">
                      Lokasi: <span className="text-white font-medium">
                        {selectedCinema?.name} — {selectedStudio?.name}
                      </span>
                    </p>
                  </div>

                  {/* Waktu Tayang */}
                  <div>
                    <label className="label">Waktu Tayang</label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={form.showTime}
                      onChange={(e) => setForm({ ...form, showTime: e.target.value })}
                      min={new Date(Date.now()+6*60*60*1000).toISOString().slice(0, 16)}
                      required
                    />
                    {form.showTime && (
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(form.showTime).toLocaleString('id-ID', {
                          weekday: 'long', year: 'numeric', month: 'long',
                          day: 'numeric', hour: '2-digit', minute: '2-digit',
                        })}
                      </p>
                    )}
                  </div>

                  {/* Harga Dasar */}
                  <div>
                    <label className="label">Harga Dasar (Rp)</label>
                    <input
                      type="number"
                      className="input"
                      value={form.basePrice}
                      onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })}
                      min={1000}
                      step={1000}
                      required
                    />
                    <p className="text-gray-500 text-xs mt-1">
                      Digunakan sebagai fallback jika tidak ada pricing khusus
                    </p>
                  </div>

                  {/* Custom Pricing Toggle */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <div
                        onClick={() => setForm({ ...form, useCustomPricing: !form.useCustomPricing })}
                        className={`relative w-10 h-5 rounded-full transition-colors ${
                          form.useCustomPricing ? 'bg-red-600' : 'bg-gray-700'
                        }`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                          form.useCustomPricing ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </div>
                      <span className="text-gray-300 text-sm font-medium">
                        Atur harga berbeda untuk Regular & VIP
                      </span>
                    </label>
                  </div>

                  {/* Custom Pricing Fields */}
                  {form.useCustomPricing && (
                    <div className="grid grid-cols-2 gap-3 bg-gray-800/50 rounded-xl p-4">
                      <div>
                        <label className="label text-xs">Harga Regular (Rp)</label>
                        <input
                          type="number"
                          className="input text-sm py-2"
                          value={form.regularPrice || ''}
                          onChange={(e) => setForm({ ...form, regularPrice: Number(e.target.value) })}
                          min={1000}
                          step={1000}
                          placeholder={String(form.basePrice)}
                        />
                      </div>
                      <div>
                        <label className="label text-xs">Harga VIP (Rp)</label>
                        <input
                          type="number"
                          className="input text-sm py-2"
                          value={form.vipPrice || ''}
                          onChange={(e) => setForm({ ...form, vipPrice: Number(e.target.value) })}
                          min={1000}
                          step={1000}
                          placeholder={String(form.basePrice * 1.5)}
                        />
                      </div>
                      <div className="col-span-2">
                        <p className="text-gray-500 text-xs">
                          Kosongkan jika ingin pakai harga dasar untuk tipe tersebut
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Price Preview */}
                  <div className="bg-gray-800/30 rounded-xl p-3 text-xs text-gray-400 space-y-1">
                    <p className="font-medium text-gray-300 mb-2">Preview Harga:</p>
                    <div className="flex justify-between">
                      <span>Regular</span>
                      <span className="text-white font-medium">
                        {formatCurrency(
                          form.useCustomPricing && form.regularPrice > 0
                            ? form.regularPrice
                            : form.basePrice
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>VIP</span>
                      <span className="text-white font-medium">
                        {formatCurrency(
                          form.useCustomPricing && form.vipPrice > 0
                            ? form.vipPrice
                            : form.basePrice
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="btn-secondary flex-1"
                    >
                      ← Kembali
                    </button>
                    <button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="btn-primary flex-1"
                    >
                      {createMutation.isPending ? 'Menyimpan...' : 'Simpan Jadwal'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Schedule Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Film</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Bioskop & Studio</th>
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
            ) : schedules.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-400">
                  Belum ada jadwal
                </td>
              </tr>
            ) : schedules.map((schedule) => (
              <tr
                key={schedule.id}
                className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50"
              >
                <td className="px-6 py-4 text-white text-sm font-medium">
                  {schedule.movie?.title}
                  <p className="text-gray-500 text-xs font-normal mt-0.5">
                    {schedule.movie?.durationMinutes} menit
                  </p>
                </td>
                <td className="px-6 py-4">
                  <p className="text-white text-sm">{schedule.studio?.cinema?.name}</p>
                  <p className="text-gray-500 text-xs">{schedule.studio?.name} • {schedule.studio?.type}</p>
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