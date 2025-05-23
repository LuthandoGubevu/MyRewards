
import Link from 'next/link';
import Image from 'next/image'; // Import Image

export function Header() {
  return (
    <header className="bg-black"> {/* Changed background to black, removed text-black and shadow-md */}
      <div className="container mx-auto flex h-28 items-center justify-center px-4 md:px-6"> {/* Changed justify-between to justify-center */}
        <Link href="/" className="flex items-center"> {/* Removed gap-2 as there's only one item now */}
          {/* 
            Ensure KFC-Logo.png is located at public/images/KFC-Logo.png
            The path in `src` must start with `/` and is relative to the `public` folder.
          */}
          <Image
            src="/images/KFC-Logo.png"
            alt="KFC Logo"
            width={100}
            height={100}
            priority={false}
          />
          {/* Title removed */}
        </Link>
        {/* Login and Sign Up buttons were previously removed */}
      </div>
    </header>
  );
}
