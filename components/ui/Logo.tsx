'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { width: 120, height: 40 },
    md: { width: 200, height: 65 },
    lg: { width: 280, height: 90 },
  };

  const s = sizes[size];

  return (
    <div className="relative flex items-center gap-2">
      {/* Money Race Text Logo */}
      <Image
        src="/logo-moneyrace.png"
        alt="Money Race"
        width={s.width}
        height={s.height}
        className="object-contain"
        priority
        style={{
          filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.3))',
        }}
      />
    </div>
  );
}
