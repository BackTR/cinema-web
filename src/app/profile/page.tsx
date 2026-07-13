'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/stores/auth.store';
import { profileApi } from '@/lib/api/profile';
import { AvatarUpload } from '@/components/ui/AvatarUpload';
import { FormField, Input, PasswordInput } from '@/components/ui/FormField';
import { showToast } from '@/lib/toast';
import { formatCurrency } from '@/lib/utils';
import {
  User, Phone, Mail, Lock, Ticket,
  CheckCircle, Clock, XCircle, ChevronRight,
  Shield, LogOut, Settings,
} from 'lucide-react';
import Link from 'next/link';

// Schemas
const profileSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter').max(100),
  phone: z
    .string()
    .regex(/^(\+62|62|0)8[0-9]{8,11}$/, 'Format tidak valid')
    .optional()
    .or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Wajib diisi'),
  newPassword: z
    .string()
    .min(8, 'Minimal 8 karakter')
    .regex(/[A-Z]/, 'Harus ada huruf kapital')
    .regex(/[0-9]/, 'Harus ada angka'),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Password tidak cocok',
  path: ['confirmPassword'],
});

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

type ActiveTab = 'profile' | 'security';

export default function ProfilePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const updateProfile = useAuthStore((s) => s.updateProfile);
  const changePassword = useAuthStore((s) => s.changePassword);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [activeTab, setActiveTab] = useState<ActiveTab>('profile');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  if (!isAuthenticated) {
    router.push('/auth/login');
    return null;
  }

  // Stats
  const { data: stats } = useQuery({
    queryKey: ['booking-stats'],
    queryFn: profileApi.getStats,
    enabled: isAuthenticated,
  });

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name ?? '',
      phone: user?.phone ?? '',
    },
    mode: 'onBlur',
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    mode: 'onBlur',
  });

  const newPassword = passwordForm.watch('newPassword', '');
  const passwordChecks = {
    minLength: newPassword.length >= 8,
    hasUpperCase: /[A-Z]/.test(newPassword),
    hasNumber: /[0-9]/.test(newPassword),
  };

  const handleProfileSubmit = async (data: ProfileForm) => {
    setIsSavingProfile(true);
    try {
      await updateProfile({ name: data.name, phone: data.phone || undefined });
      showToast.success('Profil berhasil diperbarui!');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      showToast.error(msg ?? 'Gagal memperbarui profil', 'Error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (data: PasswordForm) => {
    setIsSavingPassword(true);
    try {
      await changePassword(data.currentPassword, data.newPassword);
      showToast.success('Password berhasil diubah. Silakan login ulang.');
      passwordForm.reset();
      await logout();
      router.push('/auth/login');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      if (msg?.includes('Password saat ini salah')) {
        passwordForm.setError('currentPassword', { message: 'Password saat ini salah' });
        showToast.error('Password saat ini salah', 'Ganti Password Gagal');
      } else {
        showToast.error(msg ?? 'Gagal mengubah password', 'Error');
      }
    } finally {
      setIsSavingPassword(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast.success('Logout berhasil');
    router.push('/');
  };

  const TABS: { id: ActiveTab; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'security', label: 'Keamanan', icon: Shield },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">

      {/* Header Card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6 mb-6"
      >
        <div className="flex items-center gap-5">
          <AvatarUpload
            name={user?.name ?? 'U'}
            avatarUrl={user?.avatarUrl}
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-white truncate">{user?.name}</h1>
            <div className="flex flex-wrap gap-3 mt-1.5">
              {user?.email && (
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
              )}
              {user?.phone && (
                <span className="flex items-center gap-1.5 text-gray-400 text-sm">
                  <Phone className="w-3.5 h-3.5" />
                  {user.phone}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                user?.role === 'ADMIN'
                  ? 'bg-purple-900/50 text-purple-300 border border-purple-700/50'
                  : 'bg-gray-800 text-gray-400 border border-gray-700'
              }`}>
                {user?.role}
              </span>
              {user?.emailVerified && (
                <span className="flex items-center gap-1 text-xs text-green-400 bg-green-900/30 border border-green-700/30 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  Email Terverifikasi
                </span>
              )}
              {user?.phoneVerified && (
                <span className="flex items-center gap-1 text-xs text-blue-400 bg-blue-900/30 border border-blue-700/30 px-2 py-0.5 rounded-full">
                  <CheckCircle className="w-3 h-3" />
                  HP Terverifikasi
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-800">
            {[
              { icon: Ticket, label: 'Total Booking', value: stats.total, color: 'text-white' },
              { icon: CheckCircle, label: 'Terkonfirmasi', value: stats.confirmed, color: 'text-green-400' },
              { icon: Clock, label: 'Menunggu', value: stats.pending, color: 'text-yellow-400' },
              { icon: XCircle, label: 'Dibatalkan', value: stats.cancelled, color: 'text-red-400' },
            ].map((stat, i) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="text-center"
                >
                  <Icon className={`w-4 h-4 ${stat.color} mx-auto mb-1`} />
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-gray-500 text-xs">{stat.label}</p>
                </motion.div>
              );
            })}
          </div>
        )}

        {stats && stats.totalSpent > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-4 bg-gray-800/50 rounded-xl px-4 py-3 flex items-center justify-between"
          >
            <span className="text-gray-400 text-sm">Total pengeluaran</span>
            <span className="text-white font-bold">{formatCurrency(stats.totalSpent)}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card mb-6 overflow-hidden"
      >
        <Link href="/bookings">
          <motion.div
            whileHover={{ x: 4 }}
            className="flex items-center justify-between p-4 hover:bg-gray-800/50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-red-600/20 rounded-lg flex items-center justify-center">
                <Ticket className="w-4 h-4 text-red-400" />
              </div>
              <div>
                <p className="text-white text-sm font-medium">Riwayat Tiket</p>
                <p className="text-gray-500 text-xs">Lihat semua booking kamu</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </motion.div>
        </Link>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card overflow-hidden"
      >
        {/* Tab Headers */}
        <div className="flex border-b border-gray-800">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all relative ${
                  activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <motion.form
                key="profile"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                onSubmit={profileForm.handleSubmit(handleProfileSubmit)}
                className="space-y-5"
              >
                <FormField
                  label="Nama Lengkap"
                  required
                  error={profileForm.formState.errors.name?.message}
                  success={!profileForm.formState.errors.name && !!profileForm.watch('name')}
                >
                  <Input
                    type="text"
                    placeholder="John Doe"
                    error={!!profileForm.formState.errors.name}
                    success={!profileForm.formState.errors.name && !!profileForm.watch('name')}
                    {...profileForm.register('name')}
                  />
                </FormField>

                {/* Email - read only */}
                {user?.email && (
                  <div>
                    <label className="label">Email</label>
                    <div className="input flex items-center gap-2 opacity-60 cursor-not-allowed">
                      <Mail className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className="text-gray-400">{user.email}</span>
                      {user.emailVerified && (
                        <CheckCircle className="w-3.5 h-3.5 text-green-400 ml-auto" />
                      )}
                    </div>
                    <p className="text-gray-600 text-xs mt-1">Email tidak bisa diubah</p>
                  </div>
                )}

                <FormField
                  label="Nomor HP"
                  error={profileForm.formState.errors.phone?.message}
                  hint="Format: 081234567890"
                >
                  <Input
                    type="tel"
                    placeholder="081234567890"
                    error={!!profileForm.formState.errors.phone}
                    {...profileForm.register('phone')}
                  />
                </FormField>

                <motion.button
                  type="submit"
                  disabled={isSavingProfile || !profileForm.formState.isDirty}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="btn-primary w-full disabled:opacity-50"
                >
                  {isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan'}
                </motion.button>
              </motion.form>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* Change Password */}
                {user?.email && (
                  <div>
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      Ganti Password
                    </h3>

                    <form
                      onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)}
                      className="space-y-4"
                    >
                      <FormField
                        label="Password Saat Ini"
                        required
                        error={passwordForm.formState.errors.currentPassword?.message}
                      >
                        <PasswordInput
                          placeholder="••••••••"
                          error={!!passwordForm.formState.errors.currentPassword}
                          {...passwordForm.register('currentPassword')}
                        />
                      </FormField>

                      <FormField
                        label="Password Baru"
                        required
                        error={passwordForm.formState.errors.newPassword?.message}
                      >
                        <PasswordInput
                          placeholder="Min. 8 karakter"
                          error={!!passwordForm.formState.errors.newPassword}
                          {...passwordForm.register('newPassword')}
                        />
                        {newPassword.length > 0 && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-2 space-y-1"
                          >
                            {[
                              { check: passwordChecks.minLength, label: 'Minimal 8 karakter' },
                              { check: passwordChecks.hasUpperCase, label: 'Ada huruf kapital' },
                              { check: passwordChecks.hasNumber, label: 'Ada angka' },
                            ].map((item) => (
                              <div key={item.label} className="flex items-center gap-1.5 text-xs">
                                <CheckCircle className={`w-3.5 h-3.5 transition-colors ${
                                  item.check ? 'text-green-400' : 'text-gray-600'
                                }`} />
                                <span className={item.check ? 'text-green-400' : 'text-gray-500'}>
                                  {item.label}
                                </span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </FormField>

                      <FormField
                        label="Konfirmasi Password Baru"
                        required
                        error={passwordForm.formState.errors.confirmPassword?.message}
                      >
                        <PasswordInput
                          placeholder="Ulangi password baru"
                          error={!!passwordForm.formState.errors.confirmPassword}
                          {...passwordForm.register('confirmPassword')}
                        />
                      </FormField>

                      <motion.button
                        type="submit"
                        disabled={isSavingPassword}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="btn-primary w-full"
                      >
                        {isSavingPassword ? 'Menyimpan...' : 'Ganti Password'}
                      </motion.button>
                    </form>
                  </div>
                )}

                {/* OAuth user — tidak bisa ganti password */}
                {!user?.email && (
                  <div className="bg-gray-800/50 rounded-xl p-4 text-center">
                    <Shield className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                    <p className="text-gray-400 text-sm">
                      Akun ini menggunakan login sosial (Google/Facebook).
                      Keamanan dikelola oleh penyedia layanan tersebut.
                    </p>
                  </div>
                )}

                {/* Danger Zone */}
                <div className="border-t border-gray-800 pt-5">
                  <h3 className="text-gray-400 text-sm font-medium mb-3">Aksi Akun</h3>
                  <motion.button
                    onClick={handleLogout}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="w-full flex items-center justify-center gap-2 border border-red-700/50 text-red-400 hover:bg-red-900/20 py-2.5 rounded-lg text-sm transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar dari Semua Perangkat
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}