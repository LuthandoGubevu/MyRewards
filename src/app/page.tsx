
"use client";

import { Button } from "@/components/ui/button";
import { Award, LogIn, ScanLine, UserPlus, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If a user is already logged in and lands on '/', AppContent will keep them here.
    // If they land on '/login' or '/signup' while logged in, AppContent redirects them.
    // This useEffect could be simplified or removed if AppContent fully handles all cases.
  }, [user, loading, router]);


  // If auth is loading and user is not yet determined, show a generic loading state.
  // AppContent handles more specific loading/redirecting states for protected routes.
  if (loading) {
    return (
      <div className="flex-grow flex flex-col items-center justify-center text-white h-screen w-full">
        Loading Application...
      </div>
    );
  }

  // If user is determined and logged in, AppContent will handle appropriate dashboard redirection
  // from /login or /signup. User stays on '/' if they navigate here while logged in.
  // This specific check might be redundant if AppContent's logic is comprehensive.
  if (!loading && user && (router.pathname === '/login' || router.pathname === '/signup')) {
     // console.log("LandingPage: User is logged in, on login/signup, AppContent should redirect.");
     // This state is primarily handled by AppContent, can show a generic redirecting message
     return (
      <div className="flex-grow flex flex-col items-center justify-center text-white h-screen w-full">
        Redirecting...
      </div>
    );
  }


  return (
    <div className="min-h-[calc(100vh-7rem)] flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900 text-white">
      <div className="max-w-3xl w-full space-y-12 text-center">
        <div>
          <Zap className="mx-auto h-16 w-16 text-primary animate-pulse" />
          <h1 className="mt-6 text-4xl sm:text-5xl font-extrabold tracking-tight font-national">
            Unlock Delicious Rewards with Every Bite!
          </h1>
          <p className="mt-4 text-xl text-gray-300 max-w-xl mx-auto">
            Join MyRewards, scan your KFC receipts, earn points, and redeem them for finger lickin' good rewards. It's that simple!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl hover:shadow-primary/50 transition-shadow duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full text-white mb-4">
              <UserPlus className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">1. Sign Up or Log In</h3>
            <p className="text-gray-400">Create your free MyRewards account or log in to get started.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl hover:shadow-primary/50 transition-shadow duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full text-white mb-4">
              <ScanLine className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">2. Scan Receipts</h3>
            <p className="text-gray-400">Use our easy in-app scanner to capture QR codes on your KFC receipts.</p>
          </div>
          <div className="bg-gray-800/50 p-6 rounded-xl shadow-xl hover:shadow-primary/50 transition-shadow duration-300">
            <div className="flex items-center justify-center w-12 h-12 bg-primary rounded-full text-white mb-4">
              <Award className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">3. Earn & Redeem</h3>
            <p className="text-gray-400">Collect points for every purchase and unlock exclusive rewards and freebies.</p>
          </div>
        </div>

        <div className="mt-10">
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-primary/70 transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/login">
              <span className="flex items-center">
                <LogIn className="mr-2 h-5 w-5" />
                Start Earning Now
              </span>
            </Link>
          </Button>
        </div>

      </div>
    </div>
  );
}
