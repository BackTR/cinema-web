export interface User {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: 'CUSTOMER' | 'ADMIN' | 'STAFF';
  isActive?: boolean;
  avatarUrl?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface Movie {
  id: string;
  title: string;
  synopsis: string;
  durationMinutes: number;
  genre: string;
  rating: string;
  language: string;
  format: string;
  posterUrl?: string;
  trailerUrl?: string;
  director?: string;
  cast?: string;
  releaseDate: string;
  isActive: boolean;
  averageRating?: number;
  totalReviews?: number;
}

export interface Cinema {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
}

export interface Studio {
  id: string;
  cinemaId: string;
  name: string;
  type: 'REGULAR' | 'PREMIUM' | 'IMAX';
  cinema: Cinema;
}

export interface Schedule {
  id: string;
  movieId: string;
  studioId: string;
  showTime: string;
  endTime: string;
  basePrice: string;
  language: string;
  format: string;
  isSoldOut: boolean;
  movie: Movie;
  studio: Studio & { cinema: Cinema };
}

export interface SeatInfo {
  id: string;
  seatId: string;
  rowLabel: string;
  seatNumber: number;
  type: 'REGULAR' | 'VIP';
  status: 'AVAILABLE' | 'LOCKED' | 'BOOKED';
}

export interface SeatMap {
  scheduleId: string;
  rows: Record<string, SeatInfo[]>;
  summary: {
    available: number;
    locked: number;
    booked: number;
    total: number;
  };
}

export interface Booking {
  id: string;
  userId: string;
  scheduleId: string;
  bookingCode: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'EXPIRED';
  totalAmount: string;
  expiresAt: string;
  cancelledAt?: string;
  createdAt: string;
  schedule: Schedule;
  seats: BookingSeat[];
  payment?: Payment;
}

export interface BookingSeat {
  id: string;
  bookingId: string;
  scheduleSeatId: string;
  price: string;
  ticketCode: string;
  scheduleSeat: {
    id: string;
    seat: { rowLabel: string; seatNumber: number; type: string };
  };
}

export interface Payment {
  id: string;
  bookingId: string;
  gateway: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  amount: string;
  paidAt?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BookingStats {
  total: number;
  confirmed: number;
  pending: number;
  cancelled: number;
  totalSpent: number;
}

export interface Review {
  id: string;
  userId: string;
  movieId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { name: string; avatarUrl?: string | null };
}

export interface ReviewStats {
  average: number;
  total: number;
  distribution: { star: number; count: number }[];
}

export interface ReviewsResponse {
  data: Review[];
  meta: { total: number; page: number; limit: number; totalPages: number };
  stats: ReviewStats;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}