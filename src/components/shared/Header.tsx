import Link from 'next/link';
import Image from 'next/image'; // Import Image
import { LogIn, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-white text-black shadow-md">
      <div className="container mx-auto flex h-28 items-center justify-between px-4 md:px-6"> {/* Adjusted height for larger logo */}
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/images/KFC-Logo.png"
            alt="KFC Logo"
            width={100} // Changed from 50
            height={100} // Changed from 32
          />
          <h1 className="text-xl font-bold tracking-tight text-kfc-header-brand-red">KFC Rewards Tracker</h1>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" className="text-black hover:bg-gray-100" asChild>
            <Link href="/login">
              <span className="flex items-center gap-1">
                <LogIn className="h-4 w-4" />
                Login
              </span>
            </Link>
          </Button>
          <Button variant="ghost" className="text-black hover:bg-gray-100" asChild>
            <Link href="/signup">
              <span className="flex items-center gap-1">
                <UserPlus className="h-4 w-4" />
                Sign Up
              </span>
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
