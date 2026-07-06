// src/lib/api/reviews.ts
import { api } from '@/lib/api';
import { ReviewsResponse } from '@/types';

export const reviewsApi = {
    getMovieReviews: async (movieId: string, params?: {
        page?: number;
        limit?: number;
        rating?: number;
    }) => {
        const { data } = await api.get(`/reviews/movie/${movieId}`, { params });
        return data.data as ReviewsResponse;
    },

    canReview: async (movieId: string) => {
        const { data } = await api.get(`/reviews/can-review/${movieId}`);
        return data.data as { canReview: boolean; reason?: string; bookingId?: string };
    },

    createReview: async (dto: {
        bookingId: string;
        movieId: string;
        rating: number;
        comment?: string;
    }) => {
        const { data } = await api.post('/reviews', dto);
        return data.data;
    },

    getMyReviews: async () => {
        const { data } = await api.get('/reviews/my');
        return data.data;
    },

    deleteReview: async (reviewId: string) => {
        const { data } = await api.delete(`/reviews/${reviewId}`);
        return data.data;
    },
};