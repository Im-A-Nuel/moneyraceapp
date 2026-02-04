"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { roomAPI } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import DashboardLayout from "@/components/DashboardLayout";

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

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [myRooms, setMyRooms] = useState<MyRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [myRoomsLoading, setMyRoomsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "my-rooms" | "ended">("active");
  const [activeRoomId, setActiveRoomId] = useState<string>("");

  useEffect(() => {
    fetchRooms();
    if (user?.address) {
      fetchMyRooms();
    }
  }, [user?.address]);

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

  const handleRoomClick = (roomId: string) => {
    setActiveRoomId(roomId);
    router.push(`/room/${roomId}`);
  };

  return (
    <DashboardLayout activeRoomId={activeRoomId}>
      {/* Search Bar */}
      <div className="flex justify-center mb-6">
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
            className="w-full pl-12 pr-4 py-3 bg-[#E8D5A8] rounded-full border-2 border-[#D4A84B]/40 text-[#4A3000] placeholder-[#8B6914]/60 focus:outline-none focus:border-[#D4A84B]"
          />
        </div>
      </div>

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
                onClick={() => router.push("/create-room")}
                className="px-6 py-2 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg hover:from-[#FFC967] hover:to-[#FFA030] transition-all"
              >
                Create Your First Room
              </button>
            </div>
          ) : (
            activeRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
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
                onClick={() => router.push("/create-room")}
                className="px-6 py-2 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg"
              >
                Join or Create a Room
              </button>
            </div>
          ) : (
            myRooms.map((room) => (
              <div
                key={room.roomId}
                onClick={() => handleRoomClick(room.roomId)}
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
                onClick={() => handleRoomClick(room.id)}
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
    </DashboardLayout>
  );
}
