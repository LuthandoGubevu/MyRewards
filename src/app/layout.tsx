import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google'; // Using Inter as a common sans-serif
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-geist-sans", // Keep variable name for potential Geist compatibility
});


export const metadata: Metadata = {
  title: 'KFC Rewards Tracker',
  description: 'Track your KFC points and earn rewards!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased flex flex-col",
          fontSans.variable
        )}
      >
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 md:px-6">
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
