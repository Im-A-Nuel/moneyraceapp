'use client';

import Image from 'next/image';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

/**
 * BrandLogo - Single source of truth for Money Race logo
 * Uses the same /moneyracenew.png image across landing and dashboard
 */
export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizes = {
    sm: { width: 160, height: 64, className: 'h-12 w-auto' },
    md: { width: 220, height: 88, className: 'h-16 sm:h-20 w-auto' },
    lg: { width: 300, height: 120, className: 'h-20 sm:h-24 lg:h-28 w-auto' },
  };

  const s = sizes[size];

  return (
    <Image
      src="/moneyracenew.png"
      alt="Money Race Logo"
      width={s.width}
      height={s.height}
      className={`${s.className} object-contain transition-transform duration-200 hover:scale-105`}
      priority
    />
  );
}
