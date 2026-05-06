'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/admin';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, QrCode } from 'lucide-react';

export default function AdminBookingsPage() {
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [ticketCode, setTicketCode] = useState('');
  const [validateResult, setValidateResult] = useState<{
    valid: boolean;
    message: string;
    data?: Record<string, unknown>;
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-bookings', { status, page }],
    queryFn: () => adminApi.getAllBookings({
      status: status || undefined,
      page,
      limit: 10,
    }),
  });

  const bookings = Array.isArray(data)
    ? data
    : (data as { data?: unknown[] })?.data ?? [];

  const meta = Array.isArray(data)
    ? null
    : (data as { meta?: { totalPages: number; total: number } })?.meta;

  const handleValidate = async () => {
    if (!ticketCode.trim()) return;
    setIsValidating(true);
    try {
      const result = await adminApi.validateTicket(ticketCode.trim());
      setValidateResult(result);
    } catch {
      setValidateResult({ valid: false, message: 'Gagal memvalidasi tiket' });
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Manajemen Booking</h1>

      {/* QR Validation */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 mb-6">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <QrCode className="w-5 h-5 text-red-400" />
          Validasi Tiket
        </h2>
        <div className="flex gap-3">
          <input
            className="input flex-1"
            placeholder="Masukkan kode tiket (TKT-XXXXXXXXXX)"
            value={ticketCode}
            onChange={(e) => {
              setTicketCode(e.target.value);
              setValidateResult(null);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleValidate()}
          />
          <button
            onClick={handleValidate}
            disabled={isValidating}
            className="btn-primary px-6"
          >
            {isValidating ? 'Memeriksa...' : 'Validasi'}
          </button>
        </div>

        {/* Validation Result */}
        {validateResult && (
          <div className={`mt-4 p-4 rounded-lg border ${
            validateResult.valid
              ? 'bg-green-900/30 border-green-700'
              : 'bg-red-900/30 border-red-700'
          }`}>
            <p className={`font-semibold mb-2 ${
              validateResult.valid ? 'text-green-400' : 'text-red-400'
            }`}>
              {validateResult.message}
            </p>
            {validateResult.valid && validateResult.data && (
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-300">
                {Object.entries(validateResult.data).map(([key, value]) => (
                  key !== 'showTime' ? (
                    <div key={key}>
                      <span className="text-gray-500 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>{' '}
                      {String(value)}
                    </div>
                  ) : (
                    <div key={key} className="col-span-2">
                      <span className="text-gray-500">Waktu Tayang:</span>{' '}
                      {formatDate(String(value))}
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-3 mb-4">
        <select
          className="input w-auto"
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
        >
          <option value="">Semua Status</option>
          <option value="PENDING">Pending</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-800 text-left">
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Kode</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Pengguna</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Film</th>
              <th className="px-6 py-4 text-gray-400 text-sm font-medium">Total</th>
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
            ) : (bookings as Array<{
              id: string;
              bookingCode: string;
              status: string;
              totalAmount: string;
              user?: { name: string; email: string };
              schedule?: { movie?: { title: string } };
            }>).map((booking) => (
              <tr key={booking.id} className="border-b border-gray-800 last:border-0 hover:bg-gray-800/50">
                <td className="px-6 py-4 font-mono text-sm text-gray-300">
                  {booking.bookingCode}
                </td>
                <td className="px-6 py-4">
                  <p className="text-white text-sm">{booking.user?.name}</p>
                  <p className="text-gray-400 text-xs">{booking.user?.email}</p>
                </td>
                <td className="px-6 py-4 text-gray-300 text-sm">
                  {booking.schedule?.movie?.title}
                </td>
                <td className="px-6 py-4 text-white text-sm font-medium">
                  {formatCurrency(Number(booking.totalAmount))}
                </td>
                <td className="px-6 py-4">
                  <span className={`text-xs px-2 py-1 rounded ${
                    booking.status === 'CONFIRMED' ? 'bg-green-900/50 text-green-400' :
                    booking.status === 'PENDING' ? 'bg-yellow-900/50 text-yellow-400' :
                    'bg-gray-800 text-gray-400'
                  }`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex justify-between items-center px-6 py-4 border-t border-gray-800">
            <p className="text-gray-400 text-sm">Total: {meta.total} booking</p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-30"
              >
                ←
              </button>
              <span className="text-gray-400 text-sm px-2 py-1">
                {page} / {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === meta.totalPages}
                className="btn-secondary px-3 py-1 text-sm disabled:opacity-30"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}