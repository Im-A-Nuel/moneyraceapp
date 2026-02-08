'use client';

import { useState, useEffect, useCallback } from 'react';
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
    savings: number;
}

const initialRacers: Racer[] = [
    { id: 1, name: 'Alex.sui', avatar: '🦊', carColor: 'text-emerald-400', bgGradient: 'from-emerald-500 to-teal-600', speed: 0, position: 0, isWinner: false, savings: 450 },
    { id: 2, name: 'Sarah.sui', avatar: '🐱', carColor: 'text-blue-400', bgGradient: 'from-blue-500 to-indigo-600', speed: 0, position: 0, isWinner: false, savings: 380 },
    { id: 3, name: 'Mike.sui', avatar: '🐻', carColor: 'text-purple-400', bgGradient: 'from-purple-500 to-pink-600', speed: 0, position: 0, isWinner: false, savings: 290 },
    { id: 4, name: 'You', avatar: '⭐', carColor: 'text-amber-400', bgGradient: 'from-amber-400 to-orange-500', speed: 0, position: 0, isWinner: false, savings: 520 },
    { id: 5, name: 'Emma.sui', avatar: '🦄', carColor: 'text-pink-400', bgGradient: 'from-pink-500 to-rose-600', speed: 0, position: 0, isWinner: false, savings: 340 },
];

// Confetti particle
function Confetti() {
    const [particles] = useState(() =>
        Array.from({ length: 40 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            delay: Math.random() * 2,
            duration: 2 + Math.random() * 2,
            size: 4 + Math.random() * 6,
            color: ['#FFD700', '#FF6B35', '#FF1493', '#00CED1', '#7B68EE', '#32CD32', '#FF4500', '#FFB347'][Math.floor(Math.random() * 8)],
            rotation: Math.random() * 360,
        }))
    );

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
            {particles.map((p) => (
                <div
                    key={p.id}
                    className="absolute animate-confetti-fall"
                    style={{
                        left: `${p.x}%`,
                        top: '-10px',
                        width: `${p.size}px`,
                        height: `${p.size * 0.6}px`,
                        backgroundColor: p.color,
                        borderRadius: '2px',
                        transform: `rotate(${p.rotation}deg)`,
                        animationDelay: `${p.delay}s`,
                        animationDuration: `${p.duration}s`,
                    }}
                />
            ))}

            <style jsx>{`
                @keyframes confetti-fall {
                    0% {
                        transform: translateY(0) rotate(0deg) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(500px) rotate(720deg) scale(0.3);
                        opacity: 0;
                    }
                }
                .animate-confetti-fall {
                    animation: confetti-fall linear forwards;
                }
            `}</style>
        </div>
    );
}

// Sparkle burst around winner
function WinnerGlow() {
    return (
        <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-yellow-300/20 to-amber-400/10 animate-pulse rounded-2xl" />
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/0 via-yellow-400/30 to-amber-400/0 blur-xl animate-pulse rounded-2xl" />
        </div>
    );
}

