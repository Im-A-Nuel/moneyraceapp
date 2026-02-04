"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { roomAPI, usdcAPI, aiAPI, convertCreateRoomData, convertCreateRoomDataTestMode } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useDisconnectWallet } from "@mysten/dapp-kit";

interface Room {
  id: string;
  name: string;
  duration: number;
  weeklyTarget: number;
  currentPeriod: number;
  totalPeriods: number;
  participants: number;
  myDeposit: number;
  totalDeposit: number;
  strategy: string;
  status: "active" | "ended";
  isPrivate?: boolean;
}

interface MyRoom {
  roomId: string;
  vaultId: string | null;
  playerPositionId: string;
  joinedAt: number;
  myDeposit: number;
  depositsCount: number;
  totalPeriods: number;
  depositAmount: number;
  strategyId: number;
  isPrivate: boolean;
  status: number;
}

interface Strategy {
  id: number;
  name: string;
  expectedReturn: number;
  risk: number;
  description: string;
}

type ActiveView = "dashboard" | "create-room" | "join-room" | "history";
type CreateRoomStep = 1 | 2 | 3 | 4;

// Sidebar menu items
const menuItems = [
  { icon: "dashboard", label: "DASHBOARD", view: "dashboard" as ActiveView },
  { icon: "create", label: "CREATE ROOM", view: "create-room" as ActiveView },
  { icon: "join", label: "JOIN ROOM", view: "join-room" as ActiveView },
  { icon: "history", label: "HISTORY", view: "history" as ActiveView },
];

const bottomMenuItems = [
  { icon: "profile", label: "PROFIL", action: "profile" },
  { icon: "setting", label: "SETTING", action: "settings" },
  { icon: "faq", label: "FAQ", action: "faq" },
  { icon: "signout", label: "SIGN OUT", action: "logout" },
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
  };
  return icons[type] || null;
};

