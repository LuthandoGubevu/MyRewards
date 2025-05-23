
import Link from 'next/link';
import Image from 'next/image'; // Import Image

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
        {/* Login and Sign Up buttons removed */}
      </div>
    </header>
  );
}

