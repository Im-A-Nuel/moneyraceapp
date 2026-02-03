"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { roomAPI, usdcAPI } from "@/lib/api";
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

  // Format address for display (0x1234...5678)
  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleLogout = () => {
    // Disconnect wallet if connected
    disconnect();
    // Clear auth state
    logout();
    // Redirect to landing page
    router.push('/');
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
        // Map backend room data to frontend format
        const mappedRooms = response.rooms.map((room: any) => {
          // Calculate current period
          const startTimeMs = Number(room.startTimeMs) || Date.now();
          const periodLengthMs = Number(room.periodLengthMs) || (7 * 24 * 60 * 60 * 1000);
          const now = Date.now();
          const elapsedMs = now - startTimeMs;

          let currentPeriod = 0;
          if (elapsedMs > 0) {
            currentPeriod = Math.floor(elapsedMs / periodLengthMs);
          }

          const totalPeriods = room.totalPeriods || 0;

          // Cap currentPeriod at totalPeriods
          const displayPeriod = Math.min(currentPeriod, totalPeriods);

          // Determine status
          const isEnded = currentPeriod >= totalPeriods;

          return {
            id: room.roomId, // Backend uses 'roomId'
            name: `Room #${room.roomId.slice(0, 8)}...`, // Generate name from ID
            duration: totalPeriods,
            weeklyTarget: room.depositAmount / 1_000_000 || 0, // Convert from USDC decimals (6 decimals)
            currentPeriod: displayPeriod,
            totalPeriods: totalPeriods,
            participants: 0, // TODO: Query from blockchain
            myDeposit: 0, // TODO: Calculate from user's position
            totalDeposit: 0, // TODO: Query from blockchain
            strategy: `Strategy ${room.strategyId}`,
            status: isEnded ? "ended" : "active",
          };
        });

        setRooms(mappedRooms);
      } else {
        console.log('No rooms found:', response.message);
        setRooms([]);
      }
    } catch (error: any) {
      console.error('Failed to fetch rooms:', error);
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  // Also need to fetch MyRooms inside fetchRooms or ensure they are synced. 
  // Actually simpler: Update rooms state when myRooms changes.
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Money<span className="text-blue-600">Race</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-600">
                {user?.email ? user.email : 'Connected Wallet'}
              </div>
              <div className="text-xs font-mono text-blue-600">
                {user?.address ? formatAddress(user.address) : 'No wallet'}
              </div>
              {user?.address && (
                <div className="text-sm font-semibold text-green-600 mt-1">
                  {balanceLoading ? (
                    <span className="text-gray-400">Loading...</span>
                  ) : (
                    <span>💰 {usdcBalance} USDC</span>
                  )}
                </div>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Saved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$700</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Rooms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeRooms.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">$45</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Consistency Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex flex-col md:flex-row gap-4">
          <Button
            size="lg"
            onClick={() => router.push("/create-room")}
            className="w-full md:w-auto"
          >
            + Create New Saving Room
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/join-private")}
            className="w-full md:w-auto"
          >
            🔒 Join Private Room
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/mint")}
            className="w-full md:w-auto"
          >
            💰 Mint USDC Tokens
          </Button>
        </div>

        {/* Rooms List */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Active Rooms ({activeRooms.length})
            </TabsTrigger>
            <TabsTrigger value="my-rooms">
              My Rooms ({myRooms.length})
            </TabsTrigger>
            <TabsTrigger value="ended">
              Ended Rooms ({endedRooms.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4 mt-4">
            {loading ? (
              <div className="text-center py-8">Loading...</div>
            ) : activeRooms.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600 mb-4">
                    You don't have any active saving rooms yet.
                  </p>
                  <Button onClick={() => router.push("/create-room")}>
                    Create Your First Room
                  </Button>
                </CardContent>
              </Card>
            ) : (
              activeRooms.map((room) => (
                <Card
                  key={room.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/room/${room.id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{room.name}</CardTitle>
                        <CardDescription>
                          {room.participants} participants • {room.strategy} Strategy
                        </CardDescription>
                      </div>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Active
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          Week {room.currentPeriod} of {room.totalPeriods}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(room.currentPeriod / room.totalPeriods) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-sm pt-2">
                        <div>
                          <span className="text-gray-600">Your Deposit: </span>
                          <span className="font-semibold">${room.myDeposit}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Pool: </span>
                          <span className="font-semibold">${room.totalDeposit}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="my-rooms" className="space-y-4 mt-4">
            {myRoomsLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : myRooms.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600 mb-4">
                    You haven't joined any rooms yet.
                  </p>
                  <Button onClick={() => router.push("/create-room")}>
                    Join or Create a Room
                  </Button>
                </CardContent>
              </Card>
            ) : (
              myRooms.map((room) => (
                <Card
                  key={room.roomId}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/room/${room.roomId}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          Room #{room.roomId.slice(0, 8)}...
                          {room.isPrivate && (
                            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">
                              🔒 Private
                            </span>
                          )}
                        </CardTitle>
                        <CardDescription>
                          {room.depositsCount} deposits made • Strategy {room.strategyId}
                        </CardDescription>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded ${room.status === 0
                        ? 'bg-green-100 text-green-800'
                        : room.status === 1
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {room.status === 0 ? 'Active' : room.status === 1 ? 'Claiming' : 'Ended'}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Your Total Deposit</span>
                        <span className="font-semibold text-green-600">
                          ${room.myDeposit} USDC
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Weekly Target</span>
                        <span className="font-medium">
                          ${(room.depositAmount / 1_000_000).toFixed(2)} USDC
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Duration</span>
                        <span className="font-medium">{room.totalPeriods} weeks</span>
                      </div>
                      <div className="text-xs text-gray-500 pt-2">
                        Joined: {new Date(room.joinedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="ended" className="space-y-4 mt-4">
            {endedRooms.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-gray-600">
                  No ended rooms yet.
                </CardContent>
              </Card>
            ) : (
              endedRooms.map((room) => (
                <Card
                  key={room.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => router.push(`/room/${room.id}`)}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{room.name}</CardTitle>
                        <CardDescription>
                          {room.participants} participants • {room.strategy} Strategy
                        </CardDescription>
                      </div>
                      <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        Ended
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-600">Your Deposit: </span>
                        <span className="font-semibold">${room.myDeposit}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Claim Rewards
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
