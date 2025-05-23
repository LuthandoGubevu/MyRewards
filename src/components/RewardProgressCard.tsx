
"use client";

import type { FC } from 'react';

interface RewardProgressCardProps {
  title?: string;
  subtitle?: string;
  className?: string;
}

export const RewardProgressCard: FC<RewardProgressCardProps> = ({
  title = "Your Rewards",
  subtitle = "Track your progress and unlock exclusive perks.",
  className = "",
}) => {
  return (
    <div
      className={`bg-gradient-to-br from-[#e4002b] to-[#99001a] rounded-2xl p-6 shadow-lg text-white ${className}`}
    >
      <h2 className="text-2xl font-bold mb-1">{title}</h2>
      <p className="text-sm text-white/80">{subtitle}</p>
    </div>
  );
};
