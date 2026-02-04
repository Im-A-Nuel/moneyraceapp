"use client";

import { useState, useEffect, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import { usdcAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useDisconnectWallet } from "@mysten/dapp-kit";

// Menu items for sidebar
const menuItems = [
  { icon: "dashboard", label: "DASHBOARD", href: "/dashboard" },
  { icon: "create", label: "CREATE ROOM", href: "/create-room" },
  { icon: "join", label: "JOIN ROOM", href: "/join-private" },
  { icon: "history", label: "HISTORY", href: "/history" },
];

const bottomMenuItems = [
  { icon: "profile", label: "PROFIL", href: "/profile" },
  { icon: "setting", label: "SETTING", href: "/settings" },
  { icon: "faq", label: "FAQ", href: "/faq" },
  { icon: "signout", label: "SIGN OUT", href: "logout" },
];

// Icon components
const MenuIcon = ({ type }: { type: string }) => {
  const icons: Record<string, JSX.Element> = {
    dashboard: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>
      </svg>
    ),
    create: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
      </svg>
    ),
    join: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M14 12l-4-4v3H2v2h8v3l4-4zm7-7H11v2h10v14H11v2h10c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2z"/>
      </svg>
    ),
    history: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.4 0-8-3.6-8-8s3.6-8 8-8 8 3.6 8 8-3.6 8-8 8zm.5-13H11v6l5.2 3.2.8-1.3-4.5-2.7V7z"/>
      </svg>
    ),
    profile: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5z"/>
      </svg>
    ),
    setting: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
      </svg>
    ),
    faq: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/>
      </svg>
    ),
    signout: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
      </svg>
    ),
    room: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"/>
      </svg>
    ),
  };
  return icons[type] || null;
};

interface DashboardLayoutProps {
  children: ReactNode;
  activeRoomId?: string; // For VIEW ROOM button
}

export default function DashboardLayout({ children, activeRoomId }: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const { mutate: disconnect } = useDisconnectWallet();
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");

  const handleLogout = () => {
    disconnect();
    logout();
    router.push('/');
  };

  const fetchUSDCBalance = async () => {
    if (!user?.address) return;
    try {
      const response = await usdcAPI.getBalance(user.address);
      if (response.success) {
        const balanceInUsdc = response.balance / 1_000_000;
        setUsdcBalance(balanceInUsdc.toFixed(2));
      }
    } catch (error) {
      console.error('Failed to fetch USDC balance:', error);
    }
  };

  useEffect(() => {
    if (user?.address) {
      fetchUSDCBalance();
    }
  }, [user?.address]);

  // Determine active menu based on pathname
  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  // Check if we're on a room detail page
  const isRoomPage = pathname?.startsWith("/room/");
  const currentRoomId = isRoomPage ? pathname?.split("/room/")[1] : activeRoomId;

  return (
    <div className="min-h-screen bg-[#B08D57] relative overflow-hidden">
      {/* Logo - Top Left Corner */}
      <div className="fixed left-6 top-6 z-20">
        <h1
          className="text-white text-5xl font-bold tracking-wider"
          style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
        >
          MONEY
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <Image
            src="/akesoris.png"
            alt="Checkered"
            width={160}
            height={32}
            className="h-8 w-auto"
          />
          <span
            className="text-white text-3xl font-bold tracking-wider"
            style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
          >
            RACE
          </span>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="fixed left-0 top-52 bottom-0 w-72 bg-[#B08D57] z-20 flex flex-col">
        {/* Navigation Menu */}
        <nav className="flex-1 px-4 pt-6 pb-6">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold tracking-wider text-sm ${
                    isActive(item.href)
                      ? 'bg-[#D4A84B]/30 text-[#FFE4A0]'
                      : 'text-[#FFE4A0]/80 hover:bg-[#D4A84B]/20 hover:text-[#FFE4A0]'
                  }`}
                  style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
                >
                  <MenuIcon type={item.icon} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}

            {/* VIEW ROOM Button - Only shows when a room is selected */}
            {currentRoomId && (
              <li>
                <button
                  onClick={() => router.push(`/room/${currentRoomId}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold tracking-wider text-sm ${
                    isRoomPage
                      ? 'bg-gradient-to-r from-[#FFB347] to-[#FF8C00] text-[#4A3000] shadow-lg border-2 border-[#D4A84B]'
                      : 'bg-[#D4A84B]/50 text-[#FFE4A0] hover:bg-gradient-to-r hover:from-[#FFB347] hover:to-[#FF8C00] hover:text-[#4A3000]'
                  }`}
                  style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
                >
                  <MenuIcon type="room" />
                  <span>VIEW ROOM</span>
                </button>
              </li>
            )}
          </ul>

          {/* Divider */}
          <div className="my-6 border-t-2 border-dashed border-[#D4A84B]/40" />

          {/* Bottom Menu */}
          <ul className="space-y-2">
            {bottomMenuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => {
                    if (item.href === "logout") {
                      handleLogout();
                    } else {
                      router.push(item.href);
                    }
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold tracking-wider text-sm text-[#FFE4A0]/80 hover:bg-[#D4A84B]/20 hover:text-[#FFE4A0]"
                  style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
                >
                  <MenuIcon type={item.icon} />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="ml-72 pt-6 min-h-screen">
        {/* Header with Wallet Info */}
        <div className="px-8 pb-4">
          <div className="flex items-center justify-between">
            {/* Wallet Info Card */}
            <div className="flex items-center gap-6">
              <div className="bg-[#C9A86C]/80 rounded-2xl px-5 py-3 border-2 border-[#8B6914] shadow-lg">
                <div className="flex items-center gap-4">
                  {/* USDC Balance */}
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[#2775CA] flex items-center justify-center">
                      <span className="text-white text-xs font-bold">$</span>
                    </div>
                    <div>
                      <span className="text-[#4A3000] font-bold text-lg">{usdcBalance}</span>
                      <span className="text-[#6B4F0F] text-xs ml-1">USDC</span>
                    </div>
                  </div>

                  <div className="w-px h-8 bg-[#8B6914]/40" />

                  {/* User Info */}
                  <div className="flex flex-col">
                    <span className="text-[#4A3000] text-sm font-semibold truncate max-w-[150px]">
                      {user?.email || 'Wallet Connected'}
                    </span>
                    {user?.address && (
                      <span className="text-[#8B6914] text-xs mt-0.5 font-mono">
                        {`${user.address.slice(0, 6)}...${user.address.slice(-4)}`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Mascot */}
              <div className="flex-shrink-0">
                <Image
                  src="/mascotsemut.png"
                  alt="Money Race Mascot"
                  width={120}
                  height={120}
                  className="animate-float drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="pl-8 pr-16 pb-32">
          <div className="bg-[#C9A86C]/60 rounded-3xl p-6 min-h-[350px] max-h-[calc(100vh-320px)] overflow-y-auto border-4 border-[#8B6914]/30 shadow-inner custom-scrollbar">
            {children}
          </div>
        </div>

        {/* Bottom Gradient */}
        <div className="fixed bottom-0 left-0 right-0 h-24 pointer-events-none z-30">
          <Image
            src="/gradient-batas.png"
            alt=""
            fill
            className="object-cover object-top"
          />
        </div>
      </main>
    </div>
  );
}
