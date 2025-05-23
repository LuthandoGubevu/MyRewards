
import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/shared/Header';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from '@/contexts/AuthContext';
import AppContent from './AppContent'; // Assume AppContent is moved or correctly defined

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// Static metadata object (can be an exported const)
export const metadata: Metadata = {
  title: 'KFC Rewards Tracker',
  description: 'Track your KFC points and earn rewards!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen font-sans antialiased flex flex-col bg-gradient-to-b from-black to-gray-900",
          fontSans.variable
        )}
      >
        <AuthProvider>
          <AppContent>{children}</AppContent>
        </AuthProvider>
        {/* Toaster can be here if it's meant to be outside AppContent's conditional rendering */}
        {/* Or ensure Toaster is inside AppContent if it needs context from it or should only show for auth'd parts */}
      </body>
    </html>
  );
}
