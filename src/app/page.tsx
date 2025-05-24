
"use client";

import { useRewards } from '@/hooks/useRewards';
import { LoyaltyDashboard } from '@/components/LoyaltyDashboard';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext'; // Import useAuth

export default function HomePage() {
  const { user } = useAuth(); // Get user from AuthContext
  const {
    points,
    milestones,
    achievedMilestoneIds,
    isResetDialogOpen,
    handleResetConfirm,
    handleCloseResetDialog
  } = useRewards();

  const MAX_POINTS_FOR_RESET_PROMPT = 1000;


  return (
    <div className="flex flex-col items-center space-y-8 py-6 md:py-8">
      <LoyaltyDashboard
        points={points}
        milestones={milestones}
        achievedMilestoneIds={achievedMilestoneIds}
        userName={user?.name} // Pass userName to LoyaltyDashboard
      />

      <AlertDialog open={isResetDialogOpen} onOpenChange={handleCloseResetDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <Star className="h-12 w-12 text-yellow-400" />
            </div>
            <AlertDialogTitle className="text-center text-2xl font-bold">Journey Complete!</AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground pt-2">
              Congratulations! You've collected {MAX_POINTS_FOR_RESET_PROMPT} points and unlocked all current rewards.
              Would you like to reset your points to start a new reward journey?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="grid grid-cols-2 gap-2 pt-4">
            <AlertDialogCancel onClick={handleCloseResetDialog} className="w-full">Not Now</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetConfirm} className="w-full">Yes, Reset!</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
