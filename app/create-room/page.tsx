"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { aiAPI, roomAPI, convertCreateRoomData, convertCreateRoomDataTestMode } from "@/lib/api";
import DashboardLayout from "@/components/DashboardLayout";

type Step = 1 | 2 | 3 | 4;

interface Strategy {
  id: number;
  name: string;
  expectedReturn: number;
  risk: number;
  description: string;
}

export default function CreateRoom() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // Form data
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
  const [error, setError] = useState<string>("");

  const handleAISubmit = async () => {
    setAiLoading(true);
    setError("");

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
        setCurrentStep(3);
      } else {
        setStrategies([
          { id: 0, name: "Stable", expectedReturn: 3.5, risk: 15, description: "Conservative approach with stable, low-risk deposits." },
          { id: 1, name: "Balanced", expectedReturn: 6.5, risk: 35, description: "Moderate risk-reward balance." },
          { id: 2, name: "Growth", expectedReturn: 12.0, risk: 60, description: "Aggressive strategy targeting higher returns." },
        ]);
        setCurrentStep(3);
      }
    } catch (err: any) {
      console.error("AI recommendation error:", err);
      setError(err.message || "Failed to get AI recommendations. Using default strategies.");
      setStrategies([
        { id: 0, name: "Stable", expectedReturn: 3.5, risk: 15, description: "Conservative approach with stable, low-risk deposits." },
        { id: 1, name: "Balanced", expectedReturn: 6.5, risk: 35, description: "Moderate risk-reward balance." },
        { id: 2, name: "Growth", expectedReturn: 12.0, risk: 60, description: "Aggressive strategy targeting higher returns." },
      ]);
      setCurrentStep(3);
    } finally {
      setAiLoading(false);
    }
  };

  const handleCreateRoom = async () => {
    if (selectedStrategy === null) {
      setError("Please select a strategy");
      return;
    }

    setCreateLoading(true);
    setError("");

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
          alert("Room created successfully!");
          router.push("/dashboard");
        }
      } else {
        setError(response.error || "Failed to create room");
      }
    } catch (err: any) {
      console.error("Create room error:", err);
      setError(err.response?.data?.error || err.message || "Failed to create room");
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#E8D5A8] rounded-2xl p-6 max-w-lg w-full shadow-2xl border-4 border-[#D4A84B]">
            <h3 className="text-[#4A3000] font-bold text-xl mb-2">🔒 Private Room Created!</h3>
            <p className="text-[#6B4F0F] text-sm mb-4">Save this information - it will only be shown once</p>

            <div className="bg-blue-100 border-2 border-blue-300 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-900">Room ID:</span>
                <button
                  onClick={() => navigator.clipboard.writeText(createdRoomId)}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  Copy
                </button>
              </div>
              <div className="bg-white rounded p-2 font-mono text-xs break-all">{createdRoomId}</div>
            </div>

            <div className="bg-purple-100 border-2 border-purple-300 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-purple-900">Room Password:</span>
                <button
                  onClick={() => navigator.clipboard.writeText(generatedPassword)}
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

            <button
              onClick={() => {
                setShowPasswordModal(false);
                router.push("/dashboard");
              }}
              className="w-full py-3 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg"
            >
              I've Saved the Information - Continue
            </button>
          </div>
        </div>
      )}

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
                    currentStep >= step
                      ? "bg-[#D4A84B] text-[#4A3000]"
                      : "bg-[#8B6914]/30 text-[#4A3000]/50"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-8 h-1 mx-1 ${currentStep > step ? "bg-[#D4A84B]" : "bg-[#8B6914]/30"}`} />
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
        {currentStep === 1 && (
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
              onClick={() => setCurrentStep(2)}
              disabled={!roomName || !duration || !weeklyTarget}
              className="w-full py-3 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg hover:from-[#FFC967] hover:to-[#FFA030] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next: AI Strategy
            </button>
          </div>
        )}

        {/* Step 2: AI Strategy */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-[#4A3000] font-bold text-lg mb-4">AI Strategy Recommendation</h3>
            <p className="text-[#6B4F0F]">Describe your saving goals and let AI recommend the best strategy</p>

            {error && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">{error}</p>
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
                onClick={() => setCurrentStep(1)}
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
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-[#4A3000] font-bold text-lg mb-2">AI Recommendations</h3>
            <p className="text-[#6B4F0F] text-sm">Based on: "{aiPrompt}"</p>

            {error && (
              <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                <p className="text-yellow-800 text-sm">{error}</p>
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
                    {selectedStrategy === strategy.id && <span className="text-green-600 font-bold">✓</span>}
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
                onClick={() => setCurrentStep(2)}
                className="flex-1 py-3 bg-[#8B6914]/30 text-[#4A3000] font-bold rounded-lg border-2 border-[#8B6914]/50 hover:bg-[#8B6914]/40 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setCurrentStep(4)}
                disabled={selectedStrategy === null}
                className="flex-1 py-3 bg-gradient-to-b from-[#FFB347] to-[#FF8C00] text-[#4A3000] font-bold rounded-lg border-2 border-[#D4A84B] shadow-lg hover:from-[#FFC967] hover:to-[#FFA030] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next: Review
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-[#4A3000] font-bold text-lg mb-4">Review & Confirm</h3>

            {error && (
              <div className="bg-red-100 border border-red-300 rounded-lg p-3">
                <p className="text-red-800 text-sm">{error}</p>
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
                onClick={() => setCurrentStep(3)}
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
    </DashboardLayout>
  );
}