// Winner celebration overlay
function WinnerOverlay({ winner }: { winner: Racer }) {
    return (
        <div className="absolute inset-0 z-30 flex items-center justify-center animate-winner-entrance">
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-3xl" />

            {/* Radial glow behind */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-80 h-80 bg-amber-400/20 rounded-full blur-[80px] animate-pulse" />
            </div>

            {/* Center card */}
            <div className="relative flex flex-col items-center gap-4 p-8 animate-winner-pop">
                {/* Rotating ring */}
                <div className="absolute -inset-4 border-2 border-dashed border-amber-400/40 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
                <div className="absolute -inset-8 border border-dashed border-yellow-300/20 rounded-full animate-spin" style={{ animationDuration: '12s', animationDirection: 'reverse' }} />

                {/* Trophy */}
                <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-amber-300 via-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(250,204,21,0.6)] animate-bounce" style={{ animationDuration: '2s' }}>
                        <FaTrophy className="w-10 h-10 text-[#2D1F0F] drop-shadow-lg" />
                    </div>
                    {/* Sparkle ring around trophy */}
                    {[0, 60, 120, 180, 240, 300].map((deg) => (
                        <div
                            key={deg}
                            className="absolute w-2 h-2 bg-yellow-300 rounded-full animate-ping"
                            style={{
                                top: `${50 - 48 * Math.cos((deg * Math.PI) / 180)}%`,
                                left: `${50 + 48 * Math.sin((deg * Math.PI) / 180)}%`,
                                animationDelay: `${deg / 360}s`,
                                animationDuration: '1.5s',
                            }}
                        />
                    ))}
                </div>

                {/* Avatar */}
                <span className="text-5xl drop-shadow-lg">{winner.avatar}</span>

                {/* Name */}
                <h3 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-300"
                    style={{ textShadow: '0 0 30px rgba(250,204,21,0.3)' }}
                >
                    {winner.name}
                </h3>

                {/* Winner label */}
                <div className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-[0_0_24px_rgba(250,204,21,0.5)]">
                    <HiSparkles className="w-5 h-5 text-[#2D1F0F] animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="text-[#2D1F0F] text-lg font-black uppercase tracking-widest">Champion!</span>
                    <HiSparkles className="w-5 h-5 text-[#2D1F0F] animate-spin" style={{ animationDuration: '3s', animationDirection: 'reverse' }} />
                </div>

                {/* Savings amount */}
                <p className="text-amber-200/80 text-sm font-semibold">${winner.savings} saved</p>
            </div>

            <style jsx>{`
                @keyframes winner-entrance {
                    0% { opacity: 0; }
                    100% { opacity: 1; }
                }
                @keyframes winner-pop {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.08); }
                    100% { transform: scale(1); opacity: 1; }
                }
                .animate-winner-entrance {
                    animation: winner-entrance 0.4s ease-out forwards;
                }
                .animate-winner-pop {
                    animation: winner-pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s forwards;
                    opacity: 0;
                }
            `}</style>
        </div>
    );
}

export function RaceAnimation() {
    const [racers, setRacers] = useState<Racer[]>(initialRacers);
    const [raceComplete, setRaceComplete] = useState(false);
    const [countdown, setCountdown] = useState(10);
    const [showConfetti, setShowConfetti] = useState(false);

    const resetRace = useCallback(() => {
        setRacers(initialRacers.map((r) => ({ ...r, speed: 0, position: 0, isWinner: false })));
        setRaceComplete(false);
        setShowConfetti(false);
        setCountdown(10);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setRacers((prev) => {
                if (raceComplete) return prev;

                const updated = prev.map((racer) => {
                    if (racer.isWinner) return racer;

                    const baseSpeed = racer.name === 'You' ? 1.2 : 0.8;
                    const savingsBonus = racer.savings / 800;
                    const randomFactor = Math.random() * 0.8;
                    const increment = baseSpeed + savingsBonus + randomFactor;
                    const newSpeed = Math.min(racer.speed + increment, 100);

                    return { ...racer, speed: newSpeed };
                });

                const sorted = [...updated].sort((a, b) => b.speed - a.speed);
                const withPositions = updated.map((r) => ({
                    ...r,
                    position: sorted.findIndex((s) => s.id === r.id) + 1,
                }));

                const winner = withPositions.find((r) => r.speed >= 100 && !r.isWinner);
                if (winner) {
                    setRaceComplete(true);
                    setShowConfetti(true);
                    return withPositions.map((r) => ({
                        ...r,
                        isWinner: r.id === winner.id,
                    }));
                }

                return withPositions;
            });
        }, 60);

        const countdownInterval = setInterval(() => {
            setCountdown((prev) => (prev <= 1 ? 10 : prev - 1));
        }, 1000);

        const resetTimer = setTimeout(resetRace, 10000);

        return () => {
            clearInterval(interval);
            clearInterval(countdownInterval);
            clearTimeout(resetTimer);
        };
    }, [raceComplete, resetRace]);

    const getPositionBadge = (position: number, isWinner: boolean) => {
        if (isWinner) return <FaTrophy className="w-4 h-4 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]" />;
        if (position === 1) return <FaMedal className="w-3.5 h-3.5 text-yellow-400" />;
        if (position === 2) return <FaMedal className="w-3.5 h-3.5 text-gray-300" />;
        if (position === 3) return <FaMedal className="w-3.5 h-3.5 text-amber-600" />;
        return <span className="text-xs text-white/50 font-mono">#{position}</span>;
    };

    // Sort racers by position for display (winner at top)
    const sortedRacers = [...racers].sort((a, b) => {
        if (a.isWinner) return -1;
        if (b.isWinner) return 1;
        return a.position - b.position;
    });

    return (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2D1F0F] via-[#3D2915] to-[#2D1F0F] p-6 md:p-8 border border-amber-500/30 shadow-2xl">
            {/* Background decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-10 right-10 w-60 h-60 bg-orange-500/10 rounded-full blur-3xl" />
            </div>

            {/* Confetti on winner */}
            {showConfetti && <Confetti />}

            {/* Winner celebration overlay */}
            {showConfetti && (() => {
                const winner = racers.find(r => r.isWinner);
                return winner ? <WinnerOverlay winner={winner} /> : null;
            })()}

            {/* Header */}
            <div className="relative flex items-center justify-between mb-6 z-10">
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
            <div className="relative space-y-2 z-10">
                {sortedRacers.map((racer) => (
                    <div
                        key={racer.id}
                        className="relative"
                        style={{ transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
                    >
                        {/* Winner glow */}
                        {racer.isWinner && <WinnerGlow />}

                        {/* Lane */}
                        <div
                            className={`
                                relative rounded-2xl overflow-hidden
                                transition-all duration-500 ease-out
                                ${racer.isWinner
                                    ? 'ring-2 ring-yellow-400/80 shadow-[0_0_20px_rgba(250,204,21,0.3)]'
                                    : racer.name === 'You'
                                        ? 'ring-1 ring-amber-500/40'
                                        : ''
                                }
                            `}
                        >
                            {/* Track bg */}
                            <div className="absolute inset-0 bg-white/[0.04] border border-white/[0.08] rounded-2xl" />

                            {/* Progress fill */}
                            <div
                                className={`absolute inset-y-0 left-0 bg-gradient-to-r ${racer.bgGradient} rounded-2xl`}
                                style={{
                                    width: `${racer.speed}%`,
                                    opacity: racer.isWinner ? 0.4 : 0.2,
                                    transition: 'width 0.15s linear, opacity 0.5s ease',
                                }}
                            />

                            {/* Lane content */}
                            <div className="relative px-4 py-3 h-[52px]">
                                {/* Left: Position + Info (static) */}
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10">
                                    <div className="w-7 h-7 flex items-center justify-center flex-shrink-0">
                                        {getPositionBadge(racer.position, racer.isWinner)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className={`text-sm font-bold truncate ${racer.name === 'You' ? 'text-amber-300' : 'text-white/90'}`}>
                                            {racer.name}
                                        </p>
                                        <p className="text-[11px] text-white/40">${racer.savings} saved</p>
                                    </div>
                                </div>

                                {/* Car: moves dynamically with speed */}
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 z-10"
                                    style={{
                                        left: `clamp(140px, calc(${racer.speed}% - 40px), calc(100% - 50px))`,
                                        transition: 'left 0.15s linear',
                                    }}
                                >
                                    <div className={`relative flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gradient-to-r ${racer.bgGradient} shadow-lg border border-white/20`}>
                                        {/* Speed trails */}
                                        {racer.speed > 20 && (
                                            <div className="absolute -left-6 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-50">
                                                <div className="w-4 h-[2px] bg-white/40 rounded-full" />
                                                <div className="w-2 h-[2px] bg-white/25 rounded-full" />
                                            </div>
                                        )}
                                        <span className="text-base leading-none">{racer.avatar}</span>
                                        <FaCar className="w-4 h-4 text-white drop-shadow-md" />
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Stats */}
            <div className="relative mt-6 pt-4 border-t border-white/10 z-10">
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
                    <p className="text-amber-200/70 text-xs">Save consistently to lead the race!</p>
                </div>
            </div>
        </div>
    );
}
