
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Header } from '@/components/shared/Header';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from '@/hooks/use-toast'; // Import useToast

export default function AppContent({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast(); // Initialize useToast

  const publicPaths = ['/login', '/signup'];
  const isAdminPath = pathname === '/admin';
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    if (!loading) {
      if (user) {
        // User is logged in
        if (isPublicPath) {
          // If user is logged in and on a public path (login/signup), redirect
          if (user.isAdmin) {
            router.push('/admin');
          } else {
            router.push('/');
          }
        } else if (isAdminPath && !user.isAdmin) {
          // If user is on admin path but is not admin, redirect to home
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You do not have permission to view this page.",
          });
          router.push('/');
        } else if (!isAdminPath && user.isAdmin && pathname !== '/') {
            // If admin is on a regular user path (not home or admin), redirect to admin
            // This prevents admin from being stuck on e.g. /scan
            // router.push('/admin'); // Optional: force admin to admin page
        }
      } else {
        // User is not logged in
        if (!isPublicPath && !isAdminPath) {
          // If user is not logged in and not on a public path or admin path, redirect to login
          router.push('/login');
        } else if (isAdminPath) {
          // If user is not logged in and tries to access admin path, redirect to login
           toast({
            variant: "destructive",
            title: "Authentication Required",
            description: "Please log in to access the admin dashboard.",
          });
          router.push('/login');
        }
      }
    }
  }, [user, loading, router, pathname, isPublicPath, isAdminPath, toast]);

  // Show loading screen for protected routes or admin route while auth is resolving
  // This includes time for fetching custom claims.
  if (loading && (!isPublicPath || isAdminPath)) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-white h-screen w-full">
        Loading Application & Verifying Permissions...
      </div>
    );
  }

  // If auth is loaded, no user, and on a protected path (useEffect will redirect soon)
  if (!loading && !user && !isPublicPath && !isAdminPath) {
    return (
       <div className="flex-grow flex flex-col items-center justify-center text-white h-screen w-full">
        Redirecting to login...
      </div>
    );
  }
  
  // If user tries to access admin page but is not admin (useEffect will redirect)
  if (!loading && user && !user.isAdmin && isAdminPath) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-white h-screen w-full">
        Redirecting... Access Denied.
      </div>
    );
  }


  return (
    <>
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 md:px-6">
        {children}
      </main>
      <Toaster />
    </>
  );
}

