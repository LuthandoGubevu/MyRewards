
"use client";

import { PointsBalance } from '@/components/PointsBalance';
import { RewardTracker } from '@/components/RewardTracker';
import { QrScanner } from '@/components/QrScanner';
import { useRewards } from '@/hooks/useRewards';
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
import { Star } from 'lucide-react'; // Example icon for dialog

export default function HomePage() {
  const { 
    points, 
    milestones, 
    achievedMilestoneIds, 
    addPoint, // addPoint is still needed if QrScanner was to call it directly, but it's on /scan
    isResetDialogOpen,
    handleResetConfirm,
    handleCloseResetDialog
  } = useRewards();

  return (
    <div className="flex flex-col items-center space-y-8 py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl items-start">
        <div className="md:col-span-1 flex flex-col items-center md:items-start space-y-6">
          <PointsBalance points={points} />
          <QrScanner /> 
          {/* Reset Points button has been removed */}
        </div>
        <div className="md:col-span-2">
          <RewardTracker currentPoints={points} milestones={milestones} achievedMilestoneIds={achievedMilestoneIds} />
        </div>
      </div>

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

// Define MAX_POINTS_FOR_RESET_PROMPT here or import from a shared constants file if preferred
const MAX_POINTS_FOR_RESET_PROMPT = 1000;

