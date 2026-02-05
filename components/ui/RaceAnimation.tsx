'use client';

import { useState, useEffect } from 'react';
import { FaCar, FaTrophy, FaMedal, FaFlagCheckered } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

interface Racer {
    id: number;
    name: string;
    avatar: string;
    carColor: string;
    bgGradient: string;
    speed: number;
    position: number;
    isWinner: boolean;
    savings: number; // Mock savings amount
}

const initialRacers: Racer[] = [
    { id: 1, name: 'Alex.sui', avatar: '🦊', carColor: 'text-emerald-400', bgGradient: 'from-emerald-500 to-teal-600', speed: 0, position: 0, isWinner: false, savings: 450 },
    { id: 2, name: 'Sarah.sui', avatar: '🐱', carColor: 'text-blue-400', bgGradient: 'from-blue-500 to-indigo-600', speed: 0, position: 0, isWinner: false, savings: 380 },
    { id: 3, name: 'Mike.sui', avatar: '🐻', carColor: 'text-purple-400', bgGradient: 'from-purple-500 to-pink-600', speed: 0, position: 0, isWinner: false, savings: 290 },
    { id: 4, name: 'You', avatar: '⭐', carColor: 'text-amber-400', bgGradient: 'from-amber-400 to-orange-500', speed: 0, position: 0, isWinner: false, savings: 520 },
    { id: 5, name: 'Emma.sui', avatar: '🦄', carColor: 'text-pink-400', bgGradient: 'from-pink-500 to-rose-600', speed: 0, position: 0, isWinner: false, savings: 340 },
];

