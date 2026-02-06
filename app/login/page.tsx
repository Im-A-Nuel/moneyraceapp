"use client";

import { useRouter } from "next/navigation";
import { Header } from "@/components/ui/Header";
import { GoldCoin } from "@/components/ui/GoldCoin";
import { GoogleOAuthProvider } from "@/components/GoogleOAuthProvider";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "@/store/auth.store";
import { authAPI } from "@/lib/api";
import { getOrCreateKeypairForUser } from "@/lib/keypair";
import { useState, useEffect } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit";

export default function LoginPage() {
  const router = useRouter();
  const { login, logout, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const currentAccount = useCurrentAccount();

  // If already authenticated with correct login method, redirect to dashboard
  // Don't redirect if wallet is connecting (allow switch from Google to Wallet)
  useEffect(() => {
    if (isAuthenticated && !currentAccount) {
      // Only redirect if authenticated and no wallet is connecting
      router.push("/dashboard");
    }
  }, [isAuthenticated, currentAccount, router]);

  // Auto-login when wallet is connected
  useEffect(() => {
    if (currentAccount?.address) {
      console.log('Wallet connected, auto-login triggered for:', currentAccount.address);

      // Logout first to clear any previous session
      logout();

      // Create user object from wallet address
      const user = {
        id: currentAccount.address,
        email: `${currentAccount.address.slice(0, 6)}...@wallet`,
        name: `Wallet ${currentAccount.address.slice(0, 6)}...${currentAccount.address.slice(-4)}`,
        address: currentAccount.address,
        loginMethod: 'wallet' as const,
      };

      // Login without token
      login(user, '');

      console.log('Wallet login successful:', currentAccount.address);
      console.log('User with loginMethod:', user.loginMethod);

      // Redirect to dashboard
      router.push('/dashboard');
    }
  }, [currentAccount, login, logout, router]);

  const handleWalletLogin = async (address: string) => {
    try {
      setIsLoading(true);
      setError(null);

      // Logout first to clear any previous session (Google login)
      logout();

      // Create user object from wallet address
      const user = {
        id: address,
        email: `${address.slice(0, 6)}...@wallet`,
        name: `Wallet ${address.slice(0, 6)}...${address.slice(-4)}`,
        address: address,
        loginMethod: 'wallet' as const,
      };

      // Login without token (wallet doesn't need backend token)
      login(user, '');

      console.log('Wallet login successful:', address);
      console.log('User with loginMethod:', user.loginMethod);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Wallet login error:', err);
      setError(err.message || 'Wallet login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
            loginMethod: 'google',
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
        <Header />

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
                  <div className="w-full flex justify-center">
                    <ConnectButton />
                  </div>

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
