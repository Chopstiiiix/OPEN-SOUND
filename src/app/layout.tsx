import type { Metadata } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import Sidebar from "@/components/Sidebar";
import AppTopBar from "@/components/AppTopBar";
import PlayerShell from "@/components/PlayerShell";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Open Sound - Earn Rewards for Every Beat",
  description: "Stream music, earn rewards. Open Sound connects listeners with creators through rewarded listening campaigns.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground min-h-screen`}
        >
          <SignedOut>{children}</SignedOut>
          <SignedIn>
            <PlayerShell>
              <Sidebar />
              <main className="md:ml-24 min-h-screen pb-28 md:pb-20">
                <AppTopBar />
                <div className="px-4 md:px-8 py-6">
                  {children}
                </div>
              </main>
            </PlayerShell>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
