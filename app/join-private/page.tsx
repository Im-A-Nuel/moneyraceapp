"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function JoinPrivateRoom() {
  const router = useRouter();
  const [roomId, setRoomId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinByRoomId = () => {
    if (!roomId || roomId.trim() === "") {
      setError("Please enter a room ID");
      return;
    }

    // Validate room ID format (should start with 0x)
    if (!roomId.startsWith("0x")) {
      setError("Invalid room ID format. Should start with 0x");
      return;
    }

    // Navigate to room page
    router.push(`/room/${roomId}`);
  };

  const handleJoinByPassword = async () => {
    if (!password || password.trim() === "") {
      setError("Please enter a password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/room/find-by-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || "Room not found with this password");
        setLoading(false);
        return;
      }

      // Navigate to the found room
      router.push(`/room/${data.roomId}`);
    } catch (err: any) {
      setError("Failed to search for room. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold">
            Money<span className="text-blue-600">Race</span>
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>🔒 Join Private Room</CardTitle>
            <CardDescription>
              Enter the Room ID or Password to join a private room
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded p-3">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Method 1: Join by Password */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-200"></div>
                <span className="text-xs text-gray-500 font-medium">OPTION 1: USE PASSWORD</span>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="text"
                  placeholder="Enter 8-character password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the password shared by the room creator
                </p>
              </div>

              <Button
                onClick={handleJoinByPassword}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Searching..." : "🔍 Find Room by Password"}
              </Button>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-gray-200"></div>
              <span className="text-xs text-gray-500 font-medium">OR</span>
              <div className="h-px flex-1 bg-gray-200"></div>
            </div>

            {/* Method 2: Join by Room ID */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-px flex-1 bg-gray-200"></div>
                <span className="text-xs text-gray-500 font-medium">OPTION 2: USE ROOM ID</span>
                <div className="h-px flex-1 bg-gray-200"></div>
              </div>

              <div>
                <Label htmlFor="roomId">Room ID</Label>
                <Input
                  id="roomId"
                  placeholder="0x..."
                  value={roomId}
                  onChange={(e) => {
                    setRoomId(e.target.value);
                    setError("");
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Paste the full Room ID (starts with 0x)
                </p>
              </div>

              <Button onClick={handleJoinByRoomId} className="w-full">
                Continue to Room
              </Button>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="text-xs text-blue-800">
                💡 The room creator should have shared either the password or the Room ID with you. You only need one of them to join.
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => router.push("/dashboard")}
              className="w-full"
            >
              ← Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
