"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { GoldCoin } from "@/components/ui/GoldCoin";
import { GoogleOAuthProvider } from "@/components/GoogleOAuthProvider";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/auth.store";
import { authAPI } from "@/lib/api";
import { getOrCreateKeypairForUser } from "@/lib/keypair";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    router.push("/dashboard");
    return null;
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      } else {
        throw new Error('Authentication failed');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider>
      <main className="min-h-screen bg-gold-gradient overflow-hidden">
        {/* Header */}
        <Header showSignIn={false} />

        {/* Login Section */}
        <section className="min-h-screen pt-32 pb-20 px-6 flex items-center">
          <div className="max-w-7xl mx-auto w-full">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left side - Login Form */}
              <div className="flex justify-center lg:justify-start order-2 lg:order-1">
                <div 
                  className="w-full max-w-md p-8 rounded-2xl"
                  style={{
                    background: 'hsla(40, 55%, 75%, 0.85)',
                    backdropFilter: 'blur(12px)',
                  }}
                >
                  {/* LOGIN Title */}
                  <h2 
                    className="text-2xl font-bold mb-8"
                    style={{ color: 'hsl(35, 70%, 40%)' }}
                  >
                    LOGIN
                  </h2>

                  {/* Error message */}
                  {error && (
                    <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Google Login */}
                  <div className="mb-6">
                    <div className="relative">
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="input-gold w-full pr-14"
                        disabled={isLoading}
                      />
                      <div className="absolute right-2 top-1/2 -translate-y-1/2">
                        <GoogleLogin
                          onSuccess={handleGoogleSuccess}
                          onError={() => setError('Google login failed')}
                          type="icon"
                          shape="circle"
                          size="medium"
                        />
                      </div>
                    </div>
                  </div>

                  {/* OR divider */}
                  <div className="flex items-center justify-center mb-6">
                    <span className="text-amber-700/60 text-sm font-medium">OR</span>
                  </div>

                  {/* Wallet button */}
                  <button
                    disabled={isLoading}
                    className="btn-wallet w-full justify-center disabled:opacity-50"
                  >
                    <span>Use Wallet</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </button>

                  {/* Loading indicator */}
                  {isLoading && (
                    <div className="mt-4 text-center text-amber-700/80 text-sm">
                      Logging in...
                    </div>
                  )}
                </div>
              </div>

              {/* Right side - Coin */}
              <div className="flex justify-center lg:justify-end order-1 lg:order-2">
                <GoldCoin size="xl" animate={true} />
              </div>
            </div>

            {/* Bottom tagline */}
            <div className="text-center mt-16">
              <h2 
                className="text-2xl md:text-3xl font-black text-white mb-4 leading-tight"
                style={{ 
                  fontFamily: 'Impact, Arial Black, sans-serif',
                  textShadow: '2px 2px 4px rgba(0,0,0,0.2)',
                }}
              >
                &quot;SAVE TOGETHER. DECIDE YOUR
                <br />
                STRATEGY. EARN FAIRLY.&quot;
              </h2>
              <p className="text-amber-100/90 text-sm">
                A GROUP SAVING GAME WHERE <span className="text-white font-semibold">AI</span> HELPS YOU CHOOSE
              </p>
              <p className="text-amber-100/80 text-sm">
                — AND REWARDS ARE SHARED BASED ON CONSISTENCY.
              </p>
            </div>
          </div>
        </section>
      </main>
    </GoogleOAuthProvider>
  );
}
