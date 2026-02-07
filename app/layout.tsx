import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleOAuthProvider } from "@/components/GoogleOAuthProvider";
import { WalletProvider } from "@/components/WalletProvider";
import { ToastProvider } from "@/components/ui/Toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MoneyRace - AI-Powered Saving Game",
  description: "Save together, earn rewards, powered by Sui blockchain",
  icons: {
    icon: "/logo_money_race_coin.png",
    shortcut: "/logo_money_race_coin.png",
    apple: "/logo_money_race_coin.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WalletProvider>
          <GoogleOAuthProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </GoogleOAuthProvider>
        </WalletProvider>
      </body>
    </html>
  );
}
