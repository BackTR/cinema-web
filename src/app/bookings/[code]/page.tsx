'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api/bookings';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';
import toast from 'react-hot-toast';
import {
  CheckCircle, Clock, XCircle, AlertCircle,
  Download, CreditCard, ArrowLeft, MapPin,
  Calendar, Film, Ticket,
} from 'lucide-react';
import { api } from '@/lib/api';

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/30 border-yellow-700',
    label: 'Menunggu Pembayaran',
  },
  CONFIRMED: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-900/30 border-green-700',
    label: 'Booking Dikonfirmasi',
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-900/30 border-red-700',
    label: 'Booking Dibatalkan',
  },
  EXPIRED: {
    icon: AlertCircle,
    color: 'text-gray-400',
    bg: 'bg-gray-800 border-gray-700',
    label: 'Booking Kadaluarsa',
  },
};

export default function BookingDetailPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { data: booking, isLoading, refetch } = useQuery({
    queryKey: ['booking', code],
    queryFn: async () => {
      const result = await bookingsApi.getOne(code);
      return result;
    },
    refetchInterval: 5000, // polling tiap 5 detik untuk update status
  });

// src/app/bookings/[code]/page.tsx
const handlePayment = async () => {
  if (!booking) return;
  setIsPaying(true);
  try {
    const payment = await bookingsApi.initiatePayment(booking.bookingCode);

    // ← Fix poin 15: cek script sudah ada sebelum tambah
    const existingScript = document.getElementById('midtrans-snap');
    if (existingScript) {
      // Script sudah ada, langsung panggil snap
      // @ts-expect-error — Midtrans global
      window.snap.pay(payment.token, {
        onSuccess: () => { toast.success('Pembayaran berhasil! 🎉'); refetch(); },
        onPending: () => { toast('Menunggu konfirmasi...', { icon: '⏳' }); refetch(); },
        onError: () => toast.error('Pembayaran gagal.'),
        onClose: () => toast('Pembayaran dibatalkan.', { icon: '❌' }),
      });
      return;
    }

    const script = document.createElement('script');
    script.id = 'midtrans-snap'; // ← tambah id
    script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
    script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '');
    script.onload = () => {
      // @ts-expect-error — Midtrans global
      window.snap.pay(payment.token, {
        onSuccess: () => { toast.success('Pembayaran berhasil! 🎉'); refetch(); },
        onPending: () => { toast('Menunggu konfirmasi...', { icon: '⏳' }); refetch(); },
        onError: () => toast.error('Pembayaran gagal.'),
        onClose: () => toast('Pembayaran dibatalkan.', { icon: '❌' }),
      });
    };
    document.head.appendChild(script);
  } catch {
    toast.error('Gagal memulai pembayaran');
  } finally {
    setIsPaying(false);
  }
};

  const handleCancel = async () => {
    if (!booking) return;
    if (!confirm('Yakin ingin membatalkan booking ini?')) return;

    setIsCancelling(true);
    try {
      await bookingsApi.cancel(booking.bookingCode, 'Dibatalkan oleh pengguna');
      toast.success('Booking berhasil dibatalkan');
      refetch();
    } catch {
      toast.error('Gagal membatalkan booking');
    } finally {
      setIsCancelling(false);
    }
  };

  const handleDownloadTicket = async () => {
    if (!booking) return;
    try {
      const response = await api.get(`/bookings/${booking.bookingCode}/ticket`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `eticket-${booking.bookingCode}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('E-Ticket berhasil diunduh!');
    } catch {
      toast.error('Gagal mengunduh tiket');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 animate-pulse">
        <div className="card p-6 space-y-4">
          <div className="h-8 bg-gray-800 rounded w-1/2" />
          <div className="h-4 bg-gray-800 rounded w-1/3" />
          <div className="h-32 bg-gray-800 rounded" />
        </div>
      </div>
    );
  }

  if (!booking) return null;

  const status = STATUS_CONFIG[booking.status];
  const StatusIcon = status.icon;
  const isPending = booking.status === 'PENDING';
  const isConfirmed = booking.status === 'CONFIRMED';
  const expiresAt = new Date(booking.expiresAt);
  const now = new Date();
  const minutesLeft = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 60000));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => router.push('/bookings')}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Riwayat Booking
      </button>

      {/* Status Banner */}
      <div className={`card border p-4 mb-6 flex items-center gap-3 ${status.bg}`}>
        <StatusIcon className={`w-6 h-6 ${status.color} flex-shrink-0`} />
        <div>
          <p className={`font-semibold ${status.color}`}>{status.label}</p>
          {isPending && minutesLeft > 0 && (
            <p className="text-yellow-500 text-sm">
              Selesaikan pembayaran dalam {minutesLeft} menit
            </p>
          )}
        </div>
      </div>

      {/* Booking Info */}
      <div className="card p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-white">
            {booking.schedule?.movie?.title}
          </h1>
          <span className="text-gray-400 text-sm font-mono">{booking.bookingCode}</span>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center gap-3 text-gray-300">
            <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span>
              {booking.schedule?.studio?.cinema?.name} — {booking.schedule?.studio?.name}
            </span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span>{formatDate(booking.schedule?.showTime)}</span>
          </div>
          <div className="flex items-center gap-3 text-gray-300">
            <Ticket className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span>
              {booking.seats?.map((s) =>
                `${s.scheduleSeat?.seat?.rowLabel}${s.scheduleSeat?.seat?.seatNumber}`
              ).join(', ')}
            </span>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-4 pt-4 flex justify-between items-center">
          <span className="text-gray-400">Total Pembayaran</span>
          <span className="text-white font-bold text-xl">
            {formatCurrency(Number(booking.totalAmount))}
          </span>
        </div>
      </div>

      {/* Seats Detail */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-white mb-3 flex items-center gap-2">
          <Film className="w-4 h-4" />
          Detail Kursi
        </h2>
        <div className="space-y-2">
          {booking.seats?.map((seat) => (
            <div
              key={seat.id}
              className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
            >
              <div>
                <span className="text-white font-medium">
                  Kursi {seat.scheduleSeat?.seat?.rowLabel}{seat.scheduleSeat?.seat?.seatNumber}
                </span>
                <span className="text-gray-400 text-sm ml-2">
                  ({seat.scheduleSeat?.seat?.type})
                </span>
              </div>
              <div className="text-right">
                <p className="text-white">{formatCurrency(Number(seat.price))}</p>
                {isConfirmed && (
                  <p className="text-gray-500 text-xs font-mono">{seat.ticketCode}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Info */}
      {booking.payment && (
        <div className="card p-6 mb-4">
          <h2 className="font-semibold text-white mb-3">Info Pembayaran</h2>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className={
              booking.payment.status === 'PAID' ? 'text-green-400' :
              booking.payment.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'
            }>
              {booking.payment.status}
            </span>
          </div>
          {booking.payment.paidAt && (
            <div className="flex justify-between text-sm mt-2">
              <span className="text-gray-400">Dibayar pada</span>
              <span className="text-gray-300">{formatDate(booking.payment.paidAt)}</span>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {isPending && minutesLeft > 0 && (
          <button
            onClick={handlePayment}
            disabled={isPaying}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <CreditCard className="w-4 h-4" />
            {isPaying ? 'Memproses...' : 'Bayar Sekarang'}
          </button>
        )}

        {isConfirmed && (
          <button
            onClick={handleDownloadTicket}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4" />
            Download E-Ticket
          </button>
        )}

        {isPending && (
          <button
            onClick={handleCancel}
            disabled={isCancelling}
            className="btn-secondary w-full"
          >
            {isCancelling ? 'Membatalkan...' : 'Batalkan Booking'}
          </button>
        )}
      </div>
    </div>
  );
}