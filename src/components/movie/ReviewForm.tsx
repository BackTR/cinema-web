'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { reviewsApi } from '@/lib/api/reviews';
import { StarRating } from '@/components/ui/StarRating';
import { Avatar } from '@/components/ui/Avatar';
import { showToast } from '@/lib/toast';
import { Send, Loader2 } from 'lucide-react';

interface ReviewFormProps {
    movieId: string;
    bookingId: string;
    onSuccess?: () => void;
    }

    export function ReviewForm({ movieId, bookingId, onSuccess }: ReviewFormProps) {
    const user = useAuthStore((s) => s.user);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
        showToast.warning('Pilih rating terlebih dahulu');
        return;
        }

        setIsSubmitting(true);
        try {
        await reviewsApi.createReview({ bookingId, movieId, rating, comment: comment || undefined });
        showToast.success('Review berhasil dikirim! Terima kasih 🎬');
        setRating(0);
        setComment('');
        onSuccess?.();
        } catch (error: unknown) {
        const msg = (error as { response?: { data?: { message?: string } } })
            ?.response?.data?.message;
        showToast.error(msg ?? 'Gagal mengirim review', 'Error');
        } finally {
        setIsSubmitting(false);
        }
    };

    return (
        <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-gray-800/50 border border-gray-700 rounded-xl p-5"
        >
        <div className="flex gap-3 mb-4">
            <Avatar name={user?.name ?? 'U'} avatarUrl={user?.avatarUrl} size="md" />
            <div className="flex-1">
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="text-gray-500 text-xs">Tulis review kamu</p>
            </div>
        </div>

        {/* Star Rating */}
        <div className="mb-4">
            <p className="text-gray-400 text-sm mb-2">Rating</p>
            <StarRating value={rating} onChange={setRating} size="lg" />
        </div>

        {/* Comment */}
        <div className="mb-4">
            <textarea
            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 transition-colors resize-none text-sm"
            rows={3}
            placeholder="Ceritakan pengalamanmu menonton film ini... (opsional)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            maxLength={1000}
            />
            <div className="flex justify-end mt-1">
            <span className={`text-xs ${comment.length > 900 ? 'text-red-400' : 'text-gray-600'}`}>
                {comment.length}/1000
            </span>
            </div>
        </div>

        <motion.button
            type="submit"
            disabled={isSubmitting || rating === 0}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
            {isSubmitting ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Mengirim...</>
            ) : (
            <><Send className="w-4 h-4" /> Kirim Review</>
            )}
        </motion.button>
        </motion.form>
    );
}