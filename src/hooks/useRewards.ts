
"use client";

import { useState, useCallback, useMemo } from 'react';
import type { Milestone } from '@/types';
import { Gift, Award, Trophy, Star } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


const initialMilestones: Milestone[] = [
  { id: 'm1', points: 1, reward: '1 FREE Piece of chicken', description: 'Enjoy a delicious piece of our famous chicken.', icon: Star },
  { id: 'm2', points: 3, reward: 'FREE Lip balm & Cap Dish', description: 'Some cool KFC swag to show your loyalty.', icon: Gift },
  { id: 'm3', points: 7, reward: 'Free Towel', description: 'A KFC branded towel, perfect for picnics or the beach.', icon: Award },
  { id: 'm4', points: 10, reward: 'Free Headphones', description: 'Listen to your tunes with these KFC headphones.', icon: Trophy },
];

export function useRewards() {
  const [points, setPoints] = useState(0);
  const [achievedMilestoneIds, setAchievedMilestoneIds] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const milestones = useMemo(() => initialMilestones, []);

  const addPoint = useCallback(() => {
    setPoints(prevPoints => {
      const newPoints = prevPoints + 1;
      const newlyAchieved = milestones.find(m => m.points === newPoints && !achievedMilestoneIds.has(m.id));
      
      if (newlyAchieved) {
        setAchievedMilestoneIds(prevIds => new Set(prevIds).add(newlyAchieved.id));
        toast({
          title: "🎉 Milestone Reached! 🎉",
          description: `You've earned: ${newlyAchieved.reward}!`,
          variant: "default",
        });
      } else {
         toast({
          title: "🍗 Point Added! 🍗",
          description: `You now have ${newPoints} point(s). Keep it up!`,
        });
      }
      return newPoints;
    });
  }, [milestones, achievedMilestoneIds, toast]);

  const resetPoints = useCallback(() => {
    setPoints(0);
    setAchievedMilestoneIds(new Set());
    toast({
      title: "Points Reset",
      description: "Your points have been reset to 0.",
    });
  }, [toast]);

  return { points, milestones, addPoint, achievedMilestoneIds, resetPoints };
}