export function RaceAnimation() {
    const [racers, setRacers] = useState<Racer[]>(initialRacers);
    const [raceComplete, setRaceComplete] = useState(false);
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        // Slower interval for smoother animation (50ms instead of 80ms)
        const interval = setInterval(() => {
            setRacers((prev) => {
                if (raceComplete) return prev;

                const updated = prev.map((racer) => {
                    if (racer.isWinner) return racer;

                    // Smoother speed increments (smaller values)
                    const baseSpeed = racer.name === 'You' ? 1.2 : 0.8;
                    const savingsBonus = racer.savings / 800;
                    const randomFactor = Math.random() * 0.8;
                    const increment = baseSpeed + savingsBonus + randomFactor;

                    const newSpeed = Math.min(racer.speed + increment, 100);
                    return { ...racer, speed: newSpeed };
                });

                // Sort by speed to determine positions
                const sorted = [...updated].sort((a, b) => b.speed - a.speed);
                const withPositions = updated.map((r) => ({
                    ...r,
                    position: sorted.findIndex((s) => s.id === r.id) + 1,
                }));

                // Check for winner
                const winner = withPositions.find((r) => r.speed >= 100 && !r.isWinner);
                if (winner) {
                    setRaceComplete(true);
                    return withPositions.map((r) => ({
                        ...r,
                        isWinner: r.id === winner.id,
                    }));
                }

                return withPositions;
            });
        }, 50); // Faster updates = smoother animation

        // Countdown timer
        const countdownInterval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) return 10;
                return prev - 1;
            });
        }, 1000);

        // Reset race after 10 seconds
        const resetTimer = setTimeout(() => {
            setRacers(initialRacers.map((r) => ({ ...r, speed: 0, position: 0, isWinner: false })));
            setRaceComplete(false);
            setCountdown(10);
        }, 10000);

        return () => {
            clearInterval(interval);
            clearInterval(countdownInterval);
            clearTimeout(resetTimer);
        };
    }, [raceComplete]);

    const getPositionBadge = (position: number, isWinner: boolean) => {
        if (isWinner) return <FaTrophy className="w-4 h-4 text-yellow-400" />;
        if (position === 1) return <FaMedal className="w-3.5 h-3.5 text-yellow-400" />;
        if (position === 2) return <FaMedal className="w-3.5 h-3.5 text-gray-300" />;
        if (position === 3) return <FaMedal className="w-3.5 h-3.5 text-amber-600" />;
        return <span className="text-xs text-white/50">#{position}</span>;
    };

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D1F0F] via-[#3D2915] to-[#2D1F0F] p-6 md:p-8 border border-amber-500/30 shadow-2xl">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <div className="relative flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                        <FaFlagCheckered className="w-5 h-5 text-[#2D1F0F]" />
                    </div>
                    <div>
                        <h3 className="text-white text-lg font-bold">Live Savings Race</h3>
                        <p className="text-amber-200/60 text-xs">Who saves the most wins!</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-green-500/20 rounded-full border border-green-500/30 flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        <span className="text-green-400 text-xs font-bold">LIVE</span>
                    </div>
                    <div className="px-3 py-1.5 bg-amber-500/20 rounded-full border border-amber-500/30">
                        <span className="text-amber-300 text-xs font-mono font-bold">{countdown}s</span>
                    </div>
                </div>
            </div>

            {/* Race Track */}
            <div className="relative space-y-3">
                {racers.map((racer, index) => (
                    <div key={racer.id} className="relative group">
                        {/* Lane Container */}
                        <div className={`relative h-14 md:h-16 rounded-2xl overflow-hidden transition-all duration-300 ${racer.isWinner ? 'ring-2 ring-amber-400 ring-offset-2 ring-offset-[#2D1F0F]' : ''}`}>
                            {/* Track Background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5 border border-white/10" />

                            {/* Lane Markers */}
                            <div className="absolute inset-0 flex items-center">
                                {[20, 40, 60, 80].map((pos) => (
                                    <div key={pos} className="absolute h-full w-px bg-white/10" style={{ left: `${pos}%` }}>
                                        <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] text-white/30">{pos}%</span>
                                    </div>
                                ))}
                            </div>

                            {/* Progress Fill */}
                            <div
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${racer.bgGradient} opacity-30`}
                                style={{
                                    width: `${racer.speed}%`,
                                    transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            />

                            {/* Racer Car */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 flex items-center gap-2"
                                style={{
                                    left: `calc(${Math.min(racer.speed, 92)}% - 20px)`,
                                    transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                            >
                                {/* Car/Racer Badge */}
                                <div className={`relative flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r ${racer.bgGradient} shadow-lg border border-white/20 backdrop-blur-sm`}>
                                    {/* Avatar */}
                                    <span className="text-xl">{racer.avatar}</span>
                                    {/* Car Icon */}
                                    <FaCar className="w-5 h-5 text-white drop-shadow-lg" />
                                    {/* Speed lines effect */}
                                    {racer.speed > 50 && (
                                        <div className="absolute -left-4 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-60">
                                            <div className="w-3 h-0.5 bg-white/40 rounded" />
                                            <div className="w-2 h-0.5 bg-white/30 rounded" />
                                            <div className="w-1 h-0.5 bg-white/20 rounded" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Racer Info - Left Side */}
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <div className="w-6 h-6 flex items-center justify-center">
                                    {getPositionBadge(racer.position, racer.isWinner)}
                                </div>
                                <div className="hidden md:block">
                                    <p className={`text-sm font-bold ${racer.name === 'You' ? 'text-amber-300' : 'text-white/90'}`}>
                                        {racer.name}
                                    </p>
                                    <p className="text-[10px] text-white/50">${racer.savings} saved</p>
                                </div>
                            </div>

                            {/* Winner Badge */}
                            {racer.isWinner && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-lg animate-pulse">
                                    <HiSparkles className="w-4 h-4 text-[#2D1F0F]" />
                                    <span className="text-[#2D1F0F] text-xs font-black uppercase">Winner!</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Finish Line */}
            <div className="absolute right-6 md:right-8 top-[100px] bottom-[60px] w-3 rounded-full overflow-hidden shadow-lg">
                {[...Array(16)].map((_, i) => (
                    <div key={i} className={`h-[6.25%] ${i % 2 === 0 ? 'bg-white' : 'bg-black'}`} />
                ))}
            </div>

            {/* Footer Stats */}
            <div className="relative mt-6 pt-4 border-t border-white/10">
                <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-lg flex items-center justify-center">
                            <FaTrophy className="w-4 h-4 text-[#2D1F0F]" />
                        </div>
                        <div>
                            <p className="text-white/50 text-xs">Prize Pool</p>
                            <p className="text-white font-bold">$1,980</p>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                            <span className="text-lg">👥</span>
                        </div>
                        <div>
                            <p className="text-white/50 text-xs">Racers</p>
                            <p className="text-white font-bold">{racers.length}</p>
                        </div>
                    </div>
                    <div className="w-px h-8 bg-white/10" />
                    <div className="text-center">
                        <p className="text-amber-200/70 text-xs">Save consistently to lead the race! 🏁</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
