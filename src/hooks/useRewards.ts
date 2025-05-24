
"use client";

import { useState, useCallback, useMemo } from 'react';
import type { Milestone } from '@/types';
import { Gift, Award, Trophy, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const initialMilestones: Milestone[] = [
  { id: 'm1', points: 100, reward: 'First Gift', description: 'Specific to each store', icon: Star },
  { id: 'm2', points: 300, reward: 'Secong Gift', description: 'Specific to each store', icon: Gift },
  { id: 'm3', points: 700, reward: 'Third Gift', description: 'Specific to each store.', icon: Award },
  { id: 'm4', points: 1000, reward: 'Fourth Gift', description: 'Specific to each store', icon: Trophy },
];

const MAX_POINTS_FOR_RESET_PROMPT = 1000;

export function useRewards() {
  const [points, setPoints] = useState(0);
  const [achievedMilestoneIds, setAchievedMilestoneIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  const milestones = useMemo(() => initialMilestones, []);

  const _performReset = useCallback(() => {
    setPoints(0);
    setAchievedMilestoneIds(new Set());
    toast({
      title: "Points Reset!",
      description: "Your reward journey starts anew!",
      variant: "default",
    });
  }, [toast]);

  const addPoint = useCallback(() => {
    setPoints(prevPoints => {
      const newPoints = prevPoints + 1; // Assuming 1 point is added per scan, scale happens at milestone definition
      const newlyAchieved = milestones.find(m => m.points === newPoints && !achievedMilestoneIds.has(m.id));
      
      if (newlyAchieved) {
        setAchievedMilestoneIds(prevIds => new Set(prevIds).add(newlyAchieved.id));
        toast({
          title: "🎉 Milestone Reached! 🎉",
          description: `You've earned: ${newlyAchieved.reward}!`,
          variant: "default",
        });
        // Check if this is the MAX_POINTS_FOR_RESET_PROMPT milestone to trigger reset dialog
        if (newlyAchieved.points === MAX_POINTS_FOR_RESET_PROMPT) {
          setIsResetDialogOpen(true);
        }
      } else if (newPoints < MAX_POINTS_FOR_RESET_PROMPT || (newPoints === MAX_POINTS_FOR_RESET_PROMPT && !milestones.find(m => m.points === MAX_POINTS_FOR_RESET_PROMPT && achievedMilestoneIds.has(m.id)))) {
        // Only show "Point Added" if not triggering dialog or if points are still accumulating towards max
         toast({
          title: "🍗 Point Added! 🍗",
          description: `You now have ${newPoints} point(s). Keep it up!`,
        });
      }
      // If newPoints > MAX_POINTS_FOR_RESET_PROMPT and no reset occurred, no toast is shown by default here.
      // User has chosen not to reset.
      
      return newPoints;
    });
  }, [milestones, achievedMilestoneIds, toast, setIsResetDialogOpen]);

  const handleResetConfirm = useCallback(() => {
    _performReset();
    setIsResetDialogOpen(false);
  }, [_performReset, setIsResetDialogOpen]);

  const handleCloseResetDialog = useCallback(() => {
    setIsResetDialogOpen(false);
  }, [setIsResetDialogOpen]);

  return { 
    points, 
    milestones, 
    addPoint, 
    achievedMilestoneIds, 
    isResetDialogOpen, 
    handleResetConfirm, 
    handleCloseResetDialog,
    // Note: resetPoints is no longer exported for direct manual use from UI
  };
}

