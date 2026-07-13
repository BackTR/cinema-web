// src/components/ui/NotificationBell.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/stores/notification.store';
import { notificationsApi } from '@/lib/api/notifications';
import { Avatar } from './Avatar';
import { showToast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, Check, CheckCheck, Trash2,
  X, ExternalLink, Ticket, CreditCard,
  Clock, Star, AlertCircle, Info,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { Notification } from '@/types';

const NOTIF_ICONS: Record<string, { icon: React.ElementType; color: string }> = {
  BOOKING_CONFIRMED: { icon: Ticket, color: 'text-green-400' },
  BOOKING_EXPIRED: { icon: Clock, color: 'text-gray-400' },
  BOOKING_CANCELLED: { icon: X, color: 'text-red-400' },
  PAYMENT_SUCCESS: { icon: CreditCard, color: 'text-green-400' },
  PAYMENT_FAILED: { icon: AlertCircle, color: 'text-red-400' },
  REMINDER_1H: { icon: Clock, color: 'text-yellow-400' },
  REVIEW_REMINDER: { icon: Star, color: 'text-yellow-400' },
  SYSTEM: { icon: Info, color: 'text-blue-400' },
};

function getNotifLink(notif: Notification): string | null {
  const data = notif.data ?? {};
  if (data.bookingCode) return `/bookings/${data.bookingCode}`;
  if (data.movieId) return `/movies/${data.movieId}`;
  return null;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  const unreadCount = useNotificationStore((s) => s.unreadCount);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const markRead = useNotificationStore((s) => s.markRead);
  const deleteOne = useNotificationStore((s) => s.deleteOne);
  const clearAll = useNotificationStore((s) => s.clearAll);

const { data, isLoading, refetch } = useQuery({
  queryKey: ['notifications'],
  queryFn: () => notificationsApi.getAll(1, 20),
  enabled: true,        // ← selalu load, bukan hanya saat open
  staleTime: 30 * 1000, // 30 detik cache
});

  const notifications = data?.data ?? [];

useEffect(() => {
  if (data?.unreadCount !== undefined) {
    useNotificationStore.getState().setUnreadCount(data.unreadCount);
    useNotificationStore.getState().setNotifications(data.data ?? []);
  }
}, [data]);


  const handleMarkAllRead = async () => {
    await markAllRead();
    refetch();
  };

  const handleClearAll = async () => {
    if (!confirm('Hapus semua notifikasi?')) return;
    await clearAll();
    refetch();
  };

  const handleNotifClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markRead(notif.id);
      refetch();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="relative p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />

        {/* Unread badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-600 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 md:w-96 bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-gray-400" />
                <h3 className="text-white font-semibold text-sm">Notifikasi</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-600 text-white text-xs px-1.5 py-0.5 rounded-full font-medium">
                    {unreadCount} baru
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                    title="Tandai semua dibaca"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-gray-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                    title="Hapus semua"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="space-y-1 p-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 p-3 animate-pulse">
                      <div className="w-9 h-9 bg-gray-800 rounded-full flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-800 rounded w-3/4" />
                        <div className="h-3 bg-gray-800 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-10">
                  <Bell className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Belum ada notifikasi</p>
                </div>
              ) : (
                <div>
                  {notifications.map((notif) => {
                    const config = NOTIF_ICONS[notif.type] ?? NOTIF_ICONS.SYSTEM;
                    const Icon = config.icon;
                    const link = getNotifLink(notif);

                    const content = (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`flex gap-3 p-3 hover:bg-gray-800/50 transition-colors relative group ${
                          !notif.isRead ? 'bg-gray-800/30' : ''
                        }`}
                        onClick={() => handleNotifClick(notif)}
                      >
                        {/* Icon */}
                        <div className={`w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`w-4 h-4 ${config.color}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium leading-tight ${
                            notif.isRead ? 'text-gray-300' : 'text-white'
                          }`}>
                            {notif.title}
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5 leading-relaxed line-clamp-2">
                            {notif.message}
                          </p>
                          <p className="text-gray-600 text-xs mt-1">
                            {formatDistanceToNow(new Date(notif.createdAt), {
                              addSuffix: true,
                              locale: id,
                            })}
                          </p>
                        </div>

                        {/* Unread dot */}
                        {!notif.isRead && (
                          <div className="w-2 h-2 bg-red-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}

                        {/* Delete button on hover */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteOne(notif.id).then(() => refetch());
                          }}
                          className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all p-1"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </motion.div>
                    );

                    return link ? (
                      <Link key={notif.id} href={link} onClick={() => setIsOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      <div key={notif.id}>{content}</div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-800 px-4 py-2.5 text-center">
                <p className="text-gray-500 text-xs">
                  {data?.meta.total ?? 0} notifikasi total
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}