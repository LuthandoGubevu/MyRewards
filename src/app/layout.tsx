
"use client"; // Make it a client component to use hooks

import type { Metadata } from 'next'; // Metadata can still be exported from client component layouts
import { Inter as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/shared/Header';
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

// Static metadata object (can be an exported const)
export const metadata: Metadata = {
  title: 'KFC Rewards Tracker',
  description: 'Track your KFC points and earn rewards!',
};

// Wrapper component to handle auth checks and rendering
function AppContent({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const publicPaths = ['/login', '/signup'];
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    // If auth loading is complete, and there's no user, and we're not on a public path
    if (!loading && !user && !isPublicPath) {
      router.push('/login');
    }
  }, [user, loading, router, pathname, isPublicPath]);

  // While auth is loading and we're on a path that requires auth, show a loading screen
  if (loading && !isPublicPath) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-white h-screen w-full">
        {/* Full-screen loading for initial auth check on protected routes */}
        Loading Application...
      </div>
    );
  }

  // If auth is loaded, no user, and on a protected path (useEffect will redirect soon)
  if (!user && !isPublicPath) {
    return (
       <div className="flex-grow flex flex-col items-center justify-center text-white h-screen w-full">
        Redirecting to login...
      </div>
    );
  }

  // Render normally if user is logged in, or if it's a public path
  return (
    <>
      {!isPublicPath && <Header />} {/* Only show header on non-public (authenticated) pages */}
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6">
        {children}
      </main>
      <Toaster />
    </>
  );
}

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
      </body>
    </html>
  );
}
