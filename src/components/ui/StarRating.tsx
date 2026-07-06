'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

interface StarRatingProps {
    value: number;
    onChange?: (rating: number) => void;
    readonly?: boolean;
    size?: 'sm' | 'md' | 'lg';
    }

    const SIZES = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    };

    const LABELS = ['', 'Sangat Buruk', 'Buruk', 'Cukup', 'Bagus', 'Sangat Bagus'];

    export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
    const [hovered, setHovered] = useState(0);
    const active = hovered || value;

    return (
        <div className="flex flex-col items-start gap-1">
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
                key={star}
                type="button"
                disabled={readonly}
                onClick={() => onChange?.(star)}
                onHoverStart={() => !readonly && setHovered(star)}
                onHoverEnd={() => !readonly && setHovered(0)}
                whileHover={!readonly ? { scale: 1.2 } : {}}
                whileTap={!readonly ? { scale: 0.9 } : {}}
                className={`transition-colors ${readonly ? 'cursor-default' : 'cursor-pointer'}`}
            >
                <Star
                className={`${SIZES[size]} transition-colors ${
                    star <= active
                    ? 'text-yellow-400 fill-yellow-400'
                    : 'text-gray-600'
                }`}
                />
            </motion.button>
            ))}
        </div>
        {!readonly && active > 0 && (
            <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-yellow-400 text-xs font-medium"
            >
            {LABELS[active]}
            </motion.p>
        )}
        </div>
    );
}