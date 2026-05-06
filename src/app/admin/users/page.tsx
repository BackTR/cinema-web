'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { formatDateShort } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', { search, page }],
    queryFn: () => adminApi.getUsers({ search, page, limit: 10 }),
  });

  const users = Array.isArray(data)
    ? data
    : (data as { data?: unknown[] })?.data ?? [];

  const meta = Array.isArray(data)
    ? null
    : (data as { meta?: { totalPages: number; total: number } })?.meta;

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleUserStatus,
    onSuccess: (updated: { isActive: boolean }) => {
      toast.success(`User ${updated.isActive ? 'diaktifkan' : 'dinonaktifkan'}`);
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
    onError: () => toast.error('Gagal mengubah status user'),
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manajemen Pengguna</h1>

      {/* Search */}
      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="input pl-10"
          placeholder="Cari nama atau email..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Pengguna</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Role</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Bergabung</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Booking</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Status</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                  Memuat...
                </td>
              </tr>
            ) : (users as Array<{
              id: string;
              name: string;
              email: string;
              role: string;
              isActive: boolean;
              createdAt: string;
              _count?: { bookings: number };
            }>).map((user) => (
              <tr key={user.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                <td className="px-6 py-4">
                  <p className="text-white text-sm font-medium">{user.name}</p>
                  <p className="text-gray-400 text-xs">{user.email}</p>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    user.role === 'ADMIN'
                      ? 'bg-purple-900/50 text-purple-400'
                      : 'bg-gray-800 text-gray-400'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {formatDateShort(user.createdAt)}
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {user._count?.bookings ?? 0} booking
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    user.isActive
                      ? 'bg-green-900/50 text-green-400'
                      : 'bg-gray-800 text-gray-500'
                  }`}>
                    {user.isActive ? 'Aktif' : 'Nonaktif'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => toggleMutation.mutate(user.id)}
                    disabled={toggleMutation.isPending}
                    className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                      user.isActive
                        ? 'border-red-700 text-red-400 hover:bg-red-900/30'
                        : 'border-green-700 text-green-400 hover:bg-green-900/30'
                    }`}
                  >
                    {user.isActive ? 'Nonaktifkan' : 'Aktifkan'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {meta && meta.totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm">Total: {meta.total} pengguna</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-30"
              >←</button>
              <span className="text-gray-400 text-sm px-2 py-1">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === meta.totalPages}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-30"
              >→</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}