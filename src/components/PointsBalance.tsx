"use client";

import { Coins } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect, useState } from 'react';

interface PointsBalanceProps {
  points: number;
}

export function PointsBalance({ points }: PointsBalanceProps) {
  const [displayPoints, setDisplayPoints] = useState(points);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (points !== displayPoints) {
      setAnimate(true);
      // Update displayed points after a short delay for animation effect
      const timer = setTimeout(() => setDisplayPoints(points), 100); 
      const animationTimer = setTimeout(() => setAnimate(false), 300); // Duration of point-pop animation
      return () => {
        clearTimeout(timer);
        clearTimeout(animationTimer);
      }
    }
  }, [points, displayPoints]);

  return (
    <Card className="shadow-lg w-full md:w-auto">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">Your Points</CardTitle>
        <Coins className="h-5 w-5 text-primary" />
      </CardHeader>
      <CardContent>
        <div className={`text-4xl font-bold text-primary ${animate ? 'point-pop' : ''}`}>
          {displayPoints}
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Keep collecting to unlock more rewards!
        </p>
      </CardContent>
    </Card>
  );
}
