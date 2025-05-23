"use client";

import type { Milestone } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Radio } from 'lucide-react'; // Changed RadioButton to Radio
import { useEffect, useState } from 'react';

interface RewardTrackerProps {
  currentPoints: number;
  milestones: Milestone[];
  achievedMilestoneIds: Set<string>;
}

export function RewardTracker({ currentPoints, milestones, achievedMilestoneIds }: RewardTrackerProps) {
  const maxPoints = Math.max(...milestones.map(m => m.points), 10); // Ensure progress bar has a sensible max
  const progressPercentage = (currentPoints / maxPoints) * 100;
  
  const [animatedMilestones, setAnimatedMilestones] = useState<Set<string>>(new Set());

  useEffect(() => {
    achievedMilestoneIds.forEach(id => {
      if (!animatedMilestones.has(id)) {
        // Add to animated set and trigger animation class
        setAnimatedMilestones(prev => new Set(prev).add(id));
        // Remove animation class after it plays
        setTimeout(() => {
          const element = document.getElementById(`milestone-${id}`);
          if (element) {
            element.classList.remove('milestone-achieved-animation');
          }
        }, 800); // Match animation duration
      }
    });
  }, [achievedMilestoneIds, animatedMilestones]);


  return (
    <Card className="shadow-lg w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">Your Reward Journey</CardTitle>
        <CardDescription>See how close you are to delicious rewards!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-foreground">Progress</span>
            <span className="text-sm font-medium text-primary">{currentPoints} / {maxPoints} Points</span>
          </div>
          <Progress value={progressPercentage} aria-label={`${currentPoints} out of ${maxPoints} points`} className="h-3 bg-secondary" />
        </div>
        
        <ul className="space-y-4">
          {milestones.map((milestone) => {
            const isAchieved = currentPoints >= milestone.points;
            const IconComponent = milestone.icon || Radio; // Updated to use Radio
            const shouldAnimate = animatedMilestones.has(milestone.id);

            return (
              <li 
                key={milestone.id} 
                id={`milestone-${milestone.id}`}
                className={`flex items-start p-4 rounded-lg border transition-all duration-300 ${
                isAchieved ? 'bg-primary/10 border-primary' : 'bg-muted/50 border-border'
              } ${shouldAnimate && isAchieved ? 'milestone-achieved-animation' : ''}`}
              >
                {isAchieved ? (
                  <CheckCircle2 className="h-8 w-8 text-primary mr-4 shrink-0 mt-1" />
                ) : (
                  <IconComponent className="h-8 w-8 text-muted-foreground mr-4 shrink-0 mt-1" />
                )}
                <div>
                  <h4 className={`font-semibold ${isAchieved ? 'text-primary' : 'text-foreground'}`}>
                    {milestone.reward} ({milestone.points} Points)
                  </h4>
                  <p className="text-sm text-muted-foreground">{milestone.description}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
