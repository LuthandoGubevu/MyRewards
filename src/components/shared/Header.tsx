import Link from 'next/link';
import { LogIn, UserPlus, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-white text-black shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Utensils className="h-8 w-8" />
          <h1 className="text-xl font-bold tracking-tight">KFC Rewards Tracker</h1>
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
