"use client";

import { useState, useEffect } from "react";
import { HiTrendingUp } from "react-icons/hi";
import { getApyFromStrategy } from "@/lib/helpers/strategy";

/**
 * Props for LiveYieldDisplay component
 */
interface LiveYieldDisplayProps {
    /** Principal amount in USDC (already formatted, not raw) */
    principal: number;
    /** Strategy name or ID for APY calculation */
    strategy: string | number;
    /** Optional start time in milliseconds for yield calculation */
    startTime?: number;
    /** Optional realized yield from blockchain */
    realizedYield?: number;
    /** Optional storage key for persisting yield state */
    storageKey?: string;
}

/**
 * LiveYieldDisplay Component
 * 
 * Displays an animated live yield calculation based on principal, 
 * APY from strategy, and elapsed time.
 * 
 * Used in Dashboard and Room Detail pages to show real-time yield growth.
 */
export function LiveYieldDisplay({
    principal,
    strategy,
    startTime,
    realizedYield = 0,
    storageKey,
}: LiveYieldDisplayProps) {
    const [yieldAmount, setYieldAmount] = useState(realizedYield);

    useEffect(() => {
        if (!principal || principal <= 0) {
            setYieldAmount(0);
            return;
        }

        const apy = getApyFromStrategy(strategy);
        // Calculate per-second yield: Principal * (APY/100) / (365 * 24 * 60 * 60)
        const secondsPerYear = 31536000;
        const yieldPerSecond = (principal * (apy / 100)) / secondsPerYear;

        // Initial accrued calculation (Simulated)
        const now = Date.now();
        const start = startTime || (now - 10000000); // Default to some time ago if missing
        const elapsedSeconds = (now - start) / 1000;
        const initialSimulated = yieldPerSecond * elapsedSeconds;

        // Hybrid Launch: Start at MAX(Realized, Simulated)
        setYieldAmount(Math.max(realizedYield, initialSimulated));

        // Update every 100ms
        const interval = setInterval(() => {
            setYieldAmount(prev => prev + (yieldPerSecond / 10));
        }, 100);

        return () => clearInterval(interval);
    }, [principal, strategy, startTime, realizedYield]);

    return (
        <div className="flex flex-col items-center">
            {/* Principal + Yield = Total Live Value */}
            <span className="font-bold text-[#4A3000] text-lg tabular-nums">
                ${(principal + yieldAmount).toLocaleString(undefined, {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6
                })}
            </span>
            <span className="text-green-600 text-[10px] font-bold flex items-center gap-1 animate-pulse">
                <HiTrendingUp /> +${yieldAmount.toFixed(6)}
            </span>
        </div>
    );
}
