"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { Footer } from "@/components/ui/Footer";
import { GoldCoin } from "@/components/ui/GoldCoin";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { HeroInput } from "@/components/ui/HeroInput";
import { GoogleOAuthProvider } from "@/components/GoogleOAuthProvider";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/auth.store";
import { authAPI } from "@/lib/api";
import { getOrCreateKeypairForUser } from "@/lib/keypair";

export default function Home() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, router]);

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
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <GoogleOAuthProvider>
      <main className="min-h-screen bg-gold-gradient overflow-hidden">
        {/* Header */}
        <Header />

        {/* Hero Section */}
        <section className="relative pt-20 pb-32 px-6 overflow-visible">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center min-h-[600px]">
              {/* Left side - Coin */}
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

                {/* Login buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start pt-4">
                  {/* Google Sign In Button */}
                  <div className="w-full max-w-xs">
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => console.error('Login Failed')}
                      width="280"
                      text="signin_with"
                      shape="rectangular"
                      size="large"
                      logo_alignment="left"
                    />
                  </div>

                  <span className="text-amber-100/70 text-sm font-bold uppercase tracking-wider">OR</span>

                  <button className="btn-wallet whitespace-nowrap px-8 py-3">
                    <span className="font-bold">Wallet</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6" style={{ background: 'linear-gradient(180deg, #B6771D 0%, #A06B1A 100%)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                title="How It Works ?"
                description="Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever, When An Unknown Printer Took A Galley Of Type And Scrambled It To Make A Type Specimen Book. It Has Survived Not Only Five Centuries, But Also The Leap Into Electronic Typesetting, Remaining Essentially Unchanged. It Was Popularised In The 1960s With The Release Of Letraset Sheets Recently With Desktop Publishing Software Like Aldus PageMaker Including Versions Of Lorem Ipsum."
              />
              <FeatureCard
                title="AI-Assisted"
                description="Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever, When An Unknown Printer Took A Galley Of Type And Scrambled It To Make A Type Specimen Book. It Has Survived Not Only Five Centuries, But Also The Leap Into Electronic Typesetting, Remaining Essentially Unchanged. It Was Popularised In The 1960s With The Release Of Letraset Sheets Recently With Desktop Publishing Software Like Aldus PageMaker Including Versions Of Lorem Ipsum."
              />
              <FeatureCard
                title="Rewards"
                description="Lorem Ipsum Is Simply Dummy Text Of The Printing And Typesetting Industry. Lorem Ipsum Has Been The Industry's Standard Dummy Text Ever, When An Unknown Printer Took A Galley Of Type And Scrambled It To Make A Type Specimen Book. It Has Survived Not Only Five Centuries, But Also The Leap Into Electronic Typesetting, Remaining Essentially Unchanged. It Was Popularised In The 1960s With The Release Of Letraset Sheets Recently With Desktop Publishing Software Like Aldus PageMaker Including Versions Of Lorem Ipsum."
              />
            </div>
          </div>
        </section>

        {/* Bottom CTA Section */}
        <section className="py-20 px-6" style={{ background: 'linear-gradient(180deg, #A06B1A 0%, #8B5E17 100%)' }}>
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <p
              className="text-amber-100/95 text-sm md:text-base font-semibold tracking-wider uppercase"
              style={{
                textShadow: '1px 1px 2px rgba(0,0,0,0.2)',
              }}
            >
              READY TO LOGIN? ENTER YOUR EMAIL TO CREATE OR USE YOUR WALLET
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
              {/* Google Sign In Button */}
              <div className="w-full max-w-xs">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => console.error('Login Failed')}
                  width="280"
                  text="signin_with"
                  shape="rectangular"
                  size="large"
                  logo_alignment="left"
                />
              </div>

              <span className="text-amber-100/70 text-sm font-bold uppercase tracking-wider">OR</span>

              <button className="btn-wallet whitespace-nowrap px-8 py-3">
                <span className="font-bold">Wallet</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </button>
            </div>
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

