import { api } from '@/lib/api';
import { Booking, ApiResponse, PaginatedResponse } from '@/types';

export const bookingsApi = {
  create: async (scheduleId: string, scheduleSeatIds: string[]) => {
    const { data } = await api.post<ApiResponse<Booking>>('/bookings', {
      scheduleId,
      scheduleSeatIds,
    });
    return data.data;
  },

  getMyBookings: async (page = 1, limit = 10) => {
    const { data } = await api.get<ApiResponse<PaginatedResponse<Booking>>>('/bookings', {
      params: { page, limit },
    });
    return data.data;
  },

  getOne: async (bookingCode: string) => {
    const { data } = await api.get<ApiResponse<Booking>>(`/bookings/${bookingCode}`);
    return data.data;
  },

  cancel: async (bookingCode: string, reason?: string) => {
    const { data } = await api.patch(`/bookings/${bookingCode}/cancel`, { reason });
    return data.data;
  },

  initiatePayment: async (bookingCode: string) => {
    const { data } = await api.post('/payments/initiate', { bookingCode });
    return data.data;
  },
};