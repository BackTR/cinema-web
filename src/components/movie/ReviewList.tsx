'use client';

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/auth.store';
import { reviewsApi } from '@/lib/api/reviews';
import { StarRating } from '@/components/ui/StarRating';
import { Avatar } from '@/components/ui/Avatar';
import { ReviewForm } from './ReviewForm';
import { showToast } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Trash2, MessageSquare, Filter } from 'lucide-react';

interface ReviewListProps {
    movieId: string;
    }

    export function ReviewList({ movieId }: ReviewListProps) {
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const user = useAuthStore((s) => s.user);
    const queryClient = useQueryClient();
    const [filterRating, setFilterRating] = useState<number | undefined>();
    const [page, setPage] = useState(1);

    // Cek apakah user bisa review
    const { data: canReviewData, refetch: refetchCanReview } = useQuery({
        queryKey: ['can-review', movieId],
        queryFn: () => reviewsApi.canReview(movieId),
        enabled: isAuthenticated,
    });

    // Fetch reviews
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['movie-reviews', movieId, filterRating, page],
        queryFn: () => reviewsApi.getMovieReviews(movieId, {
        page, limit: 5, rating: filterRating,
        }),
    });

    const handleReviewSuccess = () => {
        refetch();
        refetchCanReview();
        queryClient.invalidateQueries({ queryKey: ['movie', movieId] });
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Hapus review ini?')) return;
        try {
        await reviewsApi.deleteReview(reviewId);
        showToast.success('Review berhasil dihapus');
        refetch();
        refetchCanReview();
        } catch {
        showToast.error('Gagal menghapus review');
        }
    };

    const stats = data?.stats;
    const reviews = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div className="space-y-6">

        {/* Stats Overview */}
        {stats && stats.total > 0 && (
            <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900/40 border border-white/5 rounded-2xl p-6"
            >
            <div className="flex flex-col md:flex-row gap-6">
                {/* Average */}
                <div className="text-center md:border-r md:border-gray-800 md:pr-6">
                <p className="text-6xl font-bold text-white">{stats.average}</p>
                <StarRating value={Math.round(stats.average)} readonly size="md" />
                <p className="text-gray-400 text-sm mt-1">{stats.total} ulasan</p>
                </div>

                {/* Distribution */}
                <div className="flex-1 space-y-2">
                {stats.distribution.map((item) => (
                    <button
                    key={item.star}
                    onClick={() => setFilterRating(
                        filterRating === item.star ? undefined : item.star
                    )}
                    className={`w-full flex items-center gap-2 group ${
                        filterRating === item.star ? 'opacity-100' : 'opacity-80 hover:opacity-100'
                    }`}
                    >
                    <span className="text-gray-400 text-xs w-3">{item.star}</span>
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                        initial={{ width: 0 }}
                        animate={{
                            width: stats.total > 0
                            ? `${(item.count / stats.total) * 100}%`
                            : '0%',
                        }}
                        transition={{ duration: 0.6, delay: (5 - item.star) * 0.05 }}
                        className={`h-full rounded-full ${
                            filterRating === item.star ? 'bg-yellow-400' : 'bg-yellow-600'
                        }`}
                        />
                    </div>
                    <span className="text-gray-400 text-xs w-6 text-right">{item.count}</span>
                    </button>
                ))}
                </div>
            </div>

            {/* Filter active indicator */}
            <AnimatePresence>
                {filterRating && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2"
                >
                    <Filter className="w-3.5 h-3.5 text-yellow-400" />
                    <span className="text-yellow-400 text-xs">
                    Filter: {filterRating} bintang
                    </span>
                    <button
                    onClick={() => setFilterRating(undefined)}
                    className="text-gray-500 hover:text-white text-xs ml-1"
                    >
                    × Hapus filter
                    </button>
                </motion.div>
                )}
            </AnimatePresence>
            </motion.div>
        )}

        {/* Write Review */}
        <AnimatePresence>
            {isAuthenticated && canReviewData?.canReview && canReviewData.bookingId && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
            >
                <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400" />
                Tulis Ulasan
                </h3>
                <ReviewForm
                movieId={movieId}
                bookingId={canReviewData.bookingId}
                onSuccess={handleReviewSuccess}
                />
            </motion.div>
            )}
        </AnimatePresence>

        {/* Review Header */}
        <div className="flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-gray-400" />
            Ulasan Penonton
            {meta && <span className="text-gray-500 font-normal text-sm">({meta.total})</span>}
            </h3>
        </div>

        {/* Reviews List */}
        {isLoading ? (
            <div className="space-y-4">
            {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-900/40 rounded-xl p-5 animate-pulse">
                <div className="flex gap-3 mb-3">
                    <div className="w-10 h-10 bg-gray-800 rounded-full" />
                    <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-800 rounded w-1/4" />
                    <div className="h-3 bg-gray-800 rounded w-1/6" />
                    </div>
                </div>
                <div className="h-3 bg-gray-800 rounded w-3/4" />
                </div>
            ))}
            </div>
        ) : reviews.length === 0 ? (
            <div className="text-center py-10 text-gray-500">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>Belum ada ulasan untuk film ini</p>
            {isAuthenticated && !canReviewData?.canReview && (
                <p className="text-xs mt-2 text-gray-600">
                {canReviewData?.reason === 'already_reviewed'
                    ? 'Kamu sudah memberikan ulasan'
                    : 'Tonton filmnya dulu untuk bisa memberikan ulasan!'}
                </p>
            )}
            </div>
        ) : (
            <motion.div
            className="space-y-4"
            initial="hidden"
            animate="show"
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
            >
            {reviews.map((review) => (
                <motion.div
                key={review.id}
                variants={{
                    hidden: { opacity: 0, y: 10 },
                    show: { opacity: 1, y: 0 },
                }}
                className="bg-gray-900/40 border border-white/5 rounded-xl p-5"
                >
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                    <Avatar
                        name={review.user.name}
                        avatarUrl={review.user.avatarUrl}
                        size="sm"
                    />
                    <div>
                        <p className="text-white text-sm font-medium">{review.user.name}</p>
                        <p className="text-gray-500 text-xs">
                        {new Date(review.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric', month: 'long', year: 'numeric',
                        })}
                        </p>
                    </div>
                    </div>
                    <div className="flex items-center gap-2">
                    <StarRating value={review.rating} readonly size="sm" />
                    {user?.id === review.userId && (
                        <button
                        onClick={() => handleDelete(review.id)}
                        className="text-gray-600 hover:text-red-400 transition-colors ml-1"
                        >
                        <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}
                    </div>
                </div>

                {review.comment && (
                    <p className="text-gray-300 text-sm leading-relaxed">{review.comment}</p>
                )}
                </motion.div>
            ))}
            </motion.div>
        )}

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
            <div className="flex justify-center gap-2">
            <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
            >
                ←
            </button>
            <span className="text-gray-400 text-sm px-3 py-2">
                {page} / {meta.totalPages}
            </span>
            <button
                onClick={() => setPage(page + 1)}
                disabled={page === meta.totalPages}
                className="btn-secondary px-4 py-2 text-sm disabled:opacity-30"
            >
                →
            </button>
            </div>
        )}
        </div>
    );
    }