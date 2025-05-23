
import Link from 'next/link';
import Image from 'next/image'; // Import Image
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-white text-black shadow-md">
      <div className="container mx-auto flex h-28 items-center justify-between px-4 md:px-6"> {/* Adjusted height for larger logo */}
        <Link href="/" className="flex items-center gap-2">
          {/* 
            Ensure KFC-Logo.png is located at public/images/KFC-Logo.png
            The path in `src` must start with `/` and is relative to the `public` folder.
          */}
          <Image
            src="/images/KFC-Logo.png"
            alt="KFC Logo"
            width={100}
            height={100}
            priority={false} // Default is false, added to ensure a change is registered
          />
          <h1 className="text-sm font-bold font-national tracking-tight text-kfc-header-brand-red">KFC Rewards Tracker</h1>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" className="text-black hover:bg-gray-100" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
          <Button variant="ghost" className="text-black hover:bg-gray-100" asChild>
            <Link href="/signup">
              <UserPlus className="mr-2 h-4 w-4" />
              Sign Up
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
