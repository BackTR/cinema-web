'use client';

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '@/lib/api/bookings';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { showToast } from '@/lib/toast';
import {
  CheckCircle, Clock, XCircle, AlertCircle,
  Download, CreditCard, ArrowLeft, MapPin,
  Calendar, Film, Ticket, ChevronDown,
} from 'lucide-react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

const STATUS_CONFIG = {
  PENDING: {
    icon: Clock,
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20 border-yellow-700/40',
    label: 'Menunggu Pembayaran',
    pulse: true,
  },
  CONFIRMED: {
    icon: CheckCircle,
    color: 'text-green-400',
    bg: 'bg-green-900/20 border-green-700/40',
    label: 'Booking Dikonfirmasi',
    pulse: false,
  },
  CANCELLED: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-900/20 border-red-700/40',
    label: 'Booking Dibatalkan',
    pulse: false,
  },
  EXPIRED: {
    icon: AlertCircle,
    color: 'text-gray-400',
    bg: 'bg-gray-800 border-gray-700',
    label: 'Booking Kadaluarsa',
    pulse: false,
  },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function BookingDetailPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showSeats, setShowSeats] = useState(false);

  const { data: booking, isLoading, refetch } = useQuery({
    queryKey: ['booking', code],
    queryFn: () => bookingsApi.getOne(code),
    refetchInterval: 5000,
  });

  const handlePayment = async () => {
    if (!booking) return;
    setIsPaying(true);
    try {
      const payment = await bookingsApi.initiatePayment(booking.bookingCode);
      const existingScript = document.getElementById('midtrans-snap');

      const paySnap = () => {
        // @ts-expect-error Midtrans global
        window.snap.pay(payment.token, {
          onSuccess: () => { showToast.success('Pembayaran berhasil! 🎉'); refetch(); },
          onPending: () => { showToast.info('Menunggu konfirmasi pembayaran...'); refetch(); },
          onError: () => showToast.error('Pembayaran gagal. Silakan coba lagi.'),
          onClose: () => showToast.warning('Pembayaran dibatalkan.'),
        });
      };

      if (existingScript) {
        paySnap();
      } else {
        const script = document.createElement('script');
        script.id = 'midtrans-snap';
        script.src = 'https://app.sandbox.midtrans.com/snap/snap.js';
        script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? '');
        script.onload = paySnap;
        document.head.appendChild(script);
      }
    } catch {
      showToast.error('Gagal memulai pembayaran');
    } finally {
      setIsPaying(false);
    }
  };

  const handleCancel = async () => {
    if (!booking || !confirm('Yakin ingin membatalkan booking ini?')) return;
    setIsCancelling(true);
    try {
      await bookingsApi.cancel(booking.bookingCode, 'Dibatalkan oleh pengguna');
      showToast.success('Booking berhasil dibatalkan');
      refetch();
    } catch {
      showToast.error('Gagal membatalkan booking');
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
      showToast.success('E-Ticket berhasil diunduh!');
    } catch {
      showToast.error('Gagal mengunduh tiket');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-6 animate-pulse">
            <div className="h-5 bg-gray-800 rounded w-1/3 mb-3" />
            <div className="h-4 bg-gray-800 rounded w-1/2 mb-2" />
            <div className="h-4 bg-gray-800 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (!booking) return null;

  const status = STATUS_CONFIG[booking.status];
  const StatusIcon = status.icon;
  const isPending = booking.status === 'PENDING';
  const isConfirmed = booking.status === 'CONFIRMED';
  const expiresAt = new Date(booking.expiresAt);
  const minutesLeft = Math.max(0, Math.floor((expiresAt.getTime() - Date.now()) / 60000));

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">

      {/* Back */}
      <motion.button
        onClick={() => router.push('/bookings')}
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Riwayat Booking
      </motion.button>

      <motion.div
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        className="space-y-4"
      >
        {/* Status Banner */}
        <motion.div variants={sectionVariants}>
          <div className={`card border p-4 flex items-center gap-3 ${status.bg}`}>
            <div className="relative">
              <StatusIcon className={`w-6 h-6 ${status.color} flex-shrink-0`} />
              {status.pulse && (
                <motion.div
                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 rounded-full bg-yellow-400/30"
                />
              )}
            </div>
            <div className="flex-1">
              <p className={`font-semibold ${status.color}`}>{status.label}</p>
              {isPending && minutesLeft > 0 && (
                <motion.p
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-yellow-500 text-sm"
                >
                  Selesaikan pembayaran dalam {minutesLeft} menit
                </motion.p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Movie + Schedule Info */}
        <motion.div variants={sectionVariants} className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-xl font-bold text-white leading-tight flex-1 mr-3">
              {booking.schedule?.movie?.title}
            </h1>
            <span className="text-gray-500 text-xs font-mono flex-shrink-0 bg-gray-800 px-2 py-1 rounded">
              {booking.bookingCode}
            </span>
          </div>

          <div className="space-y-2.5 text-sm">
            <div className="flex items-center gap-3 text-gray-300">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>
                {booking.schedule?.studio?.cinema?.name}
                <span className="text-gray-500"> — </span>
                {booking.schedule?.studio?.name}
              </span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>{formatDate(booking.schedule?.showTime)}</span>
            </div>
            <div className="flex items-center gap-3 text-gray-300">
              <Ticket className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span>
                {booking.seats?.length} kursi —{' '}
                {booking.seats
                  ?.map((s) => `${s.scheduleSeat?.seat?.rowLabel}${s.scheduleSeat?.seat?.seatNumber}`)
                  .join(', ')}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-4 pt-4 flex justify-between items-center">
            <span className="text-gray-400 text-sm">Total Pembayaran</span>
            <motion.span
              className="text-white font-bold text-xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
            >
              {formatCurrency(Number(booking.totalAmount))}
            </motion.span>
          </div>
        </motion.div>

        {/* Seats Detail — collapsible */}
        <motion.div variants={sectionVariants} className="card overflow-hidden">
          <button
            onClick={() => setShowSeats(!showSeats)}
            className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-800/50 transition-colors"
          >
            <span className="font-semibold text-white flex items-center gap-2">
              <Film className="w-4 h-4 text-gray-400" />
              Detail Kursi ({booking.seats?.length})
            </span>
            <motion.div animate={{ rotate: showSeats ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </motion.div>
          </button>

          <AnimatePresence>
            {showSeats && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="px-5 pb-5 space-y-2 border-t border-gray-800 pt-3">
                  {booking.seats?.map((seat, i) => (
                    <motion.div
                      key={seat.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                          seat.scheduleSeat?.seat?.type === 'VIP'
                            ? 'bg-purple-900/50 text-purple-300'
                            : 'bg-gray-800 text-gray-400'
                        }`}>
                          {seat.scheduleSeat?.seat?.type}
                        </span>
                        <span className="text-white font-medium">
                          {seat.scheduleSeat?.seat?.rowLabel}{seat.scheduleSeat?.seat?.seatNumber}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-300 text-sm">{formatCurrency(Number(seat.price))}</p>
                        {isConfirmed && (
                          <p className="text-gray-600 text-xs font-mono">{seat.ticketCode}</p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Payment Info */}
        {booking.payment && (
          <motion.div variants={sectionVariants} className="card p-5">
            <h2 className="font-semibold text-white mb-3 text-sm">Info Pembayaran</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Status</span>
                <span className={
                  booking.payment.status === 'PAID' ? 'text-green-400 font-medium' :
                  booking.payment.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'
                }>
                  {booking.payment.status === 'PAID' ? '✅ Lunas' :
                   booking.payment.status === 'FAILED' ? '❌ Gagal' : '⏳ Menunggu'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Metode</span>
                <span className="text-gray-300">{booking.payment.gateway}</span>
              </div>
              {booking.payment.paidAt && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Dibayar pada</span>
                  <span className="text-gray-300">{formatDate(booking.payment.paidAt)}</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div variants={sectionVariants} className="space-y-3">
          {isPending && minutesLeft > 0 && (
            <motion.button
              onClick={handlePayment}
              disabled={isPaying}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2 relative overflow-hidden"
            >
              {/* Pulse background animation */}
              <motion.div
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
              <CreditCard className="w-4 h-4 relative z-10" />
              <span className="relative z-10">
                {isPaying ? 'Memproses...' : 'Bayar Sekarang'}
              </span>
            </motion.button>
          )}

          {isConfirmed && (
            <motion.button
              onClick={handleDownloadTicket}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download E-Ticket
            </motion.button>
          )}

          {isPending && (
            <motion.button
              onClick={handleCancel}
              disabled={isCancelling}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-secondary w-full"
            >
              {isCancelling ? 'Membatalkan...' : 'Batalkan Booking'}
            </motion.button>
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}