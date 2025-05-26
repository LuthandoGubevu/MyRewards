
"use client";

import React, { useState } from 'react';
import { Scanner as YudielQrScanner } from '@yudiel/react-qr-scanner';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, XCircle, CameraOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface RealTimeQrScannerProps {
  onScanSuccess: () => void; 
}

export function RealTimeQrScanner({ onScanSuccess }: RealTimeQrScannerProps) {
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleDecode = (result: string) => {
    setScanResult(result);
    setError(null); 
    onScanSuccess(); 
    console.log('Scanned QR Code:', result);
  };

  const handleError = (error: any) => {
    console.error('QR Scanner Error:', error);
    let errorMessage = 'Failed to initialize camera or scan QR code.';
    if (error?.name === 'NotAllowedError') {
      errorMessage = 'Camera access was denied. Please enable camera permissions in your browser settings and refresh the page.';
    } else if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError') {
      errorMessage = 'No suitable camera found. Please ensure a camera is connected, enabled, and not in use by another application.';
    } else if (error?.message) {
      if (error.message.toLowerCase().includes('permission denied')) {
         errorMessage = 'Camera access was denied. Please enable camera permissions in your browser settings and refresh the page.';
      } else if (error.message.toLowerCase().includes('no video input devices found')) {
         errorMessage = 'No camera found. Please ensure a camera is connected and enabled.';
      } else {
        errorMessage = `An error occurred: ${error.message}`;
      }
    }
    setError(errorMessage);
    setScanResult(null);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-md mx-auto">
      {!scanResult && !error && (
        <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden shadow-lg relative">
          <YudielQrScanner
            onDecode={handleDecode}
            onError={handleError}
            constraints={{ 
              audio: false, 
              video: { facingMode: 'environment' } 
            }}
            scanDelay={300}
            className="w-full h-full object-cover"
          />
           <div className="absolute inset-0 border-4 border-primary/50 rounded-lg pointer-events-none animate-pulse"></div>
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="w-full">
          <XCircle className="h-5 w-5" />
          <AlertTitle>Scan Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button onClick={() => { setError(null); setScanResult(null);}} className="mt-2">Try Again</Button>
        </Alert>
      )}

      {scanResult && (
        <Alert variant="default" className="w-full bg-green-50 border-green-300 text-green-700 dark:bg-green-900/30 dark:border-green-700 dark:text-green-300">
          <CheckCircle className="h-5 w-5 text-current" />
          <AlertTitle>Scan Successful!</AlertTitle>
          <AlertDescription>
            <p className="font-semibold">Scanned Data: <span className="font-normal break-all">{scanResult}</span></p>
            <p>A point has been added to your account!</p>
          </AlertDescription>
           <div className="flex gap-2 mt-3">
            <Button 
              onClick={() => setScanResult(null)} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Scan Another
            </Button>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')} // Updated Link
            >
              Back to Dashboard
            </Button>
           </div>
        </Alert>
      )}

      {!scanResult && error && (
         <div className="w-full aspect-video bg-muted rounded-lg shadow-lg flex flex-col items-center justify-center p-4">
            <CameraOff className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-center">Could not start QR scanner.</p>
        </div>
      )}
    </div>
  );
}
