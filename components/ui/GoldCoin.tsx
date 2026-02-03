'use client';

import Image from 'next/image';

interface GoldCoinProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  animate?: boolean;
}

export function GoldCoin({ size = 'md', className = '', animate = true }: GoldCoinProps) {
  const sizes = {
    sm: 150,
    md: 250,
    lg: 350,
    xl: 450,
  };

  return (
    <div
      className={`relative ${animate ? 'animate-float' : ''} ${className}`}
      style={{
        width: sizes[size],
        height: sizes[size],
        filter: 'drop-shadow(0 15px 35px rgba(139, 112, 32, 0.5))',
      }}
    >
      <Image
        src="/mricon.png"
        alt="Money Race Coin"
        width={sizes[size]}
        height={sizes[size]}
        className="w-full h-full object-contain"
        priority
      />
    </div>
  );
}
