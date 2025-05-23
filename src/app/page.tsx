"use client";

import { PointsBalance } from '@/components/PointsBalance';
import { RewardTracker } from '@/components/RewardTracker';
import { QrScanner } from '@/components/QrScanner';
import { useRewards } from '@/hooks/useRewards';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

export default function HomePage() {
  const { points, milestones, addPoint, achievedMilestoneIds, resetPoints } = useRewards();

  return (
    <div className="flex flex-col items-center space-y-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl items-start">
        <div className="md:col-span-1 flex flex-col items-center md:items-start space-y-6">
          <PointsBalance points={points} />
          <QrScanner onScanSuccess={addPoint} />
           <Button variant="outline" onClick={resetPoints} className="w-full md:w-auto">
            <RotateCcw className="mr-2 h-4 w-4" /> Reset Points
          </Button>
        </div>
        <div className="md:col-span-2">
          <RewardTracker currentPoints={points} milestones={milestones} achievedMilestoneIds={achievedMilestoneIds} />
        </div>
      </div>
    </div>
  );
}
