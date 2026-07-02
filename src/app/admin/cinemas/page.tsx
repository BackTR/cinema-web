'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Plus, X, Building, ChevronDown, ChevronUp } from 'lucide-react';

interface Studio {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  _count?: { seats: number };
}

interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  isActive: boolean;
  _count?: { studios: number };
  studios?: Studio[];
}

export default function AdminCinemasPage() {
  const queryClient = useQueryClient();

  // Cinema form
  const [showCinemaForm, setShowCinemaForm] = useState(false);
  const [cinemaForm, setCinemaForm] = useState({
    name: '', address: '', city: '', phone: '',
  });

  // Studio form
  const [showStudioForm, setShowStudioForm] = useState<string | null>(null); // cinemaId
  const [studioForm, setStudioForm] = useState({
    name: '', type: 'REGULAR',
  });

  // Seat form
  const [showSeatForm, setShowSeatForm] = useState<string | null>(null); // studioId
  const [seatForm, setSeatForm] = useState({
    rows: 'A,B,C,D,E,F',
    seatsPerRow: 10,
    vipRows: 'E,F',
  });

  // Expanded cinema (show studios)
  const [expandedCinema, setExpandedCinema] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-cinemas'],
    queryFn: adminApi.getCinemas,
  });

  const cinemas: Cinema[] = Array.isArray(data) ? data : [];

  // Studios query per cinema
  const { data: studiosData } = useQuery({
    queryKey: ['admin-studios', expandedCinema],
    queryFn: () => adminApi.getStudios(expandedCinema!),
    enabled: !!expandedCinema,
  });

  const studios: Studio[] = Array.isArray(studiosData) ? studiosData : [];

  // Mutations
  const createCinemaMutation = useMutation({
    mutationFn: adminApi.createCinema,
    onSuccess: () => {
      toast.success('Bioskop berhasil ditambahkan!');
      queryClient.invalidateQueries({ queryKey: ['admin-cinemas'] });
      setShowCinemaForm(false);
      setCinemaForm({ name: '', address: '', city: '', phone: '' });
    },
    onError: () => toast.error('Gagal menambahkan bioskop'),
  });

  const createStudioMutation = useMutation({
    mutationFn: (cinemaId: string) =>
      adminApi.createStudio({ cinemaId, ...studioForm }),
    onSuccess: () => {
      toast.success('Studio berhasil ditambahkan!');
      queryClient.invalidateQueries({ queryKey: ['admin-studios', expandedCinema] });
      setShowStudioForm(null);
      setStudioForm({ name: '', type: 'REGULAR' });
    },
    onError: () => toast.error('Gagal menambahkan studio'),
  });

  const createSeatsMutation = useMutation({
    mutationFn: (studioId: string) =>
      adminApi.createSeats({
        studioId,
        rows: seatForm.rows.split(',').map((r) => r.trim()).filter(Boolean),
        seatsPerRow: Number(seatForm.seatsPerRow),
        vipRows: seatForm.vipRows
          ? seatForm.vipRows.split(',').map((r) => r.trim()).filter(Boolean)
          : [],
      }),
    onSuccess: (result: { message: string; totalSeats: number }) => {
      toast.success(result.message);
      queryClient.invalidateQueries({ queryKey: ['admin-studios', expandedCinema] });
      setShowSeatForm(null);
      setSeatForm({ rows: 'A,B,C,D,E,F', seatsPerRow: 10, vipRows: 'E,F' });
    },
    onError: () => toast.error('Gagal membuat kursi'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manajemen Bioskop</h1>
        <button
          onClick={() => setShowCinemaForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Bioskop
        </button>
      </div>

      {/* Cinema Form Modal */}
      {showCinemaForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Tambah Bioskop</h2>
              <button onClick={() => setShowCinemaForm(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); createCinemaMutation.mutate(cinemaForm); }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="label">Nama Bioskop</label>
                <input className="input" value={cinemaForm.name}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, name: e.target.value })}
                  required placeholder="CGV Grand Indonesia" />
              </div>
              <div>
                <label className="label">Alamat</label>
                <input className="input" value={cinemaForm.address}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, address: e.target.value })}
                  required placeholder="Jl. MH Thamrin No.1" />
              </div>
              <div>
                <label className="label">Kota</label>
                <input className="input" value={cinemaForm.city}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, city: e.target.value })}
                  required placeholder="Jakarta" />
              </div>
              <div>
                <label className="label">Telepon <span className="text-gray-500 font-normal">(opsional)</span></label>
                <input className="input" value={cinemaForm.phone}
                  onChange={(e) => setCinemaForm({ ...cinemaForm, phone: e.target.value })}
                  placeholder="021-12345678" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createCinemaMutation.isPending} className="btn-primary flex-1">
                  {createCinemaMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowCinemaForm(false)} className="btn-secondary flex-1">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Studio Form Modal */}
      {showStudioForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Tambah Studio</h2>
              <button onClick={() => setShowStudioForm(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); createStudioMutation.mutate(showStudioForm); }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="label">Nama Studio</label>
                <input className="input" value={studioForm.name}
                  onChange={(e) => setStudioForm({ ...studioForm, name: e.target.value })}
                  required placeholder="Studio 1" />
              </div>
              <div>
                <label className="label">Tipe Studio</label>
                <select className="input" value={studioForm.type}
                  onChange={(e) => setStudioForm({ ...studioForm, type: e.target.value })}>
                  <option value="REGULAR">Regular</option>
                  <option value="PREMIUM">Premium</option>
                  <option value="IMAX">IMAX</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createStudioMutation.isPending} className="btn-primary flex-1">
                  {createStudioMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowStudioForm(null)} className="btn-secondary flex-1">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Seat Form Modal */}
      {showSeatForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Generate Kursi</h2>
              <button onClick={() => setShowSeatForm(null)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); createSeatsMutation.mutate(showSeatForm); }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="label">Baris (pisah koma)</label>
                <input className="input" value={seatForm.rows}
                  onChange={(e) => setSeatForm({ ...seatForm, rows: e.target.value })}
                  required placeholder="A,B,C,D,E,F" />
                <p className="text-gray-500 text-xs mt-1">
                  Contoh: A,B,C,D,E,F → 6 baris
                </p>
              </div>
              <div>
                <label className="label">Kursi per Baris</label>
                <input type="number" className="input" value={seatForm.seatsPerRow}
                  onChange={(e) => setSeatForm({ ...seatForm, seatsPerRow: Number(e.target.value) })}
                  required min={1} max={30} />
              </div>
              <div>
                <label className="label">
                  Baris VIP{' '}
                  <span className="text-gray-500 font-normal">(opsional, pisah koma)</span>
                </label>
                <input className="input" value={seatForm.vipRows}
                  onChange={(e) => setSeatForm({ ...seatForm, vipRows: e.target.value })}
                  placeholder="E,F" />
                <p className="text-gray-500 text-xs mt-1">
                  Baris yang tidak disebutkan akan jadi Regular
                </p>
              </div>

              {/* Preview */}
              <div className="bg-gray-800 rounded-xl p-3 text-xs text-gray-400">
                <p className="font-medium text-gray-300 mb-1">Preview:</p>
                <p>
                  {seatForm.rows.split(',').filter(Boolean).length} baris ×{' '}
                  {seatForm.seatsPerRow} kursi ={' '}
                  <span className="text-white font-bold">
                    {seatForm.rows.split(',').filter(Boolean).length * Number(seatForm.seatsPerRow)} kursi total
                  </span>
                </p>
                {seatForm.vipRows && (
                  <p className="mt-1">
                    VIP: baris {seatForm.vipRows} •{' '}
                    Regular: baris {seatForm.rows.split(',')
                      .filter((r) => !seatForm.vipRows.split(',').includes(r.trim()))
                      .join(',')}
                  </p>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={createSeatsMutation.isPending} className="btn-primary flex-1">
                  {createSeatsMutation.isPending ? 'Membuat...' : 'Generate Kursi'}
                </button>
                <button type="button" onClick={() => setShowSeatForm(null)} className="btn-secondary flex-1">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Cinema List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-6 animate-pulse h-24" />
          ))}
        </div>
      ) : cinemas.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          <Building className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada bioskop</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cinemas.map((cinema) => (
            <div key={cinema.id} className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">

              {/* Cinema Row */}
              <div className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Building className="w-5 h-5 text-red-400" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-semibold">{cinema.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      cinema.isActive
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                      {cinema.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm truncate">{cinema.address}, {cinema.city}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {cinema._count?.studios ?? 0} studio
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => { setShowStudioForm(cinema.id); }}
                    className="text-xs bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Studio
                  </button>
                  <button
                    onClick={() => {
                      setExpandedCinema(
                        expandedCinema === cinema.id ? null : cinema.id
                      );
                    }}
                    className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    {expandedCinema === cinema.id
                      ? <ChevronUp className="w-4 h-4" />
                      : <ChevronDown className="w-4 h-4" />
                    }
                  </button>
                </div>
              </div>

              {/* Studios List (expanded) */}
              {expandedCinema === cinema.id && (
                <div className="border-t border-gray-800 bg-gray-950/50 p-4">
                  {studios.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      Belum ada studio.{' '}
                      <button
                        onClick={() => setShowStudioForm(cinema.id)}
                        className="text-blue-400 hover:text-blue-300"
                      >
                        Tambah studio
                      </button>
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {studios.map((studio) => (
                        <div
                          key={studio.id}
                          className="flex items-center justify-between bg-gray-900 rounded-lg px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              studio.type === 'IMAX' ? 'bg-blue-400' :
                              studio.type === 'PREMIUM' ? 'bg-purple-400' :
                              'bg-gray-400'
                            }`} />
                            <div>
                              <p className="text-white text-sm font-medium">{studio.name}</p>
                              <p className="text-gray-500 text-xs">
                                {studio.type} •{' '}
                                {studio._count?.seats ?? 0} kursi
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            {(studio._count?.seats ?? 0) === 0 && (
                              <button
                                onClick={() => setShowSeatForm(studio.id)}
                                className="text-xs bg-green-600/20 hover:bg-green-600/30 border border-green-600/30 text-green-400 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                              >
                                <Plus className="w-3 h-3" />
                                Generate Kursi
                              </button>
                            )}
                            {(studio._count?.seats ?? 0) > 0 && (
                              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded">
                                ✅ {studio._count?.seats} kursi
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}