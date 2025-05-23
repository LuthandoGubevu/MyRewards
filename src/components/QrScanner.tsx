"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface QrScannerProps {
  onScanSuccess: () => void;
}

export function QrScanner({ onScanSuccess }: QrScannerProps) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScanClick = () => {
    setIsScanning(true);
    // Simulate scanning process
    setTimeout(() => {
      onScanSuccess();
      setIsScanning(false);
    }, 1500); // Simulate a 1.5 second scan
  };

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
          {isScanning ? (
            <div className="flex flex-col items-center text-primary">
              <Camera className="h-16 w-16 animate-pulse" />
              <p className="mt-2 text-sm">Scanning...</p>
            </div>
          ) : (
            <Image 
              src="https://placehold.co/200x200.png" 
              alt="QR Code Placeholder" 
              width={200} 
              height={200} 
              data-ai-hint="qr code" 
              className="object-cover"
            />
          )}
        </div>
        <Button onClick={handleScanClick} disabled={isScanning} className="w-full">
          {isScanning ? 'Processing...' : (
            <>
              <Camera className="mr-2 h-5 w-5" /> Scan QR Code
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          (This is a simulated QR scanner for demo purposes)
        </p>
      </CardContent>
    </Card>
  );
}
