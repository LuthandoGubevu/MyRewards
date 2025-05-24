
export interface MockUser {
  id: string;
  name: string;
  email: string;
  totalPoints: number;
  lastVisitDate: string;
  visitsCount: number;
}

export const mockUsers: MockUser[] = [
  { id: '1', name: 'Colonel Sanders', email: 'colonel@kfc.com', totalPoints: 1250, lastVisitDate: '2024-07-20', visitsCount: 50 },
  { id: '2', name: 'John Doe', email: 'john.doe@example.com', totalPoints: 350, lastVisitDate: '2024-07-18', visitsCount: 12 },
  { id: '3', name: 'Jane Smith', email: 'jane.smith@example.com', totalPoints: 780, lastVisitDate: '2024-07-21', visitsCount: 25 },
  { id: '4', name: 'Alice Brown', email: 'alice.brown@example.com', totalPoints: 150, lastVisitDate: '2024-06-30', visitsCount: 5 },
  { id: '5', name: 'Bob Green', email: 'bob.green@example.com', totalPoints: 950, lastVisitDate: '2024-07-19', visitsCount: 33 },
];

export const mockAdminStats = {
  totalRegisteredUsers: mockUsers.length,
  activeUsersLast7Days: Math.floor(mockUsers.length * 0.6), // Mocked
  activeUsersLast30Days: Math.floor(mockUsers.length * 0.8), // Mocked
  inactiveUsers: mockUsers.length - Math.floor(mockUsers.length * 0.8), // Mocked
  totalPointsIssued: mockUsers.reduce((sum, user) => sum + user.totalPoints, 0) + 2000, // Mocked
  totalPointsRedeemed: mockUsers.reduce((sum, user) => sum + user.totalPoints, 0) * 0.4, // Mocked
  averagePointsPerPatron: (mockUsers.reduce((sum, user) => sum + user.totalPoints, 0) / mockUsers.length).toFixed(0),
  pointsDistribution: [ // Mocked
    { name: '0-100', users: 1 },
    { name: '101-300', users: 1 },
    { name: '301-700', users: 1 },
    { name: '701-1000', users: 2 },
    { name: '>1000', users: 1 },
  ],
  totalRewardsClaimed: 75, // Mocked
  mostPopularReward: 'FREE Piece of chicken', // Mocked
  redemptionRate: 60, // Mocked %
  visitsPerDay: [ // Mocked
    { date: '2024-07-15', visits: 120 },
    { date: '2024-07-16', visits: 150 },
    { date: '2024-07-17', visits: 130 },
    { date: '2024-07-18', visits: 160 },
    { date: '2024-07-19', visits: 140 },
    { date: '2024-07-20', visits: 170 },
    { date: '2024-07-21', visits: 155 },
  ],
  qrScanTrends: [ // Mocked
    { date: '2024-07-15', scans: 80 },
    { date: '2024-07-16', scans: 95 },
    { date: '2024-07-17', scans: 85 },
    { date: '2024-07-18', scans: 100 },
    { date: '2024-07-19', scans: 90 },
    { date: '2024-07-20', scans: 110 },
    { date: '2024-07-21', scans: 105 },
  ],
};

    