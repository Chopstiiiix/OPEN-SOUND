import type { Metadata } from "next";
import {
  ClerkProvider,
  SignedIn,
  SignedOut,
} from "@clerk/nextjs";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "@/components/AppShell";
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
            <AppShell>{children}</AppShell>
          </SignedIn>
        </body>
      </html>
    </ClerkProvider>
  );
}
