'use client';

import Image from 'next/image';

interface AvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZES = {
  sm: { container: 'w-8 h-8', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-16 h-16', text: 'text-xl' },
  xl: { container: 'w-24 h-24', text: 'text-3xl' },
};

// Generate warna konsisten dari nama
function getAvatarColor(name: string): string {
  const colors = [
    'from-red-500 to-red-700',
    'from-blue-500 to-blue-700',
    'from-green-500 to-green-700',
    'from-purple-500 to-purple-700',
    'from-yellow-500 to-orange-600',
    'from-pink-500 to-pink-700',
    'from-indigo-500 to-indigo-700',
    'from-teal-500 to-teal-700',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Avatar({ name, avatarUrl, size = 'md', className = '' }: AvatarProps) {
  const { container, text } = SIZES[size];
  const gradient = getAvatarColor(name);
  const initials = getInitials(name);

  if (avatarUrl) {
    return (
      <div className={`${container} rounded-full overflow-hidden flex-shrink-0 ${className}`}>
        <Image
          src={avatarUrl}
          alt={name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`${container} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 ${className}`}
    >
      <span className={`${text} font-bold text-white`}>{initials}</span>
    </div>
  );
}