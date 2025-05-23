
"use client";

import type { Milestone } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScanLine } from "lucide-react";
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
          className="stroke-white/30" // Changed from hsl(var(--muted))
          strokeWidth="3"
          fill="none"
          d={`M18 2.0845
             a ${radius} ${radius} 0 0 1 0 ${2 * radius}
             a ${radius} ${radius} 0 0 1 0 ${-(2 * radius)}`}
        />
      </svg>
      <svg viewBox="0 0 36 36" className="absolute w-full h-full -rotate-90 origin-center">
        <path
          className="stroke-white transition-all duration-500 ease-out" // Changed from hsl(var(--primary))
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
        <span className="text-3xl sm:text-4xl font-bold text-white">{points}</span> {/* Changed from text-primary */}
        <span className="text-xs text-white/80 uppercase tracking-wider">{pointsLabel}</span> {/* Changed from text-muted-foreground */}
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
    progressToNextPercentage = 100;
    if (points >= finalMilestonePoints) {
      // Ensure sortedMilestones is not empty before accessing its last element
      if (sortedMilestones.length > 0) {
        nextMilestone = sortedMilestones[sortedMilestones.length - 1];
      }
      pointsForNextMilestoneText = "You've unlocked all rewards!";
    }
  }

  if (milestones.length === 0) {
    return <p>Loading loyalty information...</p>;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <Card className="shadow-xl overflow-hidden bg-gradient-to-br from-kfc-header-brand-red to-[#ff4d6d] text-white rounded-2xl">
        <CardContent className="p-6 flex flex-col items-center space-y-4"> {/* Removed bg-card */}
          <CircularProgress
            percentage={progressToNextPercentage}
            points={points}
            pointsLabel="TOTAL POINTS"
          />
          <div className="text-center h-16 flex flex-col justify-center">
            {nextMilestone ? (
              <>
                <p className="text-md sm:text-lg font-medium text-white/80"> {/* Changed from text-muted-foreground */}
                  {pointsForNextMilestoneText}
                </p>
                <p className="text-white text-lg sm:text-xl font-semibold">{nextMilestone.reward}</p> {/* Changed from text-primary */}
              </>
            ) : (
              <p className="text-lg font-semibold text-white">No upcoming rewards. Keep collecting!</p> /* Changed from text-primary */
            )}
          </div>

          <Button
            asChild
            size="lg"
            className="w-full max-w-xs mt-2 bg-white text-kfc-header-brand-red hover:bg-white/90" // Custom button style for contrast
          >
            <Link href="/scan" className="flex items-center justify-center">
              <ScanLine className="h-5 w-5 mr-2" />
              Scan QR Code
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-xl bg-gradient-to-br from-kfc-header-brand-red to-[#ff4d6d] text-white rounded-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-white">Your Journey</CardTitle> {/* Changed from text-primary */}
          <CardDescription className="text-white/80">You're {overallProgressPercentage.toFixed(0)}% towards Colonel's Elite status!</CardDescription> {/* Changed from text-muted-foreground */}
        </CardHeader>
        <CardContent className="space-y-3">
          <Progress
            value={overallProgressPercentage}
            className="h-3 bg-white/30 [&>div]:bg-white" // Custom progress bar colors
          />
          <div className="flex justify-between text-xs text-white/80 font-medium"> {/* Changed from text-muted-foreground */}
            <span>Start</span>
            <span>{finalMilestonePoints} PTS</span>
            <span>Colonel's Elite</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
