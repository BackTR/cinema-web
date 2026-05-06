'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import toast from 'react-hot-toast';
import { Plus, X, Building } from 'lucide-react';

export default function AdminCinemasPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: '', address: '', city: '', phone: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-cinemas'],
    queryFn: adminApi.getCinemas,
  });

  const cinemas = Array.isArray(data) ? data : [];

  const createMutation = useMutation({
    mutationFn: adminApi.createCinema,
    onSuccess: () => {
      toast.success('Bioskop berhasil ditambahkan!');
      queryClient.invalidateQueries({ queryKey: ['admin-cinemas'] });
      setShowForm(false);
      setForm({ name: '', address: '', city: '', phone: '' });
    },
    onError: () => toast.error('Gagal menambahkan bioskop'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Manajemen Bioskop</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Tambah Bioskop
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white">Tambah Bioskop</h2>
              <button onClick={() => setShowForm(false)}>
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="label">Nama Bioskop</label>
                <input className="input" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="label">Alamat</label>
                <input className="input" value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              </div>
              <div>
                <label className="label">Kota</label>
                <input className="input" value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })} required />
              </div>
              <div>
                <label className="label">Telepon</label>
                <input className="input" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1">
                  {createMutation.isPending ? 'Menyimpan...' : 'Simpan'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="btn-secondary flex-1">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-900 rounded-xl border border-gray-800 p-6 animate-pulse h-32" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(cinemas as Array<{
            id: string;
            name: string;
            address: string;
            city: string;
            phone?: string;
            isActive: boolean;
            _count?: { studios: number };
          }>).map((cinema) => (
            <div key={cinema.id} className="bg-gray-900 rounded-xl border border-gray-800 p-6">
              <div className="flex items-start gap-3">
                <Building className="w-5 h-5 text-red-400 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-white font-semibold">{cinema.name}</h3>
                  <p className="text-gray-400 text-sm mt-1">{cinema.address}</p>
                  <p className="text-gray-500 text-sm">{cinema.city}</p>
                  {cinema.phone && (
                    <p className="text-gray-500 text-sm">{cinema.phone}</p>
                  )}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="text-gray-400 text-xs">
                      {cinema._count?.studios ?? 0} studio
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      cinema.isActive
                        ? 'bg-green-900/50 text-green-400'
                        : 'bg-gray-800 text-gray-500'
                    }`}>
                      {cinema.isActive ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}