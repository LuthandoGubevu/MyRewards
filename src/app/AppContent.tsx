
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Header } from '@/components/shared/Header';
import { Toaster } from "@/components/ui/toaster";

// Wrapper component to handle auth checks and rendering
export default function AppContent({ children }: { children: ReactNode }) {
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
      <Header /> {/* Header is now rendered on all pages */}
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6">
        {children}
      </main>
      <Toaster />
    </>
  );
}
