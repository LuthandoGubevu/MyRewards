
"use client";

import { RealTimeQrScanner } from '@/components/RealTimeQrScanner';
import { useRewards } from '@/hooks/useRewards';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, ScanLine } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ScanPage() {
  const { addPoint } = useRewards();

  return (
    <div className="flex flex-col items-center space-y-6 py-8 min-h-[calc(100vh-12rem)] justify-center">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="items-center text-center">
          <ScanLine className="h-12 w-12 text-primary mb-2" />
          <CardTitle className="text-3xl font-bold">Scan QR Code</CardTitle>
          <CardDescription>Point your camera at a QR code on your receipt to earn points.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <RealTimeQrScanner onScanSuccess={addPoint} />
          <Button variant="outline" asChild className="mt-6 w-full max-w-xs">
            <Link href="/dashboard"> {/* Updated Link */}
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
