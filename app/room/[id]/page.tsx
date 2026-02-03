"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { roomAPI, usdcAPI, playerAPI, executeSponsoredTransaction, getSponsorAddress } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { getCoinsForAmount } from "@/lib/sui-utils";
import { DEFAULT_COIN_TYPE, MIN_BALANCE_USDC, SUI_CLOCK_ID } from "@/lib/constants";
import { buildJoinRoomTx, buildDepositTx, buildClaimTx } from "@/lib/tx-builder";
import { buildSponsoredTx } from "@/lib/zklogin-tx";

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffMins > 0) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  return 'Just now';
}

// Helper function to format countdown time
function formatCountdown(seconds: number): string {
  if (seconds <= 0) return 'Now!';

  const days = Math.floor(seconds / (24 * 60 * 60));
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
  const mins = Math.floor((seconds % (60 * 60)) / 60);
  const secs = seconds % 60;

  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m ${secs}s`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

interface Participant {
  address: string;
  totalDeposit: number;
  depositsCount: number;
  consistencyScore: number;
}

export default function RoomDetail() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id as string;
  const { user } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [roomData, setRoomData] = useState<any>(null);
  const [playerPositionId, setPlayerPositionId] = useState<string | null>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [periodInfo, setPeriodInfo] = useState<{
    currentPeriod: number;
    timeUntilNextPeriod: number; // in seconds
    periodLengthMs: number;
    isTestMode: boolean;
  } | null>(null);
  const [hasDepositedThisPeriod, setHasDepositedThisPeriod] = useState(false);
  const [showFinalizeButton, setShowFinalizeButton] = useState(false);

  // Fetch room data on mount and check if user already joined
  useEffect(() => {
    if (roomId) {
      fetchRoomData();
      fetchParticipants();
      fetchHistory();
    }
    if (user?.address) {
      fetchUSDCBalance();
      // Check if current user already joined this room (using address-specific key)
      const storedPositionId = localStorage.getItem(`playerPosition_${roomId}_${user.address}`);
      if (storedPositionId) {
        setPlayerPositionId(storedPositionId);
        setIsJoined(true);
        // Fetch player position to check claimed status
        fetchPlayerPosition(storedPositionId);
      } else {
        // Reset if no stored position for this address
        setPlayerPositionId(null);
        setIsJoined(false);
        setHasClaimed(false);
      }
    }
  }, [roomId, user]);

  // Countdown timer for next period
  useEffect(() => {
    if (!periodInfo) return;

    const timer = setInterval(() => {
      setPeriodInfo(prev => {
        if (!prev) return null;
        if (prev.timeUntilNextPeriod <= 0) {
          // Period changed, refresh room data and history
          setHasDepositedThisPeriod(false); // Reset deposit status for new period
          fetchRoomData();
          fetchHistory(); // Refresh history to check deposit status for new period
          return prev;
        }
        return {
          ...prev,
          timeUntilNextPeriod: prev.timeUntilNextPeriod - 1,
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [periodInfo?.currentPeriod]);

  // Refetch participants when roomData becomes available to recalculate scores correctly
  useEffect(() => {
    if (roomId && roomData?.totalPeriods !== undefined) {
      fetchParticipants();
    }
  }, [roomData?.totalPeriods]);

  // Also check from participants list after fetching
  useEffect(() => {
    if (user?.address && participants.length > 0) {
      const isUserJoined = participants.some(
        p => p.address.toLowerCase() === user.address.toLowerCase()
      );
      if (isUserJoined && !isJoined) {
        // User is in participants but we don't have position ID locally
        // This means they joined from blockchain but localStorage was cleared
        setIsJoined(true);
        console.log('User found in participants list, marking as joined');
      }
    }
  }, [participants, user?.address]);

  // Check if user has deposited for the current period
  useEffect(() => {
    if (!user?.address || !history.length || periodInfo?.currentPeriod === undefined) {
      setHasDepositedThisPeriod(false);
      return;
    }

    // Check if there's a deposit from this user for the current period
    const currentPeriod = periodInfo.currentPeriod;
    const userDeposits = history.filter(tx =>
      tx.type === 'deposit' &&
      tx.player?.toLowerCase() === user.address.toLowerCase() &&
      tx.period === currentPeriod
    );

    // Also check for join transaction (join counts as first deposit, period 0)
    const userJoins = history.filter(tx =>
      tx.type === 'join' &&
      tx.player?.toLowerCase() === user.address.toLowerCase()
    );

    // If current period is 0, check if user has joined (join = first deposit)
    // If current period > 0, check if user has deposited for this period
    const hasDeposited = currentPeriod === 0
      ? userJoins.length > 0
      : userDeposits.length > 0;

    setHasDepositedThisPeriod(hasDeposited);
    console.log(`User deposit check - Period: ${currentPeriod}, Has deposited: ${hasDeposited}`);
  }, [history, user?.address, periodInfo?.currentPeriod]);

  // Show finalize button with 3 second delay when room periods are complete
  useEffect(() => {
    const shouldShowFinalize =
      roomData?.status === "active" &&
      isJoined &&
      roomData?.currentPeriod >= roomData?.totalPeriods;

    if (shouldShowFinalize && !showFinalizeButton) {
      // 3 second delay before showing finalize button
      const timer = setTimeout(() => {
        setShowFinalizeButton(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [roomData?.status, roomData?.currentPeriod, roomData?.totalPeriods, isJoined, showFinalizeButton]);

  const fetchParticipants = async () => {
    if (!roomId) return;
    try {
      // Fetch both participants and history together
      const [participantsResponse, historyResponse] = await Promise.all([
        roomAPI.getParticipants(roomId),
        roomAPI.getHistory(roomId)
      ]);

      // Process history first to count deposits per user
      const historyData = historyResponse.success ? historyResponse.history : [];
      setHistory(historyData);

      // Count deposits (including join as first deposit) per participant
      const depositCounts: Record<string, number> = {};
      const totalAmounts: Record<string, number> = {};
      const USDC_DECIMALS = 1_000_000;

      historyData.forEach((tx: any) => {
        const addr = tx.player?.toLowerCase();
        if (!addr) return;

        // Count both 'join' and 'deposit' - join is the first deposit (period 0)
        if (tx.type === 'join' || tx.type === 'deposit') {
          depositCounts[addr] = (depositCounts[addr] || 0) + 1;
          totalAmounts[addr] = (totalAmounts[addr] || 0) + (tx.amount / USDC_DECIMALS);
        }
      });

      if (participantsResponse.success && participantsResponse.participants) {
        // Expected deposits = total periods (join at period 0 counts as first deposit)
        const totalPeriods = roomData?.totalPeriods || 3;

        const formattedParticipants = participantsResponse.participants.map((p: any) => {
          const addr = p.address.toLowerCase();
          const depositsCount = depositCounts[addr] || 1; // At least 1 for joining
          const totalDeposit = totalAmounts[addr] || (p.amount / USDC_DECIMALS);

          // Consistency score = (actual deposits / total periods) * 100
          const consistencyScore = totalPeriods > 0
            ? Math.min(100, Math.round((depositsCount / totalPeriods) * 100))
            : 100;

          return {
            address: p.address,
            totalDeposit,
            depositsCount,
            consistencyScore,
          };
        });
        setParticipants(formattedParticipants);
      }
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  };

  const fetchHistory = async () => {
    if (!roomId) return;
    try {
      const response = await roomAPI.getHistory(roomId);
      if (response.success && response.history) {
        setHistory(response.history);
      }
    } catch (error) {
      console.error('Failed to fetch history:', error);
    }
  };

  const fetchUSDCBalance = async () => {
    if (!user?.address) return;
    try {
      const data = await usdcAPI.getBalance(user.address);
      setUsdcBalance(data.balanceFormatted || "0.00");
    } catch (error) {
      console.error('Failed to fetch USDC balance:', error);
      setUsdcBalance("0.00");
    }
  };

  const fetchPlayerPosition = async (positionId: string) => {
    try {
      const response = await playerAPI.getPosition(positionId);
      if (response.success && response.position?.fields) {
        const claimed = response.position.fields.claimed === true;
        setHasClaimed(claimed);
        console.log('Player position fetched:', { positionId, claimed });
      }
    } catch (error) {
      console.error('Failed to fetch player position:', error);
    }
  };

  const fetchRoomData = async () => {
    try {
      // Validasi Room ID sebelum fetch
      if (!roomId || roomId.length < 10) {
        console.warn("Invalid Room ID:", roomId);
        setError(`Invalid Room ID format. Received: ${roomId || 'undefined'}`);
        return;
      }

      console.log("Fetching room data for ID:", roomId);
      const response = await roomAPI.getRoom(roomId);

      if (response.success && response.room) {
        console.log("Room data from blockchain:", response.room);

        // Extract blockchain fields from response - check multiple possible paths
        const blockchainData = response.room.content?.fields || response.room.fields || response.room;
        console.log("Blockchain data fields:", blockchainData);

        // Parse status - can be number or string
        const statusValue = parseInt(blockchainData.status);
        console.log("Room status value:", statusValue, "raw:", blockchainData.status);

        let roomStatus: "pending" | "active" | "finished";
        if (statusValue === 1) {
          roomStatus = "active";
        } else if (statusValue === 2) {
          roomStatus = "finished";
        } else {
          roomStatus = "pending";
        }
        console.log("Parsed room status:", roomStatus);

        // USDC has 6 decimals
        const USDC_DECIMALS = 1_000_000;
        const rawDepositAmount = parseInt(blockchainData.deposit_amount) || 10;

        // Get period timing info
        const startTimeMs = parseInt(blockchainData.start_time_ms) || Date.now();
        const periodLengthMs = parseInt(blockchainData.period_length_ms) || (7 * 24 * 60 * 60 * 1000);
        const now = Date.now();
        const elapsedMs = now - startTimeMs;
        const currentPeriod = Math.max(0, Math.floor(elapsedMs / periodLengthMs));
        const nextPeriodStart = startTimeMs + ((currentPeriod + 1) * periodLengthMs);
        const timeUntilNextPeriod = Math.max(0, Math.floor((nextPeriodStart - now) / 1000));

        // Detect test mode (period length < 1 hour)
        const isTestMode = periodLengthMs < (60 * 60 * 1000);

        // Set period info for countdown
        setPeriodInfo({
          currentPeriod,
          timeUntilNextPeriod,
          periodLengthMs,
          isTestMode,
        });

        // Transform blockchain data to frontend format
        const transformedRoom = {
          id: roomId,
          name: `Room #${roomId.slice(0, 8)}`,
          creator: response.room.objectId || "Unknown",
          vaultId: response.room.vaultId || null, // ✓ Store vaultId from database
          deposit_amount: rawDepositAmount, // ✓ Store raw deposit amount for transactions
          duration: parseInt(blockchainData.total_periods) || 12,
          weeklyTarget: rawDepositAmount / USDC_DECIMALS, // Convert to USDC display value
          currentPeriod: currentPeriod, // Calculated from start_time
          totalPeriods: parseInt(blockchainData.total_periods) || 12,
          totalDeposit: 0, // TODO: Get from blockchain
          rewardPool: 0, // TODO: Get from blockchain
          strategy: blockchainData.strategy_id === 0 ? "Stable" : blockchainData.strategy_id === 1 ? "Growth" : "Aggressive",
          status: roomStatus,
          participants: [], // TODO: Query from blockchain
          isPrivate: blockchainData.is_private || false,
        };

        setRoomData(transformedRoom);
        setError(""); // Clear any previous errors
      }
    } catch (err: any) {
      console.error("Failed to fetch room data:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to fetch room data";
      const hint = err.response?.data?.hint || "";
      setError(`${errorMsg}${hint ? ` - ${hint}` : ''}`);
      // Use mock data as fallback
    }
  };

  // Mock data - replace with API call
  const room = roomData || {
    id: roomId,
    name: "Emergency Fund",
    creator: "0x123...abc",
    duration: 12,
    weeklyTarget: 100,
    currentPeriod: 3,
    totalPeriods: 12,
    totalDeposit: 1500,
    rewardPool: 150,
    strategy: "Stable",
    status: "active" as const,
    isPrivate: false,
    participants: [
      { address: "0x123...abc", totalDeposit: 300, depositsCount: 3, consistencyScore: 100 },
      { address: "0x456...def", totalDeposit: 300, depositsCount: 3, consistencyScore: 100 },
      { address: "0x789...ghi", totalDeposit: 200, depositsCount: 2, consistencyScore: 67 },
      { address: "0xabc...jkl", totalDeposit: 300, depositsCount: 3, consistencyScore: 100 },
      { address: "0xdef...mno", totalDeposit: 400, depositsCount: 4, consistencyScore: 133 },
    ],
  };

  const handleJoinRoom = async () => {
    if (!roomData?.vaultId) {
      setError("Vault ID not found. Please refresh the page.");
      return;
    }

    if (!user?.address) {
      setError("Please log in first to join a room.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get deposit amount from room data (already in raw blockchain format with decimals)
      const depositAmount = BigInt(roomData?.deposit_amount || 10_000_000); // Default 10 USDC
      console.log("Deposit amount (raw blockchain format):", depositAmount.toString());

      // Get coins that can be merged to meet the deposit amount
      console.log("Fetching USDC coins for address:", user.address);
      const coinResult = await getCoinsForAmount(user.address, depositAmount, DEFAULT_COIN_TYPE);
      console.log("Coin result:", {
        totalBalance: coinResult.totalBalance.toString(),
        canMeetAmount: coinResult.canMeetAmount,
        primaryCoin: coinResult.primaryCoin,
        coinsToMerge: coinResult.coinsToMerge.length
      });

      if (!coinResult.canMeetAmount || !coinResult.primaryCoin) {
        const weeklyTarget = roomData?.deposit_amount ? Number(roomData.deposit_amount) / 1_000_000 : 10;
        const totalUsdc = Number(coinResult.totalBalance) / 1_000_000;
        setError(`Insufficient USDC balance. Need $${weeklyTarget} but only have $${totalUsdc.toFixed(2)} total.`);
        setLoading(false);
        return;
      }

      console.log("Primary coin:", coinResult.primaryCoin);
      if (coinResult.coinsToMerge.length > 0) {
        console.log("Merging", coinResult.coinsToMerge.length, "additional coins");
      }

      const depositAmountNumber = Number(depositAmount);

      // Build the transaction with coin merging support
      const tx = buildJoinRoomTx({
        roomId: roomId,
        vaultId: roomData.vaultId,
        coinObjectId: coinResult.primaryCoin,
        coinsToMerge: coinResult.coinsToMerge,
        clockId: SUI_CLOCK_ID,
        depositAmount: depositAmountNumber,
        password: roomPassword || undefined, // Pass password if room is private
      });

      // Sign with ephemeral keypair and get txBytes + signature
      console.log("Building and signing transaction...");
      const { txBytes, userSignature } = await buildSponsoredTx(tx, user.address);
      console.log("Transaction signed by user");

      // Send to backend for sponsor signature and execution
      console.log("Sending to backend for execution...");
      const response = await executeSponsoredTransaction(txBytes, userSignature);

      if (response.success) {
        // Extract player position ID from transaction effects
        let positionId: string | undefined;

        if (response.effects?.created && response.effects.created.length > 0) {
          // The PlayerPosition object should be in the created objects
          const playerPosition = response.effects.created.find((obj: any) =>
            obj.objectType?.includes("PlayerPosition")
          );

          if (playerPosition) {
            positionId = playerPosition.reference.objectId;
          } else if (response.effects.created[0]) {
            // Fallback: use first created object
            positionId = response.effects.created[0].reference.objectId;
          }
        }

        if (positionId) {
          // Store player position ID in localStorage (include user address in key)
          localStorage.setItem(`playerPosition_${roomId}_${user.address}`, positionId);
          setPlayerPositionId(positionId);
          setIsJoined(true);
          alert("Successfully joined the room!");
          fetchRoomData(); // Refresh room data
          fetchParticipants(); // Refresh participants
        } else {
          setError("Room joined but could not extract player position ID");
        }
      } else {
        setError(response.error || "Failed to join room");
      }
    } catch (err: any) {
      console.error("Join room error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to join room";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    // Check if vaultId is available from room data
    if (!roomData?.vaultId) {
      setError("Vault ID not found. Please refresh the page or try again.");
      return;
    }

    // Check if user has joined the room
    if (!playerPositionId) {
      setError("You need to join this room first before making a deposit.");
      return;
    }

    if (!user?.address) {
      setError("Please log in first to make a deposit.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // Get deposit amount from room data (already in raw blockchain format with decimals)
      const depositAmountValue = roomData?.deposit_amount || 10_000_000; // Default 10 USDC
      console.log("Deposit amount (raw blockchain format):", depositAmountValue);

      // Get coins that can be merged to meet the deposit amount
      console.log("Fetching USDC coins for deposit from:", user.address);
      const coinResult = await getCoinsForAmount(user.address, BigInt(depositAmountValue), DEFAULT_COIN_TYPE);
      console.log("Coin result:", {
        totalBalance: coinResult.totalBalance.toString(),
        canMeetAmount: coinResult.canMeetAmount,
        primaryCoin: coinResult.primaryCoin,
        coinsToMerge: coinResult.coinsToMerge.length
      });

      if (!coinResult.canMeetAmount || !coinResult.primaryCoin) {
        const weeklyTarget = depositAmountValue / 1_000_000;
        const totalUsdc = Number(coinResult.totalBalance) / 1_000_000;
        setError(`Insufficient USDC balance. Need $${weeklyTarget} but only have $${totalUsdc.toFixed(2)} total.`);
        setLoading(false);
        return;
      }

      console.log("Primary coin:", coinResult.primaryCoin);
      if (coinResult.coinsToMerge.length > 0) {
        console.log("Merging", coinResult.coinsToMerge.length, "additional coins");
      }

      // Build the deposit transaction with coin merging support
      const tx = buildDepositTx({
        roomId: roomId,
        vaultId: roomData.vaultId,
        playerPositionId: playerPositionId,
        coinObjectId: coinResult.primaryCoin,
        coinsToMerge: coinResult.coinsToMerge,
        clockId: SUI_CLOCK_ID,
        depositAmount: depositAmountValue,
      });

      // Sign with ephemeral keypair
      console.log("Building and signing deposit transaction...");
      const { txBytes, userSignature } = await buildSponsoredTx(tx, user.address);
      console.log("Deposit transaction signed by user");

      // Send to backend for sponsor signature and execution
      console.log("Sending deposit to backend for execution...");
      const response = await executeSponsoredTransaction(txBytes, userSignature);

      if (response.success) {
        alert("Deposit successful!");
        window.location.reload(); // Refresh page to update all data
      } else {
        setError(response.error || "Failed to deposit");
      }
    } catch (err: any) {
      console.error("Deposit error:", err);
      const errorMsg = err.response?.data?.error || err.message || "Failed to deposit";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimReward = async () => {
    // Check if vaultId is available from room data
    if (!roomData?.vaultId) {
      setError("Vault ID not found. Please refresh the page or try again.");
      return;
    }

    // Check if user has joined the room
    if (!playerPositionId) {
      setError("You need to join this room first before claiming rewards.");
      return;
    }

    // Check if user is logged in
    if (!user?.address) {
      setError("Please login first");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Get sponsor address
      const sponsorData = await getSponsorAddress();
      const sponsorAddress = sponsorData.sponsorAddress;

      // 2. Build claim transaction
      const claimTx = buildClaimTx({
        roomId: roomId,
        vaultId: roomData.vaultId,
        playerPositionId: playerPositionId,
      });

      // 3. Build sponsored transaction with user as sender
      const { txBytes, userSignature } = await buildSponsoredTx(
        claimTx,
        user.address,
        sponsorAddress
      );

      // 4. Send to backend for sponsor co-signature and execution
      const response = await roomAPI.claimReward({
        txBytes,
        userSignature,
      });

      if (response.success) {
        alert("Rewards claimed successfully!");
        window.location.reload(); // Refresh page to update all data
      } else {
        setError(response.error || "Failed to claim rewards");
      }
    } catch (err: any) {
      console.error("Claim error:", err);
      setError(err.response?.data?.error || err.message || "Failed to claim rewards");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizeRoom = async () => {
    if (!roomId) {
      setError("Room ID not found.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await roomAPI.finalizeRoom(roomId);

      if (response.success) {
        alert("Room finalized successfully! Page will refresh...");
        // Refresh the page to get updated room status
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setError(response.error || "Failed to finalize room");
        setLoading(false);
      }
    } catch (err: any) {
      console.error("Finalize error:", err);
      setError(err.response?.data?.error || err.message || "Failed to finalize room");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">
            Money<span className="text-blue-600">Race</span>
          </h1>
          <div className="flex items-center gap-4">
            {user?.address && (
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">
                  💰 {usdcBalance} USDC
                </div>
                <button
                  onClick={() => router.push("/mint")}
                  className="text-xs text-blue-600 hover:text-blue-700 underline"
                >
                  Get more USDC
                </button>
              </div>
            )}
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              ← Back to Dashboard
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Alert - Show at top if there's an API error */}
        {error && !roomData && (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Unable to Load Room Data</h3>
            <p className="text-yellow-700 text-sm mb-2">{error}</p>
            <p className="text-xs text-yellow-600">
              Room ID: <code className="bg-yellow-100 px-2 py-1 rounded">{roomId}</code>
            </p>
            <p className="text-xs text-yellow-600 mt-2">
              💡 Tip: Make sure the room has been created on the blockchain first. Using mock data for now.
            </p>
          </div>
        )}

        {/* Room Header */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl font-bold">{room.name}</h2>
                {room.isPrivate && (
                  <span className="text-sm px-2 py-1 rounded bg-purple-100 text-purple-800">
                    🔒 Private
                  </span>
                )}
              </div>
              <p className="text-gray-600">
                {room.strategy} Strategy • Created by {room.creator}
              </p>
            </div>
            <span
              className={`text-xs px-3 py-1 rounded ${room.currentPeriod >= room.totalPeriods
                ? "bg-purple-100 text-purple-800"
                : room.status === "active"
                  ? "bg-green-100 text-green-800"
                  : room.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}
            >
              {room.currentPeriod >= room.totalPeriods
                ? "✓ Completed"
                : room.status === "active"
                  ? "Active"
                  : room.status === "pending"
                    ? "Pending"
                    : "Finished"}
            </span>
          </div>
        </div>

        {/* Test Mode Banner */}
        {periodInfo?.isTestMode && (
          <div className="mb-4 bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="text-orange-600 font-bold">🧪 TEST MODE</span>
              <span className="text-sm text-orange-700">
                Each period is 1 minute (instead of 1 week)
              </span>
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {room.currentPeriod >= room.totalPeriods ? (
                  <span className="text-green-600">✓ Completed</span>
                ) : (
                  <>{periodInfo?.isTestMode ? 'Period' : 'Week'} {room.currentPeriod}/{room.totalPeriods}</>
                )}
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className={`h-2 rounded-full ${room.currentPeriod >= room.totalPeriods ? 'bg-green-600' : 'bg-blue-600'}`}
                  style={{ width: `${Math.min(100, (room.currentPeriod / room.totalPeriods) * 100)}%` }}
                />
              </div>
              {/* Countdown to next period - only show if not completed */}
              {periodInfo && room.currentPeriod < room.totalPeriods && (
                <div className="mt-2 text-xs text-gray-600">
                  Next {periodInfo.isTestMode ? 'period' : 'week'} in:{' '}
                  <span className={`font-bold ${periodInfo.timeUntilNextPeriod <= 10 ? 'text-green-600' : ''}`}>
                    {formatCountdown(periodInfo.timeUntilNextPeriod)}
                  </span>
                </div>
              )}
              {/* Completed message */}
              {room.currentPeriod >= room.totalPeriods && (
                <div className="mt-2 text-xs text-green-600 font-medium">
                  All {room.totalPeriods} periods completed!
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Pool</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${participants.reduce((sum, p) => sum + p.totalDeposit, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Reward Pool</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">${room.rewardPool}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Participants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{participants.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left: Deposit & Actions */}
          <div className="md:col-span-1 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Join Room Button - Show if not joined yet */}
            {room.status === "active" && !isJoined && (() => {
              const userBalance = parseFloat(usdcBalance) || 0;
              const requiredAmount = room.weeklyTarget || 10;
              const hasEnoughBalance = userBalance >= requiredAmount;
              const roomAlreadyStarted = room.currentPeriod > 0;

              return (
                <Card>
                  <CardHeader>
                    <CardTitle>Join This Room</CardTitle>
                    <CardDescription>
                      {room.isPrivate ? "🔒 Private Room - Password Required" : "Join to start saving and compete with others"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Room Already Started Warning */}
                    {roomAlreadyStarted ? (
                      <div className="bg-orange-50 border border-orange-200 rounded p-3">
                        <p className="text-sm text-orange-800 font-semibold">⏰ Room Already Started</p>
                        <p className="text-xs text-orange-600 mt-1">
                          This room is currently in Period {room.currentPeriod}. You can only join rooms during Period 0.
                        </p>
                      </div>
                    ) : (
                      <div className="bg-blue-50 border border-blue-200 rounded p-3">
                        <p className="text-sm text-blue-800">
                          💡 Joining requires an initial deposit of <strong>${requiredAmount}</strong>.
                        </p>
                      </div>
                    )}

                    {/* Balance Check Warning - only show if room hasn't started */}
                    {!roomAlreadyStarted && !hasEnoughBalance && (
                      <div className="bg-red-50 border border-red-200 rounded p-3">
                        <p className="text-sm text-red-800 font-semibold">⚠️ Insufficient Balance</p>
                        <p className="text-xs text-red-600 mt-1">
                          You need at least <strong>${requiredAmount}</strong> USDC but only have <strong>${usdcBalance}</strong>.
                        </p>
                      </div>
                    )}

                    {/* Password input for private rooms - only show if room hasn't started */}
                    {!roomAlreadyStarted && room.isPrivate && (
                      <div>
                        <label className="text-sm font-medium">Room Password</label>
                        <Input
                          type="password"
                          placeholder="Enter room password"
                          value={roomPassword}
                          onChange={(e) => setRoomPassword(e.target.value)}
                          disabled={loading}
                        />
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleJoinRoom}
                      disabled={loading || roomAlreadyStarted || !hasEnoughBalance || (room.isPrivate && !roomPassword)}
                    >
                      {roomAlreadyStarted
                        ? "🚫 Room Already Started"
                        : loading
                          ? "Joining..."
                          : `🚀 Join Room + Deposit $${requiredAmount}`
                      }
                    </Button>
                    <p className="text-xs text-gray-500">
                      ⚠️ Gasless transaction powered by zkLogin
                    </p>
                    <p className="text-xs text-green-600">
                      Your balance: <strong>${usdcBalance}</strong> USDC
                    </p>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Room Completed Card - Show when all periods are done (active or finished status) */}
            {isJoined && room.currentPeriod >= room.totalPeriods && (room.status === "active" || room.status === "finished") && (
              <Card className="border-green-300 bg-green-50">
                <CardHeader>
                  <CardTitle className="text-green-800">🎉 Room Completed!</CardTitle>
                  <CardDescription>All {room.totalPeriods} periods have been completed</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {hasClaimed ? (
                    <div className="bg-green-100 border border-green-300 rounded p-4 text-center">
                      <p className="text-green-800 font-semibold">✅ Rewards Claimed!</p>
                      <p className="text-sm text-green-600 mt-1">
                        You have successfully claimed your principal and rewards.
                      </p>
                    </div>
                  ) : room.status === "finished" ? (
                    // Room is finalized, show claim button only
                    <>
                      <div className="bg-white border border-green-200 rounded p-3">
                        <p className="text-sm text-green-800 mb-2">
                          <strong>Congratulations!</strong> You have completed this saving room.
                        </p>
                        <p className="text-xs text-gray-600">
                          ✅ Room has been finalized. You can now claim your rewards!
                        </p>
                      </div>

                      <Button
                        className="w-full"
                        onClick={handleClaimReward}
                        disabled={loading}
                      >
                        {loading ? "Processing..." : "💰 Claim Rewards"}
                      </Button>
                    </>
                  ) : !showFinalizeButton ? (
                    // Waiting for 3 second delay before showing finalize button
                    <div className="bg-blue-50 border border-blue-200 rounded p-4 text-center">
                      <div className="animate-spin inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full mb-2"></div>
                      <p className="text-blue-800 font-semibold">Please wait...</p>
                      <p className="text-sm text-blue-600 mt-1">
                        Preparing finalize option...
                      </p>
                    </div>
                  ) : (
                    // Room not finalized yet, show manual finalize button
                    <>
                      <div className="bg-white border border-green-200 rounded p-3">
                        <p className="text-sm text-green-800 mb-2">
                          <strong>Congratulations!</strong> You have completed this saving room.
                        </p>
                        <p className="text-xs text-gray-600">
                          Click the button below to finalize and claim your rewards.
                        </p>
                      </div>

                      {error && (
                        <div className="bg-red-50 border border-red-200 rounded p-3">
                          <p className="text-xs text-red-800">
                            ⚠️ {error}
                          </p>
                        </div>
                      )}

                      <Button
                        className="w-full bg-green-600 hover:bg-green-700"
                        onClick={handleFinalizeRoom}
                        disabled={loading}
                      >
                        {loading ? "Finalizing..." : "🔧 Finalize Room"}
                      </Button>

                      <p className="text-xs text-gray-500 text-center">
                        After finalizing, the claim button will appear
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Deposit Card - Show only if joined AND periods not completed */}
            {room.status === "active" && isJoined && room.currentPeriod < room.totalPeriods && (
              <Card>
                <CardHeader>
                  <CardTitle>Make Deposit</CardTitle>
                  <CardDescription>
                    {periodInfo?.isTestMode ? 'Period' : 'Weekly'} target: ${room.weeklyTarget}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                    <p className="text-xs text-green-800">
                      ✓ You have joined this room
                    </p>
                  </div>

                  {/* Period Info */}
                  {periodInfo && (
                    <div className={`border rounded p-3 ${periodInfo.isTestMode ? 'bg-orange-50 border-orange-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="text-sm font-medium mb-1">
                        Current {periodInfo.isTestMode ? 'Period' : 'Week'}: {periodInfo.currentPeriod}
                      </div>
                      <div className="text-xs text-gray-600">
                        Next {periodInfo.isTestMode ? 'period' : 'week'} in:{' '}
                        <span className={`font-bold ${periodInfo.timeUntilNextPeriod <= 10 ? 'text-green-600 animate-pulse' : ''}`}>
                          {formatCountdown(periodInfo.timeUntilNextPeriod)}
                        </span>
                      </div>
                      {periodInfo.isTestMode && (
                        <div className="text-xs text-orange-600 mt-1">
                          🧪 Test mode: 1 min periods
                        </div>
                      )}
                    </div>
                  )}

                  {/* Already Deposited Message */}
                  {hasDepositedThisPeriod ? (
                    <div className="bg-green-100 border border-green-300 rounded p-4 text-center">
                      <p className="text-green-800 font-semibold">✅ Deposit Complete!</p>
                      <p className="text-sm text-green-600 mt-1">
                        You have already deposited for {periodInfo?.isTestMode ? 'Period' : 'Week'} {periodInfo?.currentPeriod || 0}.
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        Next deposit available in: <span className="font-bold">{formatCountdown(periodInfo?.timeUntilNextPeriod || 0)}</span>
                      </p>
                    </div>
                  ) : (() => {
                    const userBalance = parseFloat(usdcBalance) || 0;
                    const requiredAmount = room.weeklyTarget || 10;
                    const hasEnoughBalance = userBalance >= requiredAmount;

                    return (
                      <>
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 text-center">
                          <p className="text-sm text-blue-800">
                            Deposit amount: <span className="font-bold">${requiredAmount}</span>
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Your balance: <span className="font-semibold">${usdcBalance}</span> USDC
                          </p>
                        </div>

                        {/* Balance Check Warning */}
                        {!hasEnoughBalance && (
                          <div className="bg-red-50 border border-red-200 rounded p-3">
                            <p className="text-sm text-red-800 font-semibold">⚠️ Insufficient Balance</p>
                            <p className="text-xs text-red-600 mt-1">
                              You need <strong>${requiredAmount}</strong> USDC but only have <strong>${usdcBalance}</strong>.
                            </p>
                          </div>
                        )}

                        <Button
                          className="w-full"
                          onClick={handleDeposit}
                          disabled={loading || !hasEnoughBalance}
                        >
                          {loading ? "Processing..." : `💰 Deposit $${requiredAmount} for ${periodInfo?.isTestMode ? 'Period' : 'Week'} ${periodInfo?.currentPeriod || 0}`}
                        </Button>
                      </>
                    );
                  })()}

                  <p className="text-xs text-gray-500">
                    ⚠️ Gasless transaction powered by zkLogin
                  </p>
                  <p className="text-xs text-green-600">
                    ✓ Your wallet is connected. USDC tokens will be used automatically for this deposit.
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Fallback claim card for finished rooms when user hasn't joined via this UI */}
            {room.status === "finished" && !isJoined && (
              <Card>
                <CardHeader>
                  <CardTitle>Claim Rewards</CardTitle>
                  <CardDescription>Room has ended</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 border border-gray-200 rounded p-4 text-center">
                    <p className="text-gray-600">You did not join this room.</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Only participants who joined can claim rewards.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Share Room</CardTitle>
                <CardDescription>Invite friends to join</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={typeof window !== 'undefined' ? `${window.location.origin}/room/${roomId}` : `/room/${roomId}`}
                    className="text-sm"
                  />
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (typeof window !== 'undefined') {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/room/${roomId}`
                        );
                        alert("Link copied!");
                      }
                    }}
                  >
                    Copy
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right: Details & Participants */}
          <div className="md:col-span-2">
            <Tabs defaultValue="participants">
              <TabsList>
                <TabsTrigger value="participants">Participants</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="participants" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Leaderboard</CardTitle>
                    <CardDescription>Ranked by consistency score ({participants.length} participants)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {participants && participants.length > 0 ? (
                        participants
                          .sort((a: Participant, b: Participant) => b.consistencyScore - a.consistencyScore)
                          .map((participant: Participant, index: number) => (
                            <div
                              key={participant.address}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded"
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-gray-400">#{index + 1}</span>
                                <div>
                                  <div className="font-mono text-sm">
                                    {participant.address.slice(0, 8)}...{participant.address.slice(-6)}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {participant.depositsCount} deposits
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">${participant.totalDeposit.toFixed(2)}</div>
                                <div className="text-xs text-gray-600">
                                  {participant.consistencyScore}% score
                                </div>
                              </div>
                            </div>
                          ))
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No participants yet</p>
                          <p className="text-sm mt-2">Be the first to join this room!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Room Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Strategy</span>
                      <span className="font-semibold">{room.strategy}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Duration</span>
                      <span className="font-semibold">{room.duration} weeks</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Weekly Target</span>
                      <span className="font-semibold">${room.weeklyTarget}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Total Goal</span>
                      <span className="font-semibold">
                        ${room.weeklyTarget * room.totalPeriods}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Contract Address</span>
                      <span className="font-mono text-sm">0xabc...def</span>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>{history.length} transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {history.length > 0 ? (
                        history.map((tx, index) => {
                          const USDC_DECIMALS = 1_000_000;
                          const amount = (tx.amount / USDC_DECIMALS).toFixed(2);
                          const date = new Date(tx.timestamp);
                          const timeAgo = getTimeAgo(date);

                          return (
                            <div key={`${tx.txDigest}-${index}`} className="flex justify-between p-3 bg-gray-50 rounded text-sm">
                              <div>
                                <div className="font-semibold flex items-center gap-2">
                                  {tx.type === 'join' ? (
                                    <span className="text-green-600">🎉 Joined Room</span>
                                  ) : (
                                    <span className="text-blue-600">💰 Deposit</span>
                                  )}
                                </div>
                                <div className="text-gray-600 font-mono text-xs">
                                  {tx.player?.slice(0, 8)}...{tx.player?.slice(-6)}
                                </div>
                                {tx.type === 'deposit' && (
                                  <div className="text-gray-500 text-xs">Week {tx.period + 1}</div>
                                )}
                              </div>
                              <div className="text-right">
                                <div className="font-semibold">${amount}</div>
                                <div className="text-gray-600 text-xs">{timeAgo}</div>
                                <a
                                  href={`https://suiscan.xyz/testnet/tx/${tx.txDigest}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 text-xs hover:underline"
                                >
                                  View →
                                </a>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <p>No transactions yet</p>
                          <p className="text-sm mt-2">Join this room to start!</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
