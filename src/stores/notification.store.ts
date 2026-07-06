// src/stores/notification.store.ts
import { create } from 'zustand';
import { Notification } from '@/types';
import { notificationsApi } from '@/lib/api/notifications';
import Cookies from 'js-cookie';

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  eventSource: EventSource | null;
  setNotifications: (notifs: Notification[]) => void;
  addNotification: (notif: Notification) => void;
  setUnreadCount: (count: number) => void;
  markAllRead: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  deleteOne: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  connect: () => void;
  disconnect: () => void;
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isConnected: false,
  eventSource: null,

  setNotifications: (notifs) => set({ notifications: notifs }),

  addNotification: (notif) =>
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    })),

  setUnreadCount: (count) => set({ unreadCount: count }),

  markAllRead: async () => {
    await notificationsApi.markAllAsRead();
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  markRead: async (id) => {
    await notificationsApi.markAsRead(id);
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n,
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  deleteOne: async (id) => {
    const notif = get().notifications.find((n) => n.id === id);
    await notificationsApi.deleteOne(id);
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: notif && !notif.isRead
        ? Math.max(0, state.unreadCount - 1)
        : state.unreadCount,
    }));
  },

  clearAll: async () => {
    await notificationsApi.clearAll();
    set({ notifications: [], unreadCount: 0 });
  },

  connect: () => {
    const { eventSource: existing } = get();
    if (existing) return;

    const token = Cookies.get('accessToken');
    if (!token) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const url = `${apiUrl}/notifications/stream?token=${encodeURIComponent(token)}`;

    console.log('🔔 Connecting SSE:', url); // debug

    const es = new EventSource(url);

    es.addEventListener('notification', (e: MessageEvent) => {
      try {
        const notif = JSON.parse(e.data) as Notification;
        get().addNotification(notif);
        console.log('🔔 New notification:', notif.title);
      } catch (err) {
        console.error('SSE parse error:', err);
      }
    });

    es.addEventListener('unread_count', (e: MessageEvent) => {
      try {
        const { count } = JSON.parse(e.data) as { count: number };
        set({ unreadCount: count });
      } catch (err) {
        console.error('SSE unread_count parse error:', err);
      }
    });

    es.onopen = () => {
      console.log('🔔 SSE connected');
      set({ isConnected: true });
    };

    es.onerror = (err) => {
      console.error('🔔 SSE error:', err);
      set({ isConnected: false });

      // Auto-reconnect setelah 5 detik
      setTimeout(() => {
        const { eventSource: current } = get();
        if (current === es) {
          es.close();
          set({ eventSource: null });

          // Reconnect hanya kalau token masih valid
          const currentToken = Cookies.get('accessToken');
          if (currentToken) get().connect();
        }
      }, 5000);
    };

    set({ eventSource: es });
  },

  disconnect: () => {
    const { eventSource } = get();
    if (eventSource) {
      eventSource.close();
      set({ eventSource: null, isConnected: false });
      console.log('🔔 SSE disconnected');
    }
  },
}));