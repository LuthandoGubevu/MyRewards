
"use client";

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode, Camera } from 'lucide-react';
import Link from 'next/link';

export function QrScanner() {
  return (
    <Card className="shadow-lg w-full md:max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-semibold text-primary flex items-center justify-center gap-2">
          <QrCode className="h-7 w-7" /> Scan to Earn
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center space-y-4 pt-6">
        <Button asChild className="w-full">
          <Link href="/scan">
            <Camera className="h-5 w-5" />
            Scan QR Code
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground text-center">
          Click the button to open the camera and scan a QR code.
        </p>
      </CardContent>
    </Card>
  );
}
