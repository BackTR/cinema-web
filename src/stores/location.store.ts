import { create } from 'zustand';

interface Cinema {
    id: string;
    name: string;
    address: string;
    city: string;
    latitude: number | null;
    longitude: number | null;
    distance?: number; // km
    studios: Array<{ id: string; name: string; type: string }>;
}

interface LocationState {
    userLat: number | null;
    userLng: number | null;
    selectedCinemaId: string | null;
    selectedCinemaName: string | null;
    isDetecting: boolean;
    error: string | null;
    setSelectedCinema: (id: string, name: string) => void;
    clearSelectedCinema: () => void;
    detectLocation: () => Promise<{ lat: number; lng: number } | null>;
}

// Haversine formula — hitung jarak antara 2 koordinat dalam km
export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
  const R = 6371; // radius bumi km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10; // 1 desimal
}

export const useLocationStore = create<LocationState>()((set) => ({
    userLat: null,
    userLng: null,
    selectedCinemaId: null,
    selectedCinemaName: null,
    isDetecting: false,
    error: null,

    setSelectedCinema: (id, name) =>
        set({ selectedCinemaId: id, selectedCinemaName: name }),

    clearSelectedCinema: () =>
        set({ selectedCinemaId: null, selectedCinemaName: null }),

    detectLocation: async () => {
        set({ isDetecting: true, error: null });

        return new Promise((resolve) => {
        if (!navigator.geolocation) {
            set({ isDetecting: false, error: 'Geolocation tidak didukung browser ini' });
            resolve(null);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            set({ userLat: lat, userLng: lng, isDetecting: false });
            resolve({ lat, lng });
            },
            (err) => {
            set({
                isDetecting: false,
                error:
                err.code === 1
                    ? 'Akses lokasi ditolak. Pilih bioskop secara manual.'
                    : 'Gagal mendeteksi lokasi.',
            });
            resolve(null);
            },
            { timeout: 8000, maximumAge: 300000 },
        );
        });
    },
}));