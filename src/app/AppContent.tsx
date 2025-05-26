
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, ReactNode } from 'react';
import { Header } from '@/components/shared/Header';
import { Toaster } from "@/components/ui/toaster";
import { useToast } from '@/hooks/use-toast';

export default function AppContent({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  // Landing page ('/'), login, and signup are public.
  const publicPaths = ['/', '/login', '/signup'];
  const isAdminPath = pathname === '/admin';
  const isDashboardPath = pathname === '/dashboard';
  const isPublicPath = publicPaths.includes(pathname);

  useEffect(() => {
    console.log('AppContent: useEffect triggered. Loading:', loading, 'User UID:', user?.uid, 'User isAdmin:', user?.isAdmin, 'Pathname:', pathname);

    if (!loading) {
      if (user) {
        // User is logged in
        console.log('AppContent: User is logged in. isAdmin (from context):', user.isAdmin);

        // If user is authenticated and on login/signup page, redirect them
        if (pathname === '/login' || pathname === '/signup') {
          console.log('AppContent: Authenticated user on login/signup page, redirecting. Admin status:', user.isAdmin);
          if (user.isAdmin) {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else if (isAdminPath && !user.isAdmin) {
          // User is on admin path but is not admin
          console.log('AppContent: User on admin path but is NOT admin. Redirecting to dashboard.');
          toast({
            variant: "destructive",
            title: "Access Denied",
            description: "You do not have permission to view this page.",
          });
          router.push('/dashboard');
        } else if (isDashboardPath && user.isAdmin) {
          // If admin somehow lands on /dashboard, redirect them to /admin
           console.log('AppContent: Admin user on /dashboard path. Redirecting to /admin.');
           router.push('/admin');
        }
        // If authenticated and on landing page ('/'), no automatic redirect. User stays on landing page.
      } else {
        // User is not logged in
        console.log('AppContent: User is not logged in.');
        // If not on a public path redirect to login.
        if (!isPublicPath) {
          console.log('AppContent: User not logged in and on protected path (', pathname, '). Redirecting to login.');
          router.push('/login');
        }
        // If on a public path (e.g. '/', '/login', '/signup') and not logged in, no redirect is needed.
      }
    }
  }, [user, loading, router, pathname, isPublicPath, isAdminPath, isDashboardPath, toast]);

  // Show loading screen for non-public pages while auth is resolving
  // However, do not show this for the landing page itself ('/')
  if (loading && !isPublicPath && pathname !== '/') {
    console.log('AppContent: Showing loading screen (protected route, auth resolving).');
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-white h-screen w-full">
        Loading Application & Verifying Permissions...
      </div>
    );
  }

  // If auth loaded, no user, and on a protected path (redirect will happen via useEffect)
  if (!loading && !user && !isPublicPath && !isAdminPath) {
    console.log('AppContent: Auth loaded, no user, on protected path. Redirecting to login soon via useEffect.');
    // This state usually shows briefly as useEffect handles the redirect
    return (
       <div className="flex-grow flex flex-col items-center justify-center text-white h-screen w-full">
        Redirecting to login...
      </div>
    );
  }
  
  // If auth loaded, user is not admin, but on admin path (redirect will happen via useEffect)
  if (!loading && user && !user.isAdmin && isAdminPath) {
    console.log('AppContent: Auth loaded, user is not admin, on admin path. Redirecting soon via useEffect.');
     // This state usually shows briefly as useEffect handles the redirect
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-white h-screen w-full">
        Redirecting... Access Denied.
      </div>
    );
  }

  console.log('AppContent: Rendering Header and children.');
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

