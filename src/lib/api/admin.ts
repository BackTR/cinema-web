import { api } from '@/lib/api';

export const adminApi = {
  // Dashboard
  getDashboard: async () => {
    const { data } = await api.get('/admin/dashboard');
    return data.data;
  },

  // Movies
  createMovie: async (dto: {
    title: string;
    synopsis: string;
    durationMinutes: number;
    genre: string;
    rating: string;
    releaseDate: string;
    language?: string;
    format?: string;
    director?: string;
    cast?: string;
    posterUrl?: string;
    trailerUrl?: string;
  }) => {
    const { data } = await api.post('/movies', dto);
    return data.data;
  },

  updateMovie: async (id: string, dto: Partial<{
    title: string;
    synopsis: string;
    isActive: boolean;
  }>) => {
    const { data } = await api.patch(`/movies/${id}`, dto);
    return data.data;
  },

  deleteMovie: async (id: string) => {
    const { data } = await api.delete(`/movies/${id}`);
    return data.data;
  },

  // Cinemas
  getCinemas: async () => {
    const { data } = await api.get('/admin/cinemas');
    return data.data;
  },

  createCinema: async (dto: {
    name: string;
    address: string;
    city: string;
    phone?: string;
  }) => {
    const { data } = await api.post('/admin/cinemas', dto);
    return data.data;
  },

  // Studios
  getStudios: async (cinemaId: string) => {
    const { data } = await api.get(`/admin/cinemas/${cinemaId}/studios`);
    return data.data;
  },

  createStudio: async (dto: {
    cinemaId: string;
    name: string;
    type: string;
  }) => {
    const { data } = await api.post('/admin/studios', dto);
    return data.data;
  },

  // Schedules
  createSchedule: async (dto: {
    movieId: string;
    studioId: string;
    showTime: string;
    basePrice: number;
  }) => {
    const { data } = await api.post('/schedules', dto);
    return data.data;
  },

  // Bookings
  getAllBookings: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get('/admin/bookings', { params });
    return data.data;
  },

  // Users
  getUsers: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const { data } = await api.get('/admin/users', { params });
    return data.data;
  },

  toggleUserStatus: async (userId: string) => {
    const { data } = await api.patch(`/admin/users/${userId}/toggle-status`);
    return data.data;
  },

  // Ticket validation
  validateTicket: async (ticketCode: string) => {
    const { data } = await api.get(`/admin/tickets/validate/${ticketCode}`);
    return data.data;
  },
};