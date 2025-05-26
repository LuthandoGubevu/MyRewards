
"use client"; 

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Header() {
  const { user: appUser, logOut, loading: authLoading } = useAuth();

  return (
    <header className="bg-black">
      <div className="container mx-auto flex h-28 items-center justify-between px-4 md:px-6 relative">
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href={appUser ? (appUser.isAdmin ? "/admin" : "/dashboard") : "/"} className="flex items-center">
            <Image
              src="/images/KFC-Logo.png"
              alt="KFC Logo"
              width={100}
              height={100}
              priority={false}
            />
          </Link>
        </div>
        
        {appUser && (
          <div className="ml-auto flex items-center gap-2"> {/* Use ml-auto to push to the right */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logOut} 
              disabled={authLoading}
              className="text-white hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span className="sm:inline">{authLoading ? 'Logging out...' : 'Logout'}</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