export default function Dashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { mutate: disconnect } = useDisconnectWallet();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [myRooms, setMyRooms] = useState<MyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRoomsLoading, setMyRoomsLoading] = useState(true);
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "my-rooms" | "ended">("active");
  const [activeView, setActiveView] = useState<ActiveView>("dashboard");

  // Create Room Form State
  const [createRoomStep, setCreateRoomStep] = useState<CreateRoomStep>(1);
  const [roomName, setRoomName] = useState("");
  const [duration, setDuration] = useState("");
  const [weeklyTarget, setWeeklyTarget] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [isTestMode, setIsTestMode] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [createdRoomId, setCreatedRoomId] = useState<string>("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategy, setSelectedStrategy] = useState<number | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [formError, setFormError] = useState<string>("");

  // Join Room Form State
  const [joinRoomId, setJoinRoomId] = useState("");
  const [joinPassword, setJoinPassword] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState<string>("");

  const handleLogout = () => {
    disconnect();
    logout();
    router.push('/');
  };

  const handleMenuClick = (view: ActiveView | "logout") => {
    if (view === "logout") {
      handleLogout();
    } else {
      setActiveView(view);
      // Reset forms when switching views
      if (view === "create-room") {
        setCreateRoomStep(1);
        setFormError("");
      }
      if (view === "join-room") {
        setJoinRoomId("");
        setJoinPassword("");
        setJoinError("");
      }
    }
  };

  useEffect(() => {
    fetchRooms();
    if (user?.address) {
      fetchUSDCBalance();
      fetchMyRooms();
    }
  }, [user]);

  const fetchUSDCBalance = async () => {
    if (!user?.address) return;
    try {
      setBalanceLoading(true);
      const data = await usdcAPI.getBalance(user.address);
      setUsdcBalance(data.balanceFormatted || "0.00");
    } catch (error) {
      console.error('Failed to fetch USDC balance:', error);
      setUsdcBalance("0.00");
    } finally {
      setBalanceLoading(false);
    }
  };

  const fetchMyRooms = async () => {
    if (!user?.address) return;
    try {
      setMyRoomsLoading(true);
      const response = await roomAPI.getMyRooms(user.address);
      if (response.success && response.rooms) {
        setMyRooms(response.rooms);
      } else {
        setMyRooms([]);
      }
    } catch (error) {
      console.error('Failed to fetch my rooms:', error);
      setMyRooms([]);
    } finally {
      setMyRoomsLoading(false);
    }
  };

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.listRooms();

      if (response.success && response.rooms) {
        const mappedRooms = response.rooms.map((room: any) => {
          const startTimeMs = Number(room.startTimeMs) || Date.now();
          const periodLengthMs = Number(room.periodLengthMs) || (7 * 24 * 60 * 60 * 1000);
          const now = Date.now();
          const elapsedMs = now - startTimeMs;

          let currentPeriod = 0;
          if (elapsedMs > 0) {
            currentPeriod = Math.floor(elapsedMs / periodLengthMs);
          }

          const totalPeriods = room.totalPeriods || 0;
          const displayPeriod = Math.min(currentPeriod, totalPeriods);
          const isEnded = currentPeriod >= totalPeriods;

          return {
            id: room.roomId,
            name: `Room #${room.roomId.slice(0, 8)}...`,
            duration: totalPeriods,
            weeklyTarget: room.depositAmount / 1_000_000 || 0,
            currentPeriod: displayPeriod,
            totalPeriods: totalPeriods,
            participants: 0,
            myDeposit: 0,
            totalDeposit: 0,
            strategy: `Strategy ${room.strategyId}`,
            status: isEnded ? "ended" : "active",
          };
        });

        setRooms(mappedRooms);
      } else {
        setRooms([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (myRooms.length > 0 && rooms.length > 0) {
      setRooms(prevRooms => prevRooms.map(room => {
        const myRoom = myRooms.find(mr => mr.roomId === room.id);
        if (myRoom) {
          return {
            ...room,
            myDeposit: myRoom.myDeposit
          };
        }
        return room;
      }));
    }
  }, [myRooms]);

  const activeRooms = rooms.filter((r) => r.status === "active");
  const endedRooms = rooms.filter((r) => r.status === "ended");

  // Create Room Form Handlers
  const handleAISubmit = async () => {
    setAiLoading(true);
    setFormError("");

    try {
      const response = await aiAPI.getRecommendation(aiPrompt);

      if (response.success && response.strategies) {
        const mappedStrategies = response.strategies.map((s: any, index: number) => ({
          id: index,
          name: s.name || s.strategy,
          expectedReturn: s.expectedReturn || s.return_pct || 0,
          risk: s.risk || s.risk_pct || 0,
          description: s.description || s.reasoning || "",
        }));

        setStrategies(mappedStrategies);
        setCreateRoomStep(3);
      } else {
        // Fallback strategies
        setStrategies([
          { id: 0, name: "Stable", expectedReturn: 3.5, risk: 15, description: "Conservative approach with stable, low-risk deposits." },
          { id: 1, name: "Balanced", expectedReturn: 6.5, risk: 35, description: "Moderate risk-reward balance." },
          { id: 2, name: "Growth", expectedReturn: 12.0, risk: 60, description: "Aggressive strategy targeting higher returns." },
        ]);
        setCreateRoomStep(3);
      }
    } catch (err: any) {
      console.error("AI recommendation error:", err);
      setFormError(err.message || "Failed to get AI recommendations. Using default strategies.");
      setStrategies([
        { id: 0, name: "Stable", expectedReturn: 3.5, risk: 15, description: "Conservative approach with stable, low-risk deposits." },
        { id: 1, name: "Balanced", expectedReturn: 6.5, risk: 35, description: "Moderate risk-reward balance." },
        { id: 2, name: "Growth", expectedReturn: 12.0, risk: 60, description: "Aggressive strategy targeting higher returns." },
      ]);
      setCreateRoomStep(3);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (selectedStrategy === null) {
      setFormError("Please select a strategy");
      return;
    }

    setCreateLoading(true);
    setFormError("");

    try {
      const roomData = isTestMode
        ? convertCreateRoomDataTestMode({
            name: roomName,
            duration: Number(duration),
            weeklyTarget: Number(weeklyTarget),
            strategyId: selectedStrategy,
          })
        : convertCreateRoomData({
            name: roomName,
            duration: Number(duration),
            weeklyTarget: Number(weeklyTarget),
            strategyId: selectedStrategy,
          });

      const roomDataWithPrivacy = { ...roomData, isPrivate };
      const response = await roomAPI.createRoom(roomDataWithPrivacy);

      if (response.success) {
        if (isPrivate && response.password && response.roomId) {
          setGeneratedPassword(response.password);
          setCreatedRoomId(response.roomId);
          setShowPasswordModal(true);
        } else {
          // Reset form and go back to dashboard
          resetCreateRoomForm();
          setActiveView("dashboard");
          fetchRooms();
        }
      } else {
        setFormError(response.error || "Failed to create room");
      }
    } catch (err: any) {
      console.error("Create room error:", err);
      setFormError(err.response?.data?.error || err.message || "Failed to create room");
    } finally {
      setCreateLoading(false);
    }
  };

  const resetCreateRoomForm = () => {
    setCreateRoomStep(1);
    setRoomName("");
    setDuration("");
    setWeeklyTarget("");
    setIsPrivate(false);
    setIsTestMode(false);
    setAiPrompt("");
    setStrategies([]);
    setSelectedStrategy(null);
    setFormError("");
  };

  // Join Room Handlers
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

  const handleJoinByRoomId = () => {
    if (!joinRoomId || joinRoomId.trim() === "") {
      setJoinError("Please enter a room ID");
      return;
    }

    if (!joinRoomId.startsWith("0x")) {
      setJoinError("Invalid room ID format. Should start with 0x");
      return;
    }

    router.push(`/room/${joinRoomId}`);
  };

  const handleJoinByPassword = async () => {
    if (!joinPassword || joinPassword.trim() === "") {
      setJoinError("Please enter a password");
      return;
    }

    setJoinLoading(true);
    setJoinError("");

    try {
      const response = await fetch(`${API_URL}/room/find-by-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: joinPassword }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setJoinError(data.error || "Room not found with this password");
        setJoinLoading(false);
        return;
      }

      router.push(`/room/${data.roomId}`);
    } catch {
      setJoinError("Failed to search for room. Please try again.");
      setJoinLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-[#B08D57] relative overflow-hidden">
      {/* Logo - Top Left Corner */}
      <div className="fixed left-6 top-6 z-20">
        {/* MONEY text */}
        <h1
          className="text-white text-5xl font-bold tracking-wider"
          style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
        >
          MONEY
        </h1>
        {/* Checkered + RACE row */}
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
                  onClick={() => handleMenuClick(item.view)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-bold tracking-wider text-sm ${
                    activeView === item.view
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
          </ul>

          {/* Divider */}
          <div className="my-6 border-t-2 border-dashed border-[#D4A84B]/40" />

          {/* Bottom Menu */}
          <ul className="space-y-2">
            {bottomMenuItems.map((item) => (
              <li key={item.label}>
                <button
                  onClick={() => {
                    if (item.action === "logout") {
                      handleLogout();
                    } else {
                      router.push(`/${item.action}`);
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
      <main className="ml-72 min-h-screen relative">
        {/* Header Area */}
        <div className="pt-6 px-8 pb-4">
          {/* Wallet + Mascot Row */}
          <div className="flex justify-end items-center">
            {/* Wallet Info + Mascot */}
            <div className="flex items-center gap-4">
              {/* Wallet Info Card */}
              <div className="bg-[#E8D5A8] rounded-2xl px-5 py-4 shadow-lg border-2 border-[#D4A84B]/40">
                <div className="flex items-center gap-4">
                  {/* USDC Logo */}
                  <div className="w-10 h-10 bg-[#F5C518] rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-lg">$</span>
                  </div>
                  {/* Info */}
                  <div className="flex flex-col">
                    {/* Balance */}
                    <span
                      className="text-[#4A3000] font-bold text-base"
                      style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
                    >
                      {balanceLoading ? '...' : usdcBalance} USDC
                    </span>
                    {/* Email/Name */}
                    <span
                      className="text-[#6B4F0F] text-xs mt-1"
                      style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
                    >
                      {user?.email || 'Wallet Connected'}
                    </span>
                    {/* Wallet Address */}
                    {user?.address && (
                      <span
                        className="text-[#8B6914] text-xs mt-0.5 font-mono"
                      >
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

          {/* Search Bar - Centered (only show in dashboard view) */}
          {activeView === "dashboard" && (
            <div className="flex justify-center mt-4">
              <div className="relative w-full max-w-md">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#8B6914]">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 001.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 00-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 005.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-[#C9A86C]/80 rounded-full border-2 border-[#8B6914] text-[#4A3000] placeholder-[#8B6914]/60 focus:outline-none focus:border-[#D4A84B] shadow-inner"
                />
              </div>
            </div>
          )}

        </div>

        {/* Main Content Area */}
        <div className="pl-8 pr-16 pb-32">
          {/* Content Box */}
          <div className="bg-[#C9A86C]/60 rounded-3xl p-6 min-h-[350px] max-h-[calc(100vh-320px)] overflow-y-auto border-4 border-[#8B6914]/30 shadow-inner custom-scrollbar">

            {/* ========== CREATE ROOM VIEW ========== */}
            {activeView === "create-room" && (
              <div className="max-w-2xl mx-auto">
                {/* Header with Progress Steps */}
                <div className="mb-6">
                  <h2
                    className="text-[#4A3000] text-lg font-bold tracking-wider mb-4"
                    style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
                  >
                    CREATE ROOM
                  </h2>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className="flex items-center">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                            createRoomStep >= step
                              ? "bg-[#D4A84B] text-[#4A3000]"
                              : "bg-[#8B6914]/30 text-[#4A3000]/50"
                          }`}
                        >
                          {step}
                        </div>
                        {step < 4 && (
                          <div
                            className={`w-8 h-1 mx-1 ${
                              createRoomStep > step ? "bg-[#D4A84B]" : "bg-[#8B6914]/30"
                            }`}
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-6 mt-2 text-xs text-[#4A3000]/70">
                    <span>Basic Info</span>
                    <span>AI Strategy</span>
                    <span>Choose</span>
                    <span>Review</span>
                  </div>
                </div>

                {/* Step 1: Basic Information */}
                {createRoomStep === 1 && (
                  <div className="space-y-6">
                    <h3 className="text-[#4A3000] font-bold text-lg mb-4">Basic Information</h3>

                    <div>
                      <label className="block text-[#4A3000] font-semibold mb-2">Room Name</label>
                      <input
                        type="text"
                        placeholder="e.g., Emergency Fund, Vacation Savings"
                        value={roomName}
                        onChange={(e) => setRoomName(e.target.value)}
                        className="w-full px-4 py-3 bg-[#E8D5A8] rounded-lg border-2 border-[#D4A84B]/40 text-[#4A3000] placeholder-[#8B6914]/60 focus:outline-none focus:border-[#D4A84B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#4A3000] font-semibold mb-2">Duration (weeks)</label>
                      <input
                        type="number"
                        placeholder="e.g., 12"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full px-4 py-3 bg-[#E8D5A8] rounded-lg border-2 border-[#D4A84B]/40 text-[#4A3000] placeholder-[#8B6914]/60 focus:outline-none focus:border-[#D4A84B]"
                      />
                    </div>

                    <div>
                      <label className="block text-[#4A3000] font-semibold mb-2">Weekly Target ($)</label>
                      <input
                        type="number"
                        placeholder="e.g., 100"
                        value={weeklyTarget}
                        onChange={(e) => setWeeklyTarget(e.target.value)}
                        className="w-full px-4 py-3 bg-[#E8D5A8] rounded-lg border-2 border-[#D4A84B]/40 text-[#4A3000] placeholder-[#8B6914]/60 focus:outline-none focus:border-[#D4A84B]"
                      />
                    </div>

                    {/* Privacy Settings */}
                    <div className="border-t-2 border-dashed border-[#D4A84B]/40 pt-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isPrivate}
                          onChange={(e) => setIsPrivate(e.target.checked)}
                          className="w-5 h-5 accent-[#D4A84B]"
                        />
                        <span className="text-[#4A3000] font-semibold">Make this a private room</span>
                      </label>
                      {isPrivate && (
                        <div className="mt-3 bg-purple-100 border border-purple-300 rounded-lg p-3">
                          <p className="text-purple-800 text-sm">🔒 A secure password will be automatically generated for this room.</p>
                        </div>
                      )}
                    </div>

                    {/* Test Mode */}
                    <div className="border-t-2 border-dashed border-[#D4A84B]/40 pt-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isTestMode}
                          onChange={(e) => setIsTestMode(e.target.checked)}
                          className="w-5 h-5 accent-[#FF8C00]"
                        />
                        <span className="text-[#4A3000] font-semibold">🧪 Enable Test Mode (1 minute periods)</span>
                      </label>
                      {isTestMode && (
                        <div className="mt-3 bg-orange-100 border border-orange-300 rounded-lg p-3">
                          <p className="text-orange-800 text-sm">⚡ Each "week" will be only 1 minute long for testing.</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setCreateRoomStep(2)}
                      disabled={!roomName || !duration || !weeklyTarget}
                      className="w-full py-3 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg hover:from-[#FFC967] hover:to-[#FFA030] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next: AI Strategy
                    </button>
                  </div>
                )}

                {/* Step 2: AI Strategy */}
                {createRoomStep === 2 && (
                  <div className="space-y-6">
                    <h3 className="text-[#4A3000] font-bold text-lg mb-4">AI Strategy Recommendation</h3>
                    <p className="text-[#6B4F0F]">Describe your saving goals and let AI recommend the best strategy</p>

                    {formError && (
                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm">{formError}</p>
                      </div>
                    )}

                    <div>
                      <label className="block text-[#4A3000] font-semibold mb-2">What are you saving for?</label>
                      <textarea
                        placeholder="e.g., I want to build an emergency fund for unexpected expenses. I prefer low risk and steady growth."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 bg-[#E8D5A8] rounded-lg border-2 border-[#D4A84B]/40 text-[#4A3000] placeholder-[#8B6914]/60 focus:outline-none focus:border-[#D4A84B] resize-none"
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setCreateRoomStep(1)}
                        disabled={aiLoading}
                        className="flex-1 py-3 bg-[#8B6914]/30 text-[#4A3000] font-bold rounded-lg border-2 border-[#8B6914]/50 hover:bg-[#8B6914]/40 transition-all disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleAISubmit}
                        disabled={!aiPrompt || aiLoading}
                        className="flex-1 py-3 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg hover:from-[#FFC967] hover:to-[#FFA030] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {aiLoading ? "Analyzing..." : "Get AI Recommendations"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Choose Strategy */}
                {createRoomStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-[#4A3000] font-bold text-lg mb-2">AI Recommendations</h3>
                    <p className="text-[#6B4F0F] text-sm">Based on: "{aiPrompt}"</p>

                    {formError && (
                      <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm">{formError}</p>
                      </div>
                    )}

                    <div className="grid gap-4">
                      {strategies.map((strategy) => (
                        <div
                          key={strategy.id}
                          onClick={() => setSelectedStrategy(strategy.id)}
                          className={`p-4 rounded-xl cursor-pointer transition-all border-2 ${
                            selectedStrategy === strategy.id
                              ? "bg-[#E8D5A8] border-[#D4A84B] shadow-lg"
                              : "bg-[#E8D5A8]/50 border-[#D4A84B]/30 hover:border-[#D4A84B]/60"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-[#4A3000] text-lg">{strategy.name}</h4>
                            {selectedStrategy === strategy.id && (
                              <span className="text-green-600 font-bold">✓</span>
                            )}
                          </div>
                          <div className="flex gap-6 text-sm mb-2">
                            <span className="text-green-600">Return: {strategy.expectedReturn}%</span>
                            <span className="text-orange-600">Risk: {strategy.risk}%</span>
                          </div>
                          <p className="text-[#6B4F0F] text-sm">{strategy.description}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setCreateRoomStep(2)}
                        className="flex-1 py-3 bg-[#8B6914]/30 text-[#4A3000] font-bold rounded-lg border-2 border-[#8B6914]/50 hover:bg-[#8B6914]/40 transition-all"
                      >
                        Back
                      </button>
                      <button
                        onClick={() => setCreateRoomStep(4)}
                        disabled={selectedStrategy === null}
                        className="flex-1 py-3 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg hover:from-[#FFC967] hover:to-[#FFA030] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next: Review
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Review */}
                {createRoomStep === 4 && (
                  <div className="space-y-6">
                    <h3 className="text-[#4A3000] font-bold text-lg mb-4">Review & Confirm</h3>

                    {formError && (
                      <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                        <p className="text-red-800 text-sm">{formError}</p>
                      </div>
                    )}

                    <div className="bg-[#E8D5A8] rounded-xl p-4 space-y-3">
                      <div className="flex justify-between py-2 border-b border-[#D4A84B]/30">
                        <span className="text-[#6B4F0F]">Room Name</span>
                        <span className="font-bold text-[#4A3000]">{roomName}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#D4A84B]/30">
                        <span className="text-[#6B4F0F]">Duration</span>
                        <span className="font-bold text-[#4A3000]">{duration} weeks</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#D4A84B]/30">
                        <span className="text-[#6B4F0F]">Weekly Target</span>
                        <span className="font-bold text-[#4A3000]">${weeklyTarget}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#D4A84B]/30">
                        <span className="text-[#6B4F0F]">Total Goal</span>
                        <span className="font-bold text-green-600">${Number(weeklyTarget) * Number(duration)}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#D4A84B]/30">
                        <span className="text-[#6B4F0F]">Strategy</span>
                        <span className="font-bold text-[#4A3000]">{strategies.find(s => s.id === selectedStrategy)?.name || "N/A"}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-[#D4A84B]/30">
                        <span className="text-[#6B4F0F]">Room Type</span>
                        <span className="font-bold text-[#4A3000]">{isPrivate ? "🔒 Private" : "🌐 Public"}</span>
                      </div>
                      {isTestMode && (
                        <div className="flex justify-between py-2">
                          <span className="text-[#6B4F0F]">Mode</span>
                          <span className="font-bold text-orange-600">🧪 Test Mode</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
                      <p className="font-semibold text-yellow-900 mb-2">⚠️ Important</p>
                      <ul className="text-yellow-800 text-sm space-y-1 list-disc list-inside">
                        <li>Strategy cannot be changed once the room starts</li>
                        <li>Deposits must be made weekly</li>
                        <li>Rewards distributed at the end based on consistency</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setCreateRoomStep(3)}
                        disabled={createLoading}
                        className="flex-1 py-3 bg-[#8B6914]/30 text-[#4A3000] font-bold rounded-lg border-2 border-[#8B6914]/50 hover:bg-[#8B6914]/40 transition-all disabled:opacity-50"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleCreateRoom}
                        disabled={createLoading}
                        className="flex-1 py-3 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg hover:from-[#FFC967] hover:to-[#FFA030] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createLoading ? "Creating..." : "Create Room"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========== DASHBOARD VIEW ========== */}
            {activeView === "dashboard" && (
              <>
                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                  <button
                    onClick={() => setActiveTab("active")}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                      activeTab === "active"
                        ? 'bg-[#D4A84B] text-[#4A3000] shadow-lg'
                        : 'bg-[#8B6914]/30 text-[#4A3000]/70 hover:bg-[#8B6914]/50'
                    }`}
                  >
                    Active Rooms ({activeRooms.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("my-rooms")}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                      activeTab === "my-rooms"
                        ? 'bg-[#D4A84B] text-[#4A3000] shadow-lg'
                        : 'bg-[#8B6914]/30 text-[#4A3000]/70 hover:bg-[#8B6914]/50'
                    }`}
                  >
                    My Rooms ({myRooms.length})
                  </button>
                  <button
                    onClick={() => setActiveTab("ended")}
                    className={`px-6 py-2 rounded-full font-semibold transition-all ${
                      activeTab === "ended"
                        ? 'bg-[#D4A84B] text-[#4A3000] shadow-lg'
                        : 'bg-[#8B6914]/30 text-[#4A3000]/70 hover:bg-[#8B6914]/50'
                    }`}
                  >
                    Ended ({endedRooms.length})
                  </button>
                </div>

            {/* Room Cards */}
            <div className="space-y-4">
              {activeTab === "active" && (
                loading ? (
                  <div className="text-center py-12 text-[#4A3000]/70">Loading...</div>
                ) : activeRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#4A3000]/70 mb-4">No active rooms available.</p>
                    <button
                      onClick={() => setActiveView("create-room")}
                      className="px-6 py-2 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg hover:from-[#FFC967] hover:to-[#FFA030] transition-all"
                    >
                      Create Your First Room
                    </button>
                  </div>
                ) : (
                  activeRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => router.push(`/room/${room.id}`)}
                      className="bg-[#E8D5A8] rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-[#D4A84B]/40 hover:border-[#D4A84B]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-[#4A3000] text-lg">{room.name}</h3>
                          <p className="text-[#6B4F0F] text-sm">{room.participants} participants - {room.strategy}</p>
                        </div>
                        <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                          Active
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#6B4F0F]">Progress</span>
                          <span className="font-medium text-[#4A3000]">Week {room.currentPeriod} of {room.totalPeriods}</span>
                        </div>
                        <div className="w-full bg-[#8B6914]/30 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-[#FFB347] to-[#FF8C00] h-3 rounded-full transition-all"
                            style={{ width: `${(room.currentPeriod / room.totalPeriods) * 100}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                          <span className="text-[#6B4F0F]">Your Deposit: <strong className="text-[#4A3000]">${room.myDeposit}</strong></span>
                          <span className="text-[#6B4F0F]">Total Pool: <strong className="text-[#4A3000]">${room.totalDeposit}</strong></span>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {activeTab === "my-rooms" && (
                myRoomsLoading ? (
                  <div className="text-center py-12 text-[#4A3000]/70">Loading...</div>
                ) : myRooms.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[#4A3000]/70 mb-4">You haven't joined any rooms yet.</p>
                    <button
                      onClick={() => setActiveView("create-room")}
                      className="px-6 py-2 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg"
                    >
                      Join or Create a Room
                    </button>
                  </div>
                ) : (
                  myRooms.map((room) => (
                    <div
                      key={room.roomId}
                      onClick={() => router.push(`/room/${room.roomId}`)}
                      className="bg-[#E8D5A8] rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-[#D4A84B]/40 hover:border-[#D4A84B]"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-bold text-[#4A3000] text-lg flex items-center gap-2">
                            Room #{room.roomId.slice(0, 8)}...
                            {room.isPrivate && (
                              <span className="px-2 py-0.5 bg-purple-500 text-white text-xs rounded-full">Private</span>
                            )}
                          </h3>
                          <p className="text-[#6B4F0F] text-sm">{room.depositsCount} deposits - Strategy {room.strategyId}</p>
                        </div>
                        <span className={`px-3 py-1 text-white text-xs font-bold rounded-full ${
                          room.status === 0 ? 'bg-green-500' : room.status === 1 ? 'bg-yellow-500' : 'bg-gray-500'
                        }`}>
                          {room.status === 0 ? 'Active' : room.status === 1 ? 'Claiming' : 'Ended'}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-[#6B4F0F]">Your Deposit</span>
                          <p className="font-bold text-green-600">${room.myDeposit} USDC</p>
                        </div>
                        <div>
                          <span className="text-[#6B4F0F]">Weekly Target</span>
                          <p className="font-bold text-[#4A3000]">${(room.depositAmount / 1_000_000).toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-[#6B4F0F]">Duration</span>
                          <p className="font-bold text-[#4A3000]">{room.totalPeriods} weeks</p>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}

              {activeTab === "ended" && (
                endedRooms.length === 0 ? (
                  <div className="text-center py-12 text-[#4A3000]/70">No ended rooms yet.</div>
                ) : (
                  endedRooms.map((room) => (
                    <div
                      key={room.id}
                      onClick={() => router.push(`/room/${room.id}`)}
                      className="bg-[#E8D5A8] rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all border-2 border-[#D4A84B]/40 hover:border-[#D4A84B]"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-[#4A3000] text-lg">{room.name}</h3>
                          <p className="text-[#6B4F0F] text-sm">{room.participants} participants - {room.strategy}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-gray-500 text-white text-xs font-bold rounded-full">
                            Ended
                          </span>
                          <button className="px-4 py-1 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg text-sm border border-[#D4A84B]">
                            Claim Rewards
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
              </>
            )}

            {/* ========== JOIN ROOM VIEW ========== */}
            {activeView === "join-room" && (
              <div className="max-w-lg mx-auto">
                <h2
                  className="text-[#4A3000] text-lg font-bold tracking-wider mb-2"
                  style={{ fontFamily: "'Press Start 2P', 'Courier New', monospace" }}
                >
                  JOIN ROOM
                </h2>
                <p className="text-[#6B4F0F] mb-6">Enter the Room ID or Password to join a private room</p>

                {joinError && (
                  <div className="bg-red-100 border border-red-300 rounded-lg p-3 mb-4">
                    <p className="text-red-800 text-sm">{joinError}</p>
                  </div>
                )}

                {/* Option 1: Join by Password */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#D4A84B]/40"></div>
                    <span className="text-xs text-[#6B4F0F] font-medium">OPTION 1: USE PASSWORD</span>
                    <div className="h-px flex-1 bg-[#D4A84B]/40"></div>
                  </div>

                  <div>
                    <label className="block text-[#4A3000] font-semibold mb-2">Password</label>
                    <input
                      type="text"
                      placeholder="Enter 8-character password"
                      value={joinPassword}
                      onChange={(e) => {
                        setJoinPassword(e.target.value);
                        setJoinError("");
                      }}
                      className="w-full px-4 py-3 bg-[#E8D5A8] rounded-lg border-2 border-[#D4A84B]/40 text-[#4A3000] placeholder-[#8B6914]/60 focus:outline-none focus:border-[#D4A84B]"
                    />
                    <p className="text-xs text-[#6B4F0F] mt-1">Enter the password shared by the room creator</p>
                  </div>

                  <button
                    onClick={handleJoinByPassword}
                    disabled={joinLoading}
                    className="w-full py-3 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg hover:from-[#FFC967] hover:to-[#FFA030] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {joinLoading ? "Searching..." : "Find Room by Password"}
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="h-px flex-1 bg-[#D4A84B]/40"></div>
                  <span className="text-xs text-[#6B4F0F] font-medium">OR</span>
                  <div className="h-px flex-1 bg-[#D4A84B]/40"></div>
                </div>

                {/* Option 2: Join by Room ID */}
                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-2">
                    <div className="h-px flex-1 bg-[#D4A84B]/40"></div>
                    <span className="text-xs text-[#6B4F0F] font-medium">OPTION 2: USE ROOM ID</span>
                    <div className="h-px flex-1 bg-[#D4A84B]/40"></div>
                  </div>

                  <div>
                    <label className="block text-[#4A3000] font-semibold mb-2">Room ID</label>
                    <input
                      type="text"
                      placeholder="0x..."
                      value={joinRoomId}
                      onChange={(e) => {
                        setJoinRoomId(e.target.value);
                        setJoinError("");
                      }}
                      className="w-full px-4 py-3 bg-[#E8D5A8] rounded-lg border-2 border-[#D4A84B]/40 text-[#4A3000] placeholder-[#8B6914]/60 focus:outline-none focus:border-[#D4A84B] font-mono text-sm"
                    />
                    <p className="text-xs text-[#6B4F0F] mt-1">Paste the full Room ID (starts with 0x)</p>
                  </div>

                  <button
                    onClick={handleJoinByRoomId}
                    className="w-full py-3 bg-[#8B6914]/30 text-[#4A3000] font-bold rounded-lg border-2 border-[#8B6914]/50 hover:bg-[#8B6914]/40 transition-all"
                  >
                    Continue to Room
                  </button>
                </div>

                {/* Info Box */}
                <div className="bg-[#E8D5A8] border-2 border-[#D4A84B]/40 rounded-lg p-4">
                  <p className="text-sm text-[#6B4F0F]">
                    💡 The room creator should have shared either the password or the Room ID with you. You only need one of them to join.
                  </p>
                </div>
              </div>
            )}

            {/* ========== HISTORY VIEW ========== */}
            {activeView === "history" && (
              <div className="text-center py-12">
                <h3 className="text-[#4A3000] font-bold text-lg mb-4">History</h3>
                <p className="text-[#6B4F0F]">Your transaction history will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Password Modal for Private Rooms */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-[#E8D5A8] rounded-2xl p-6 max-w-lg w-full shadow-2xl border-4 border-[#D4A84B]">
              <h3 className="text-[#4A3000] font-bold text-xl mb-2">🔒 Private Room Created!</h3>
              <p className="text-[#6B4F0F] text-sm mb-4">Save this information - it will only be shown once</p>

              {/* Room ID */}
              <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-900">Room ID:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(createdRoomId);
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-white rounded p-2 font-mono text-xs break-all">
                  {createdRoomId}
                </div>
              </div>

              {/* Password */}
              <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-900">Room Password:</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPassword);
                    }}
                    className="text-xs text-purple-600 hover:text-purple-800 underline"
                  >
                    Copy
                  </button>
                </div>
                <div className="bg-white rounded p-3 font-mono text-2xl font-bold text-center tracking-wider">
                  {generatedPassword}
                </div>
              </div>

              <button
                onClick={() => {
                  const inviteText = `Join my private room!\n\nRoom ID: ${createdRoomId}\nPassword: ${generatedPassword}`;
                  navigator.clipboard.writeText(inviteText);
                }}
                className="w-full mb-3 py-2 bg-[#8B6914]/30 text-[#4A3000] font-bold rounded-lg border-2 border-[#8B6914]/50 hover:bg-[#8B6914]/40 transition-all"
              >
                📋 Copy Both (Room ID + Password)
              </button>

              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3 mb-4">
                <p className="text-xs text-yellow-800">
                  ⚠️ <strong>Important:</strong> This information will not be shown again.
                </p>
              </div>

              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  resetCreateRoomForm();
                  setActiveView("dashboard");
                  fetchRooms();
                }}
                className="w-full py-3 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg"
              >
                I've Saved the Information - Continue
              </button>
            </div>
          </div>
        )}

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
