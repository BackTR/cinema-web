import { api } from '@/lib/api';
import { BookingStats } from '@/types';

export const profileApi = {
    getStats: async (): Promise<BookingStats> => {
        const { data } = await api.get('/auth/me/stats');
        return data.data as BookingStats;
    },

    uploadAvatar: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post('/upload/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data as { url: string };
    },

    uploadPoster: async (file: File): Promise<{ url: string }> => {
        const formData = new FormData();
        formData.append('file', file);

        const { data } = await api.post('/upload/poster', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data.data as { url: string };
    },
};