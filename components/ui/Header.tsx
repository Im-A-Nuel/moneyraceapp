'use client';

import Link from 'next/link';
import { Logo } from './Logo';

export function Header() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Logo size="md" />
        </Link>
      </div>
    </header>
  );
}
