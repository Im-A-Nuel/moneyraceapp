"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { GoldCoin } from "@/components/ui/GoldCoin";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { RaceAnimation } from "@/components/ui/RaceAnimation";
import { GoogleOAuthProvider } from "@/components/GoogleOAuthProvider";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/auth.store";
import { authAPI } from "@/lib/api";
import { getOrCreateKeypairForUser } from "@/lib/keypair";
import { ConnectButton, useCurrentAccount } from "@mysten/dapp-kit";
import { HiExclamationCircle, HiLightBulb } from "react-icons/hi";
import { FaTrophy, FaRobot } from "react-icons/fa";

export default function Home() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const currentAccount = useCurrentAccount();
  const [loginError, setLoginError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

  // Handle wallet connection - only auto-login if wallet is connected and user is not authenticated
  useEffect(() => {
    // Only proceed if there's a connected wallet and user is NOT authenticated
    if (currentAccount?.address && !isAuthenticated) {
      // Small delay to ensure this is intentional connection, not auto-connect on page load
      const timer = setTimeout(() => {
        try {
          console.log('Wallet connected:', currentAccount.address);
          // User connected wallet, login with wallet address
          login(
            {
              id: currentAccount.address,
              email: '',
              name: `Wallet User`,
              address: currentAccount.address,
            },
            '' // No token for wallet users
          );
          router.push('/dashboard');
        } catch (error: any) {
          console.error('Wallet login error:', error);
          setLoginError('Failed to connect wallet. Please try again.');
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [currentAccount?.address, isAuthenticated, login, router]);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const idToken = credentialResponse.credential;

      // Decode JWT to get user info
      const base64Url = idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(base64));

      // Send ID Token to backend for verification
      const authResponse = await authAPI.login(idToken);

      if (authResponse.success && authResponse.user) {
        // Generate deterministic keypair from Google sub
        const keypair = await getOrCreateKeypairForUser(payload.sub);
        const suiAddress = keypair.getPublicKey().toSuiAddress();

        // Store user in zustand with deterministic address
        login(
          {
            id: authResponse.user.sub,
            email: payload.email,
            name: payload.name || payload.email,
            address: suiAddress,
            avatar: payload.picture,
          },
          idToken
        );

        router.push('/dashboard');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      setLoginError('Login failed. Please check your connection and try again.');
    }
  };

  return (
    <GoogleOAuthProvider>
      <main className="min-h-screen bg-hero-wow overflow-hidden">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 overflow-visible">
          {/* Animated Background Glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-20 left-10 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-10 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[600px]">
              {/* Left side - Coin with Mascot */}
              <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                <div className="relative">
                  <GoldCoin size="xl" animate={true} />
                  {/* Shadow effect */}
                  <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-8 rounded-full opacity-40 blur-2xl"
                    style={{
                      background: 'radial-gradient(ellipse, rgba(139, 112, 32, 0.6), transparent)',
                    }}
                  />

                  {/* Mascot Ant - BIG & Floating Animation */}
                  <div className="absolute -right-20 md:-right-32 lg:-right-40 bottom-0 md:bottom-4 animate-bounce-slow z-20">
                    <div className="relative">
                      {/* Speech Bubble - Bigger */}
                      <div className="absolute -top-20 md:-top-24 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-5 py-3 shadow-2xl border-3 border-amber-400 whitespace-nowrap z-10">
                        <p className="text-base md:text-lg font-black text-[#4A3000]">Join the race! 🏁</p>
                        {/* Bubble tail */}
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-r-3 border-b-3 border-amber-400 rotate-45" />
                      </div>
                      <Image
                        src="/mascotsemut.png"
                        alt="Money Race Mascot"
                        width={200}
                        height={200}
                        className="drop-shadow-2xl w-32 md:w-44 lg:w-52 h-auto"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Content */}
              <div className="text-center lg:text-left order-1 lg:order-2 space-y-6">
                {/* Tagline */}
                <h1
                  className="text-3xl md:text-5xl lg:text-5xl font-black text-white leading-tight tracking-tight"
                  style={{
                    fontFamily: 'Impact, Arial Black, sans-serif',
                    textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
                  }}
                >
                  &quot;SAVE TOGETHER. DECIDE YOUR<br />STRATEGY. EARN FAIRLY.&quot;
                </h1>

                {/* Subtitle */}
                <div className="space-y-1">
                  <p className="text-amber-100/90 text-sm md:text-base font-medium tracking-wide">
                    A GROUP SAVING GAME WHERE <span className="text-white font-bold">AI</span> HELPS YOU CHOOSE
                  </p>
                  <p className="text-amber-100/80 text-sm tracking-wide">
                    — AND REWARDS ARE SHARED BASED ON CONSISTENCY.
                  </p>
                </div>

                {/* Login Error Message */}
                {loginError && (
                  <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-3 flex items-center gap-2 max-w-md">
                    <HiExclamationCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
                    <p className="text-red-200 text-sm">{loginError}</p>
                    <button
                      onClick={() => setLoginError(null)}
                      className="text-red-300 hover:text-white ml-auto text-lg"
                    >
                      ×
                    </button>
                  </div>
                )}

                {/* Login buttons - Compact spacing */}
                <div className="flex flex-col sm:flex-row items-center gap-2 justify-center lg:justify-start pt-4">
                  {/* Google Sign In Button */}
                  <div className="w-full sm:w-auto">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => setLoginError('Google sign-in failed. Please try again.')}
                      width="280"
                      text="signin_with"
                      shape="rectangular"
                      size="large"
                      logo_alignment="left"
                    />
                  </div>

                  <span className="text-amber-100/70 text-xs font-semibold uppercase tracking-wider px-2">or</span>

                  {/* Sui Wallet Connect Button */}
                  <div className="sui-wallet-button">
                    <ConnectButton />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #B6771D 0%, #A06B1A 100%)' }}>
          {/* Stardust particles */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => {
              const size = 2 + (i % 4) * 1.5;
              const colors = ['#FFD700', '#FBBF24', '#FDE68A', '#FCD34D', '#FFFFFF'];
              const color = colors[i % 5];
              return (
                <div
                  key={i}
                  className="absolute rounded-full animate-stardust"
                  style={{
                    left: `${(i * 23 + 7) % 100}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    background: `radial-gradient(circle, ${color} 0%, ${color}88 40%, transparent 70%)`,
                    boxShadow: `0 0 ${6 + (i % 5) * 3}px ${color}, 0 0 ${12 + (i % 4) * 4}px ${color}66`,
                    animationDelay: `${(i * 0.5) % 10}s`,
                    animationDuration: `${4 + (i % 6) * 1.5}s`,
                    opacity: 0,
                  }}
                />
              );
            })}
          </div>

          <style jsx>{`
            @keyframes stardust {
              0% {
                transform: translateY(-20px) translateX(0) scale(0);
                opacity: 0;
              }
              5% {
                opacity: 1;
                transform: translateY(0) translateX(0) scale(1.2);
              }
              15% {
                opacity: 0.9;
                transform: translateY(10vh) translateX(10px) scale(1);
              }
              40% {
                opacity: 0.7;
                transform: translateY(35vh) translateX(-8px) scale(0.9);
              }
              60% {
                opacity: 0.8;
                transform: translateY(55vh) translateX(12px) scale(0.8);
              }
              80% {
                opacity: 0.5;
                transform: translateY(75vh) translateX(-5px) scale(0.6);
              }
              100% {
                transform: translateY(100vh) translateX(8px) scale(0.2);
                opacity: 0;
              }
            }
            .animate-stardust {
              animation: stardust linear infinite;
            }
          `}</style>

          <div className="max-w-6xl mx-auto relative z-10">
            {/* Section Title */}
            <div className="text-center mb-12">
              <h2
                className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4"
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  textShadow: '3px 3px 6px rgba(0,0,0,0.3)',
                }}
              >
                WHY MONEY RACE?
              </h2>
              <p className="text-amber-100/80 text-lg">Join the race to financial freedom</p>
            </div>

            {/* Race Animation */}
            <div className="mb-16">
              <RaceAnimation />
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<HiLightBulb className="w-12 h-12 text-amber-300" />}
                title="How It Works"
                description="Join a savings room, set your deposit target, and commit to your financial goals. Deposit USDC periodically (daily or weekly) into the smart contract pool. Stay consistent to remain eligible for rewards. At the end of the challenge, consistent savers share the reward pool — building healthy financial habits together with the community."
              />
              <FeatureCard
                icon={<FaRobot className="w-12 h-12 text-amber-300" />}
                title="AI-Assisted"
                description="Powered by EigenAI, our AI analyzes your financial goals and risk tolerance to recommend the right savings strategy. Choose from Conservative, Balanced, or Aggressive approaches — each with different risk levels and expected returns. Get personalized guidance to help you pick the best strategy for your savings room."
              />
              <FeatureCard
                icon={<FaTrophy className="w-12 h-12 text-amber-300" />}
                title="Rewards"
                description="Earn rewards for staying consistent! Your consistency score (0-100%) determines your share of the reward pool. The more consistently you deposit, the bigger your share. All transactions are 100% gasless — sponsored by the platform — and your principal deposits are always protected and claimable."
              />
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="py-20 px-6 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #A06B1A 0%, #8B5E17 100%)' }}>
          {/* Decorative mascots - BIG! */}
          <div className="absolute left-0 md:left-10 top-1/2 -translate-y-1/2 opacity-30 md:opacity-60 pointer-events-none animate-bounce-slow">
            <Image
              src="/mascotsemut.png"
              alt=""
              width={280}
              height={280}
              className="w-32 md:w-48 lg:w-56 h-auto transform -scale-x-100"
            />
          </div>
          <div className="absolute right-0 md:right-10 top-1/2 -translate-y-1/2 opacity-30 md:opacity-60 pointer-events-none animate-bounce-slow" style={{ animationDelay: '0.5s' }}>
            <Image
              src="/mascotsemut.png"
              alt=""
              width={280}
              height={280}
              className="w-32 md:w-48 lg:w-56 h-auto"
            />
          </div>

          <div className="max-w-2xl mx-auto text-center space-y-8 relative z-10">
            {/* CTA Header with animation */}
            <div className="space-y-4">
              <h2
                className="text-3xl md:text-4xl font-black text-white"
                style={{
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                START YOUR SAVINGS JOURNEY
              </h2>
              <p
                className="text-amber-100/90 text-sm md:text-base font-medium tracking-wide"
              >
                Join thousands of savers racing towards financial freedom!</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 justify-center">
              {/* Google Sign In Button */}
              <div className="w-full sm:w-auto">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setLoginError('Google sign-in failed. Please try again.')}
                  width="280"
                  text="signin_with"
                  shape="rectangular"
                  size="large"
                  logo_alignment="left"
                />
              </div>

              <span className="text-amber-100/70 text-xs font-semibold uppercase tracking-wider px-2">or</span>

              {/* Sui Wallet Connect Button */}
              <div className="sui-wallet-button">
                <ConnectButton />
              </div>
            </div>

            {/* Login Error Message */}
            {loginError && (
              <div className="bg-red-500/20 border border-red-400/50 rounded-xl p-3 flex items-center gap-2 max-w-md mx-auto">
                <HiExclamationCircle className="w-5 h-5 text-red-300 flex-shrink-0" />
                <p className="text-red-200 text-sm">{loginError}</p>
                <button
                  onClick={() => setLoginError(null)}
                  className="text-red-300 hover:text-white ml-auto text-lg"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Curved decoration */}
        <div
          className="h-32 relative"
          style={{
            background: 'linear-gradient(180deg, #8B5E17 0%, #7B542F 100%)',
            clipPath: 'ellipse(70% 100% at 50% 100%)',
          }}
        />

        {/* Footer */}
        <Footer />
      </main>
    </GoogleOAuthProvider>
  );
}

