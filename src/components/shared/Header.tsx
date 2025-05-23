
"use client"; // Needs to be a client component to use hooks

import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Header() {
  const { user, logOut, loading } = useAuth();

  return (
    <header className="bg-black">
      {/* Added 'relative' to the container and changed 'justify-between' to 'justify-end' */}
      <div className="container mx-auto flex h-28 items-center justify-end px-4 md:px-6 relative">
        {/* Centered Logo using absolute positioning */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center">
            <Image
              src="/images/KFC-Logo.png"
              alt="KFC Logo"
              width={100}
              height={100}
              priority={false}
            />
          </Link>
        </div>
        
        {/* User Info - will be pushed to the right by 'justify-end' on the parent */}
        {user && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-300 hidden sm:inline">{user.email}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logOut} 
              disabled={loading}
              className="text-white hover:bg-gray-700 hover:text-white"
            >
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">{loading ? 'Logging out...' : 'Logout'}</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
