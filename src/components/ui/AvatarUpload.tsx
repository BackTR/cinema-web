'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, Loader2 } from 'lucide-react';
import { Avatar } from './Avatar';
import { profileApi } from '@/lib/api/profile';
import { useAuthStore } from '@/stores/auth.store';
import { showToast } from '@/lib/toast';

interface AvatarUploadProps {
    name: string;
    avatarUrl?: string | null;
    onUpload?: (url: string) => void;
    }

    export function AvatarUpload({ name, avatarUrl, onUpload }: AvatarUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const setUser = useAuthStore((s) => s.setUser);
    const user = useAuthStore((s) => s.user);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validasi client-side
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        showToast.error('Format tidak didukung. Gunakan JPG, PNG, atau WebP.', 'Upload Gagal');
        return;
        }

        if (file.size > 5 * 1024 * 1024) {
        showToast.error('Ukuran file maksimal 5MB', 'Upload Gagal');
        return;
        }

        // Show preview immediately
        const reader = new FileReader();
        reader.onload = (ev) => setPreview(ev.target?.result as string);
        reader.readAsDataURL(file);

        // Upload
        setIsUploading(true);
        try {
        const { url } = await profileApi.uploadAvatar(file);

        // Update user di store
        if (user) {
            setUser({ ...user, avatarUrl: url });
        }

        onUpload?.(url);
        showToast.success('Foto profil berhasil diperbarui!');
        } catch (error: unknown) {
        setPreview(null);
        const msg = (error as { response?: { data?: { message?: string } } })
            ?.response?.data?.message;
        showToast.error(msg ?? 'Gagal mengupload foto', 'Upload Gagal');
        } finally {
        setIsUploading(false);
        if (inputRef.current) inputRef.current.value = '';
        }
    };

    return (
        <div className="relative inline-block">
        <Avatar
            name={name}
            avatarUrl={preview ?? avatarUrl}
            size="xl"
        />

        {/* Upload button overlay */}
        <motion.button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={isUploading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute -bottom-1 -right-1 w-8 h-8 bg-red-600 hover:bg-red-700 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
        >
            {isUploading ? (
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            ) : (
            <Camera className="w-4 h-4 text-white" />
            )}
        </motion.button>

        <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
        />
        </div>
    );
    }