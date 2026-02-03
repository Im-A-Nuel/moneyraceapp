'use client';

import Link from 'next/link';
import { Logo } from './Logo';

interface HeaderProps {
  showSignIn?: boolean;
}

export function Header({ showSignIn = true }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Logo size="md" />
        </Link>

        {/* Right side - Sign In */}
        {showSignIn && (
          <div className="flex items-center gap-4">
            {/* User icon */}
            <button className="w-10 h-10 rounded-full flex items-center justify-center transition-colors"
              style={{
                background: 'rgba(123, 84, 47, 0.4)',
              }}
            >
              <svg
                className="w-5 h-5 text-amber-100"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </button>

            {/* Sign In button */}
            <Link
              href="/login"
              className="px-6 py-2 rounded-lg text-amber-100 font-medium transition-all duration-200"
              style={{
                background: 'rgba(182, 119, 29, 0.35)',
                border: '1px solid rgba(182, 119, 29, 0.5)',
              }}
            >
              Sign In
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
