
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link'; // Added Link

// QrScannerProps is no longer needed as onScanSuccess is removed
// interface QrScannerProps {
//   onScanSuccess: () => void; // This prop is removed
// }

export function QrScanner(/* Removed onScanSuccess prop */) {
  return (
    <Card className="shadow-lg w-full md:max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-primary flex items-center justify-center gap-2">
          <QrCode className="h-7 w-7" /> Scan to Earn
        </CardTitle>
        <CardDescription>Scan QR codes on your receipts to add points.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4">
        <div className="w-48 h-48 bg-secondary rounded-lg flex items-center justify-center overflow-hidden">
          {/* Static image, no scanning animation needed here anymore */}
          <Image 
            src="https://placehold.co/200x200.png" 
            alt="QR Code Placeholder" 
            width={200} 
            height={200} 
            data-ai-hint="qr code" 
            className="object-cover"
          />
        </div>
        <Button asChild className="w-full">
          <Link href="/scan">
            <Camera className="mr-2 h-5 w-5" /> Open Scanner
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Click the button to open the camera and scan a QR code.
        </p>
      </CardContent>
    </Card>
  );
}
