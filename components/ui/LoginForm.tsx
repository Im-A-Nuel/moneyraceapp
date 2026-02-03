'use client';

import { useState } from 'react';

interface LoginFormProps {
  onGoogleLogin?: () => void;
  onWalletLogin?: () => void;
  isLoading?: boolean;
}

export function LoginForm({ onGoogleLogin, onWalletLogin, isLoading = false }: LoginFormProps) {
  const [email, setEmail] = useState('');

  return (
    <div 
      className="w-full max-w-md p-8 rounded-2xl"
      style={{
        background: 'hsla(40, 55%, 75%, 0.85)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {/* LOGIN Title */}
      <h2 
        className="text-2xl font-bold mb-6"
        style={{ color: 'hsl(35, 70%, 40%)' }}
      >
        LOGIN
      </h2>

      {/* Email input with Google icon */}
      <div className="relative mb-6">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email Address"
          className="input-gold w-full pr-12"
        />
        {/* Google icon button */}
        <button
          onClick={onGoogleLogin}
          disabled={isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full hover:bg-amber-300/50 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
        </button>
      </div>

      {/* OR divider */}
      <div className="flex items-center justify-center mb-6">
        <span className="text-amber-700/60 text-sm font-medium">OR</span>
      </div>

      {/* Wallet button */}
      <button
        onClick={onWalletLogin}
        disabled={isLoading}
        className="btn-wallet w-full justify-center"
      >
        <span>Use Wallet</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      </button>
    </div>
  );
}
