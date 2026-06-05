import { api } from '@/lib/api';
import { Movie, Schedule, SeatMap, ApiResponse, PaginatedResponse } from '@/types';

export const moviesApi = {
  getAll: async (params?: {
  search?: string;
  genre?: string;
  rating?: string;
  page?: number;
  limit?: number;
}) => {
  const cleanParams = Object.fromEntries(
    Object.entries({isActive: true ,...params ?? {}}).filter(
      ([, v]) => v !== '' && v !== undefined && v !== null,
    ),
  );

  const { data } = await api.get('/movies', { params: cleanParams });

  // Handle kedua kemungkinan struktur response
  const result = data.data;
  if (Array.isArray(result)) return result as Movie[];
  return result as { data: Movie[]; meta: { total: number; page: number; limit: number; totalPages: number } };
},

  getOne: async (id: string) => {
    const { data } = await api.get<ApiResponse<Movie>>(`/movies/${id}`);
    return data.data as unknown as Movie;
  },

  getSchedules: async (movieId: string, date?: string) => {
    const cleanParams = Object.fromEntries(
      Object.entries({ movieId, date, limit: 20 }).filter(
        ([, v]) => v !== '' && v !== undefined && v !== null,
      ),
    );

    const { data } = await api.get<ApiResponse<PaginatedResponse<Schedule>>>(
      '/schedules',
      { params: cleanParams },
    );
    return data.data as unknown as PaginatedResponse<Schedule>;
  },

  getSeatMap: async (scheduleId: string) => {
    const { data } = await api.get<ApiResponse<SeatMap>>(
      `/schedules/${scheduleId}/seats`,
    );
    return data.data as unknown as SeatMap;
  },

  getPricingRules: async (scheduleId: string) => {
    const { data } = await api.get(`/schedules/${scheduleId}/pricing`);
    // Return object { basePrice, pricingRules }
    return data.data as {
      basePrice: string;
      pricingRules: Array<{
        seatType: 'REGULAR' | 'VIP' | null;
        price: string;
      }>;
    };
  },

  getCinemas: async () => {
    const { data } = await api.get('/schedules/cinemas');
    return data.data as Array<{
      id: string;
      name: string;
      address: string;
      city: string;
      latitude: number | null;
      longitude: number | null;
      studios: Array<{ id: string; name: string; type: string }>;
    }>;
  },
};