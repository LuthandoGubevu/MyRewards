
export interface MockUser {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  lastVisitDate: string;
  visitsCount: number;
  claimedRewardsCount: number; // Added
}

export const mockUsers: MockUser[] = [
  { id: '1', name: 'Colonel Sanders', email: 'colonel@kfc.com', totalPoints: 1250, lastVisitDate: '2024-07-20', visitsCount: 50, claimedRewardsCount: 5 },
  { id: '2', name: 'John Doe', email: 'john.doe@example.com', totalPoints: 350, lastVisitDate: '2024-07-18', visitsCount: 12, claimedRewardsCount: 1 },
  { id: '3', name: 'Jane Smith', email: 'jane.smith@example.com', totalPoints: 780, lastVisitDate: '2024-07-21', visitsCount: 25, claimedRewardsCount: 3 },
  { id: '4', name: 'Alice Brown', email: 'alice.brown@example.com', totalPoints: 150, lastVisitDate: '2024-06-30', visitsCount: 5, claimedRewardsCount: 0 },
  { id: '5', name: 'Bob Green', email: 'bob.green@example.com', totalPoints: 950, lastVisitDate: '2024-07-19', visitsCount: 33, claimedRewardsCount: 4 },
];

export const mockAdminStats = {
  totalRegisteredUsers: mockUsers.length,
  activeUsersLast7Days: Math.floor(mockUsers.length * 0.6),
  activeUsersLast30Days: Math.floor(mockUsers.length * 0.8),
  inactiveUsers: mockUsers.length - Math.floor(mockUsers.length * 0.8),
  totalPointsIssued: mockUsers.reduce((sum, user) => sum + user.totalPoints, 0) + 2000,
  totalPointsRedeemed: mockUsers.reduce((sum, user) => sum + user.totalPoints, 0) * 0.4,
  averagePointsPerPatron: parseFloat((mockUsers.reduce((sum, user) => sum + user.totalPoints, 0) / mockUsers.length).toFixed(0)),
  totalScans: mockUsers.reduce((sum, user) => sum + user.visitsCount, 0) * 3, // Mock: scans are more frequent than visits

  pointsDistribution: [
    { name: '0-100', users: 1 },
    { name: '101-300', users: 1 },
    { name: '301-700', users: 1 },
    { name: '701-1000', users: 1 }, // Adjusted for new milestone
    { name: '>1000', users: 1 },
  ],
  totalRewardsClaimed: mockUsers.reduce((sum, user) => sum + user.claimedRewardsCount, 0),
  mostPopularReward: 'FREE Piece of chicken',
  redemptionRate: 60,
  visitsPerDay: [
    { date: '2024-07-15', visits: 120, scans: 150 },
    { date: '2024-07-16', visits: 150, scans: 180 },
    { date: '2024-07-17', visits: 130, scans: 160 },
    { date: '2024-07-18', visits: 160, scans: 200 },
    { date: '2024-07-19', visits: 140, scans: 170 },
    { date: '2024-07-20', visits: 170, scans: 210 },
    { date: '2024-07-21', visits: 155, scans: 190 },
  ],
  rewardRedemptionsByMilestone: [ // New
    { milestone: '100 PTS', count: mockUsers.filter(u => u.totalPoints >= 100).length * 0.8 }, // Approx
    { milestone: '300 PTS', count: mockUsers.filter(u => u.totalPoints >= 300).length * 0.7 },
    { milestone: '700 PTS', count: mockUsers.filter(u => u.totalPoints >= 700).length * 0.6 },
    { milestone: '1000 PTS', count: mockUsers.filter(u => u.totalPoints >= 1000).length * 0.5 },
  ],
  dailySignups: [ // New
    { date: '2024-07-15', signups: 5 },
    { date: '2024-07-16', signups: 8 },
    { date: '2024-07-17', signups: 6 },
    { date: '2024-07-18', signups: 10 },
    { date: '2024-07-19', signups: 7 },
    { date: '2024-07-20', signups: 12 },
    { date: '2024-07-21', signups: 9 },
  ],
  qrScanTrends: [
    { date: '2024-07-15', scans: 80 },
    { date: '2024-07-16', scans: 95 },
    { date: '2024-07-17', scans: 85 },
    { date: '2024-07-18', scans: 100 },
    { date: '2024-07-19', scans: 90 },
    { date: '2024-07-20', scans: 110 },
    { date: '2024-07-21', scans: 105 },
  ],
};
