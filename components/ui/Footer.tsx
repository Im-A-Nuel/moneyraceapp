'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full py-8 px-6" style={{ background: '#7B542F' }}>
      <div className="max-w-7xl mx-auto">
        {/* Footer links */}
        <div className="flex items-center justify-center gap-6 mb-6">
          <a href="https://minigarage.gitbook.io/moneyrace/" target="_blank" rel="noopener noreferrer" className="text-amber-200/80 hover:text-white text-sm transition-colors">
            Docs
          </a>
          <span className="text-amber-700/50">|</span>
          <Link href="#" className="text-amber-200/80 hover:text-white text-sm transition-colors">
            About Us
          </Link>
        </div>

        {/* Copyright */}
        <div className="pt-4 border-t border-amber-700/30">
          <p className="text-amber-200/70 text-xs text-center">
            © {new Date().getFullYear()} SUI. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
