import Link from 'next/link';
import { Gift, LogIn, UserPlus, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Utensils className="h-8 w-8" />
          <h1 className="text-xl font-bold tracking-tight">KFC Rewards Tracker</h1>
        </Link>
        <nav className="flex items-center gap-2 sm:gap-4">
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground" asChild>
            <Link href="/login">
              <LogIn className="h-4 w-4" />
              Login
            </Link>
          </Button>
          <Button variant="ghost" className="text-primary-foreground hover:bg-primary/80 hover:text-primary-foreground" asChild>
            <Link href="/signup">
              <UserPlus className="h-4 w-4" />
              Sign Up
            </Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
