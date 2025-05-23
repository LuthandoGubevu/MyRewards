"use client";

import type { Milestone } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Gift, ScanLine } from "lucide-react"; // Using Gift as a default icon
import Link from "next/link";

// Helper for SVG circular progress
const CircularProgress = ({ 
  percentage, 
  points, 
  pointsLabel = "PTS" 
}: { 
  percentage: number; 
  points: string | number; 
  pointsLabel?: string 
}) => {
  const radius = 15.9155; // Chosen so circumference is approx 100
  const circumference = 2 * Math.PI * radius;
  // Clamp percentage between 0 and 100
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const strokeDashoffset = circumference - (clampedPercentage / 100) * circumference;

  return (
    <div className="relative w-36 h-36 sm:w-40 sm:h-40">
      <svg viewBox="0 0 36 36" className="absolute w-full h-full">
        <path
          className="stroke-[hsl(var(--muted))]"
          strokeWidth="3"
          fill="none"
          d={`M18 2.0845
             a ${radius} ${radius} 0 0 1 0 ${2 * radius}
             a ${radius} ${radius} 0 0 1 0 ${-(2 * radius)}`}
        />
      </svg>
      <svg viewBox="0 0 36 36" className="absolute w-full h-full -rotate-90 origin-center">
        <path
          className="stroke-[hsl(var(--primary))] transition-all duration-500 ease-out"
          strokeWidth="3"
          fill="none"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          d={`M18 2.0845
             a ${radius} ${radius} 0 0 1 0 ${2 * radius}
             a ${radius} ${radius} 0 0 1 0 ${-(2 * radius)}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl font-bold text-primary">{points}</span>
        <span className="text-xs text-muted-foreground uppercase tracking-wider">{pointsLabel}</span>
      </div>
    </div>
  );
};

interface LoyaltyDashboardProps {
  points: number;
  milestones: Milestone[];
  achievedMilestoneIds: Set<string>;
}

export function LoyaltyDashboard({ points, milestones, achievedMilestoneIds }: LoyaltyDashboardProps) {
  const finalMilestonePoints = Math.max(...milestones.map(m => m.points), 1);
  const overallProgressPercentage = Math.min((points / finalMilestonePoints) * 100, 100);

  let nextMilestone: Milestone | null = null;
  let pointsForNextMilestoneText = "";
  let progressToNextPercentage = 0;
  
  const sortedMilestones = [...milestones].sort((a, b) => a.points - b.points);
  
  let previousMilestonePoints = 0;
  for (const ms of sortedMilestones) {
    if (points < ms.points) {
      nextMilestone = ms;
      break;
    }
    previousMilestonePoints = ms.points;
  }

  if (nextMilestone) {
    const pointsInCurrentSegment = points - previousMilestonePoints;
    const segmentTotal = nextMilestone.points - previousMilestonePoints;
    progressToNextPercentage = segmentTotal > 0 ? (pointsInCurrentSegment / segmentTotal) * 100 : 0;
    const pointsNeeded = nextMilestone.points - points;
    pointsForNextMilestoneText = `${pointsNeeded} more points to your next reward:`;
  } else {
    // All milestones achieved or at/past final milestone
    progressToNextPercentage = 100; // Ring shows full if all done or past last
    if (points >= finalMilestonePoints) {
      nextMilestone = sortedMilestones[sortedMilestones.length - 1]; // Show last reward
      pointsForNextMilestoneText = "You've unlocked all rewards!";
    }
  }
  
  // If no milestones defined, or some other edge case.
  if (milestones.length === 0) {
    return <p>Loading loyalty information...</p>;
  }


  return (
    <div className="space-y-6 md:space-y-8">
      <Card className="shadow-xl overflow-hidden">
        <CardContent className="p-6 flex flex-col items-center space-y-4 bg-card">
          <CircularProgress 
            percentage={progressToNextPercentage}
            points={points} // Display current total points in the center
            pointsLabel="TOTAL POINTS"
          />
          <div className="text-center h-16 flex flex-col justify-center"> {/* Fixed height for text area */}
            {nextMilestone ? (
              <>
                <p className="text-md sm:text-lg font-medium text-muted-foreground">
                  {pointsForNextMilestoneText}
                </p>
                <p className="text-primary text-lg sm:text-xl font-semibold">{nextMilestone.reward}</p>
              </>
            ) : (
              <p className="text-lg font-semibold text-primary">No upcoming rewards. Keep collecting!</p>
            )}
          </div>
          
          <Button asChild size="lg" className="w-full max-w-xs mt-2">
            <Link href="/scan" className="flex items-center justify-center">
              <ScanLine className="h-5 w-5 mr-2" />
              Scan QR Code
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-primary">Your Journey</CardTitle>
          <CardDescription>You're {overallProgressPercentage.toFixed(0)}% towards Colonel's Elite status!</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress value={overallProgressPercentage} className="h-3" />
          <div className="flex justify-between text-xs text-muted-foreground font-medium">
            <span>Start</span>
            <span>{finalMilestonePoints} PTS</span> 
            <span>Colonel's Elite</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
