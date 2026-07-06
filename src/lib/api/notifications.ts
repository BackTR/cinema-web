// src/lib/api/notifications.ts
import { api } from '@/lib/api';
import { Notification } from '@/types';

export const notificationsApi = {
  getAll: async (page = 1, limit = 20) => {
    const { data } = await api.get('/notifications', { params: { page, limit } });
    return data.data as {
      data: Notification[];
      meta: { total: number; page: number; totalPages: number };
      unreadCount: number;
    };
  },

  markAllAsRead: async () => {
    const { data } = await api.patch('/notifications/read-all');
    return data.data;
  },

  markAsRead: async (id: string) => {
    const { data } = await api.patch(`/notifications/${id}/read`);
    return data.data;
  },

  deleteOne: async (id: string) => {
    const { data } = await api.delete(`/notifications/${id}`);
    return data.data;
  },

  clearAll: async () => {
    const { data } = await api.delete('/notifications');
    return data.data;
  },
};