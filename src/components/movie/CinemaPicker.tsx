'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { moviesApi } from '@/lib/api/movies';
import { useLocationStore, calculateDistance } from '@/stores/location.store';
import {
    MapPin, Navigation, X, Search,
    Building, ChevronRight, Loader2,
    } from 'lucide-react';

    interface CinemaPickerProps {
    onSelect: (cinemaId: string, cinemaName: string) => void;
    onClose: () => void;
    }

    export function CinemaPicker({ onSelect, onClose }: CinemaPickerProps) {
    const { userLat, userLng, isDetecting, error, detectLocation } = useLocationStore();
    const [search, setSearch] = useState('');

    const { data: cinemasRaw } = useQuery({
        queryKey: ['cinemas-public'],
        queryFn: moviesApi.getCinemas,
    });

    const cinemas = Array.isArray(cinemasRaw) ? cinemasRaw : [];

    // Tambahkan jarak ke setiap bioskop jika lokasi tersedia
    const cinemasWithDistance = cinemas
        .map((cinema) => ({
        ...cinema,
        distance:
            userLat && userLng && cinema.latitude && cinema.longitude
            ? calculateDistance(userLat, userLng, cinema.latitude, cinema.longitude)
            : null,
        }))
        .filter((c) =>
        search
            ? c.name.toLowerCase().includes(search.toLowerCase()) ||
            c.city.toLowerCase().includes(search.toLowerCase())
            : true,
        )
        .sort((a, b) => {
        // Sort by distance jika ada, otherwise by name
        if (a.distance !== null && b.distance !== null) {
            return a.distance - b.distance;
        }
        return a.name.localeCompare(b.name);
        });

    const handleDetect = async () => {
        await detectLocation();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[85vh] flex flex-col">

            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
            <div>
                <h2 className="text-lg font-bold text-white">Pilih Bioskop</h2>
                <p className="text-gray-400 text-sm mt-0.5">
                {userLat && userLng
                    ? 'Diurutkan berdasarkan jarak terdekat'
                    : 'Pilih bioskop terdekat'}
                </p>
            </div>
            <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
            </div>

            {/* Detect Location Button */}
            <div className="px-5 py-3 border-b border-gray-800">
            <button
                onClick={handleDetect}
                disabled={isDetecting}
                className="w-full flex items-center justify-center gap-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/40 text-blue-400 hover:text-blue-300 px-4 py-2.5 rounded-xl transition-all text-sm font-medium"
            >
                {isDetecting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Mendeteksi lokasi...
                </>
                ) : userLat && userLng ? (
                <>
                    <Navigation className="w-4 h-4" />
                    Lokasi terdeteksi — urutkan ulang
                </>
                ) : (
                <>
                    <Navigation className="w-4 h-4" />
                    Deteksi lokasi saya otomatis
                </>
                )}
            </button>
            {error && (
                <p className="text-red-400 text-xs mt-2 text-center">{error}</p>
            )}
            {userLat && userLng && (
                <p className="text-green-400 text-xs mt-2 text-center flex items-center justify-center gap-1">
                <MapPin className="w-3 h-3" />
                Lokasi berhasil terdeteksi
                </p>
            )}
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-gray-800">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                type="text"
                className="input pl-9 text-sm py-2"
                placeholder="Cari nama atau kota bioskop..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                />
            </div>
            </div>

            {/* Cinema List */}
            <div className="overflow-y-auto flex-1 p-3">
            {cinemasWithDistance.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                <Building className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>Bioskop tidak ditemukan</p>
                </div>
            ) : (
                <div className="space-y-1">
                {cinemasWithDistance.map((cinema) => (
                    <button
                    key={cinema.id}
                    onClick={() => onSelect(cinema.id, cinema.name)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-gray-800 transition-colors text-left group"
                    >
                    {/* Icon */}
                    <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Building className="w-5 h-5 text-red-400" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">
                        {cinema.name}
                        </p>
                        <p className="text-gray-400 text-xs truncate mt-0.5">
                        {cinema.address}, {cinema.city}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                        {cinema.studios.length} studio
                        </p>
                    </div>

                    {/* Distance */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                        {cinema.distance !== null && (
                        <span className="text-blue-400 text-xs font-medium bg-blue-400/10 px-2 py-0.5 rounded-full">
                            {cinema.distance} km
                        </span>
                        )}
                        <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-gray-400 transition-colors" />
                    </div>
                    </button>
                ))}
                </div>
            )}
            </div>
        </div>
        </div>
    );
    }