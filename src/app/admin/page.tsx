
"use client";

import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MetricCard } from '@/components/admin/MetricCard';
import type { MockUser } from '@/lib/mockAdminData'; // Keep type for table structure
import { Users, Activity, Gift, BarChart3, TrendingUp, Download, Settings, ScanLine, UserPlus, ListChecks, Clock, Award, Trophy, Phone } from 'lucide-react'; // Added Award, Trophy, Phone
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, Area, AreaChart } from "recharts"
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore';
import { differenceInDays, format, startOfDay, subDays, eachDayOfInterval, parseISO } from 'date-fns';
import type { Milestone } from '@/types'; // For milestone definitions

// Define milestones similarly to useRewards.ts for consistency in admin view
const adminMilestones: Milestone[] = [
  { id: 'm1', points: 100, reward: '100 Points Reward', description: '...', icon: Gift },
  { id: 'm2', points: 300, reward: '300 Points Reward', description: '...', icon: Gift },
  { id: 'm3', points: 700, reward: '700 Points Reward', description: '...', icon: Award },
  { id: 'm4', points: 1000, reward: '1000 Points Reward', description: '...', icon: Trophy },
];

const chartConfigVisits = {
  scans: { label: "Scans", color: "hsl(var(--chart-3))" },
} satisfies Record<string, any>;

const chartConfigSignups = {
  signups: { label: "Daily Signups", color: "hsl(var(--chart-4))" },
} satisfies Record<string, any>;

const chartConfigMilestoneRedemptions = {
  count: { label: "Users Reached", color: "hsl(var(--chart-5))" },
} satisfies Record<string, any>;

const chartConfigPointsDistribution = {
  users: { label: "Users", color: "hsl(var(--chart-1))" },
} satisfies Record<string, any>;

interface UserDataForTable extends MockUser { 
  lastLoginDate?: string; 
  phoneNumber?: string; // Added phoneNumber
}

export default function AdminPage() {
  console.log("AdminPage component rendering...");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [isDataLoading, setIsDataLoading] = useState(true);

  // State for real data metrics
  const [totalRegisteredUsers, setTotalRegisteredUsers] = useState<number | string>("Loading...");
  const [activeUsers30Days, setActiveUsers30Days] = useState<number | string>("Loading...");
  const [totalScans, setTotalScans] = useState<number | string>("Loading...");
  const [totalPointsIssued, setTotalPointsIssued] = useState<number | string>("Loading...");

  // State for chart data
  const [scansPerDayData, setScansPerDayData] = useState<any[]>([]);
  const [rewardRedemptionsData, setRewardRedemptionsData] = useState<any[]>([]);
  const [dailySignupsData, setDailySignupsData] = useState<any[]>([]);
  const [pointsDistributionData, setPointsDistributionData] = useState<any[]>([]);
  
  // State for user table data
  const [userTableData, setUserTableData] = useState<UserDataForTable[]>([]);


  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to view this page.",
      });
      router.push('/'); 
      return;
    }

    if (user?.isAdmin && !authLoading) {
      const fetchData = async () => {
        setIsDataLoading(true);
        try {
          // Fetch all users
          const usersCollectionRef = collection(db, 'users');
          const usersSnapshot = await getDocs(usersCollectionRef);
          const fetchedUsers = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

          setTotalRegisteredUsers(fetchedUsers.length);

          let sumPoints = 0;
          fetchedUsers.forEach(u => {
            sumPoints += u.points || 0;
          });
          setTotalPointsIssued(sumPoints);

          const thirtyDaysAgo = subDays(new Date(), 30);
          const activeCount = fetchedUsers.filter(u => u.lastLogin && (u.lastLogin as Timestamp).toDate() > thirtyDaysAgo).length;
          setActiveUsers30Days(activeCount);

          // Prepare user table data
          setUserTableData(fetchedUsers.map(u => ({
            id: u.id,
            name: u.name || 'N/A',
            email: u.email,
            phoneNumber: u.phoneNumber || 'N/A', // Added phoneNumber
            totalPoints: u.points || 0,
            lastVisitDate: u.lastLogin ? format((u.lastLogin as Timestamp).toDate(), 'yyyy-MM-dd') : 'N/A',
            visitsCount: u.visitsCount || 0,
            claimedRewardsCount: u.claimedRewardsCount || 0,
          })));
          
          // Calculate Daily Signups (last 7 days)
          const sevenDaysAgo = startOfDay(subDays(new Date(), 7));
          const recentSignups = fetchedUsers.filter(u => u.createdAt && (u.createdAt as Timestamp).toDate() >= sevenDaysAgo);
          const signupsByDay: Record<string, number> = {};
          eachDayOfInterval({ start: sevenDaysAgo, end: startOfDay(new Date()) }).forEach(day => {
            signupsByDay[format(day, 'yyyy-MM-dd')] = 0;
          });
          recentSignups.forEach(u => {
            const signupDate = format((u.createdAt as Timestamp).toDate(), 'yyyy-MM-dd');
            if (signupsByDay[signupDate] !== undefined) {
              signupsByDay[signupDate]++;
            }
          });
          setDailySignupsData(Object.entries(signupsByDay).map(([date, count]) => ({ date, signups: count })).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()));

          // Calculate Points Distribution
          const pointsBuckets = { '0-100': 0, '101-300': 0, '301-700': 0, '701-1000': 0, '>1000': 0 };
          fetchedUsers.forEach(u => {
            const p = u.points || 0;
            if (p <= 100) pointsBuckets['0-100']++;
            else if (p <= 300) pointsBuckets['101-300']++;
            else if (p <= 700) pointsBuckets['301-700']++;
            else if (p <= 1000) pointsBuckets['701-1000']++;
            else pointsBuckets['>1000']++;
          });
          setPointsDistributionData(Object.entries(pointsBuckets).map(([name, users]) => ({ name, users })));

          // Calculate Reward Redemptions (users who reached milestone points)
          const redemptions = adminMilestones.map(m => ({
            milestone: `${m.points} PTS`,
            count: fetchedUsers.filter(u => (u.points || 0) >= m.points).length,
          }));
          setRewardRedemptionsData(redemptions);

          // Fetch scans data
          try {
            const scansCollectionRef = collection(db, 'scans');
            const scansSnapshot = await getDocs(scansCollectionRef);
            setTotalScans(scansSnapshot.size);
            const fetchedScans = scansSnapshot.docs.map(doc => doc.data() as { timestamp: Timestamp });

            // Calculate Scans Per Day (last 7 days)
            const recentScans = fetchedScans.filter(s => s.timestamp && s.timestamp.toDate() >= sevenDaysAgo);
            const scansByDay: Record<string, number> = {};
            eachDayOfInterval({ start: sevenDaysAgo, end: startOfDay(new Date()) }).forEach(day => {
                scansByDay[format(day, 'yyyy-MM-dd')] = 0;
            });
            recentScans.forEach(s => {
                const scanDate = format(s.timestamp.toDate(), 'yyyy-MM-dd');
                if (scansByDay[scanDate] !== undefined) {
                    scansByDay[scanDate]++;
                }
            });
            setScansPerDayData(Object.entries(scansByDay).map(([date, count]) => ({ date, scans: count })).sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime()));

          } catch (scanError: any) {
            console.warn("Error fetching scans collection (it might not exist or rules deny access):", scanError);
            toast({
              variant: "default",
              title: "Scan Data Unavailable",
              description: "Could not load QR scan totals or daily scan data. The 'scans' collection might be missing or inaccessible.",
            });
            setTotalScans(0);
            setScansPerDayData(
              eachDayOfInterval({ start: sevenDaysAgo, end: startOfDay(new Date()) })
                .map(day => ({ date: format(day, 'yyyy-MM-dd'), scans: 0 }))
                .sort((a,b) => parseISO(a.date).getTime() - parseISO(b.date).getTime())
            );
          }

        } catch (error: any) {
          console.error("Error fetching admin dashboard data:", error);
          let description = "Could not load real-time data for the dashboard.";
          if (error.code === 'permission-denied') {
            description = "Permission denied when fetching data. Please check Firestore security rules.";
          }
          toast({
            variant: "destructive",
            title: "Data Fetch Error",
            description: description,
          });
          // Fallback to N/A or 0 if fetching fails
          setTotalRegisteredUsers("N/A");
          setActiveUsers30Days("N/A");
          setTotalScans("N/A");
          setTotalPointsIssued("N/A");
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user, authLoading, router, toast]);

  if (authLoading || isDataLoading) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <p className="text-lg">Loading Admin Dashboard & Verifying Permissions...</p>
      </div>
    );
  }
  
  if (!user || !user.isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <p className="text-lg text-destructive">Access Denied. You are not authorized to view this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-background text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Admin Settings
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Total Registered Users" value={totalRegisteredUsers} icon={Users} />
        <MetricCard title="Active Users (30 days)" value={activeUsers30Days} icon={Activity} description="Users logged in last 30 days" />
        <MetricCard title="Total QR Scans" value={totalScans} icon={ScanLine} description="All-time scans" />
        <MetricCard title="Total Points Issued" value={totalPointsIssued} icon={Gift} />
      </div>
      
      {/* Charts & Graphs Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Scans Per Day</CardTitle>
            <CardDescription>Scans over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              {scansPerDayData.length > 0 ? (
                <ChartContainer config={chartConfigVisits} className="h-full w-full">
                  <LineChart accessibilityLayer data={scansPerDayData} margin={{ left: 12, right: 12 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => format(parseISO(value), 'MMM d')} />
                    <YAxis />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Line dataKey="scans" type="monotone" stroke="var(--color-scans)" strokeWidth={2} dot={true} name="Scans" />
                  </LineChart>
                </ChartContainer>
              ) : <p className="text-muted-foreground">No scan data available for the last 7 days.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Reward Redemptions by Milestone</CardTitle>
            <CardDescription>Number of users who have reached point milestones.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
            {rewardRedemptionsData.length > 0 ? (
              <ChartContainer config={chartConfigMilestoneRedemptions} className="h-full w-full">
                <BarChart accessibilityLayer data={rewardRedemptionsData}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="milestone" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} name="Users Reached" />
                </BarChart>
              </ChartContainer>
            ) : <p className="text-muted-foreground">No milestone data available.</p>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><UserPlus className="mr-2 h-5 w-5 text-primary" />Daily Signups</CardTitle>
            <CardDescription>New user registrations per day for the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
            {dailySignupsData.length > 0 ? (
              <ChartContainer config={chartConfigSignups} className="h-full w-full">
                <AreaChart accessibilityLayer data={dailySignupsData} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => format(parseISO(value), 'MMM d')}/>
                  <YAxis allowDecimals={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area dataKey="signups" type="monotone" fill="var(--color-signups)" stroke="var(--color-signups)" stackId="a" name="Signups" />
                </AreaChart>
              </ChartContainer>
             ) : <p className="text-muted-foreground">No signup data available for the last 7 days.</p>}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Points Distribution</CardTitle>
             <CardDescription>Current distribution of points among users.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard title="Avg. Points/Patron" value={totalRegisteredUsers > 0 && typeof totalRegisteredUsers === 'number' && typeof totalPointsIssued === 'number' ? (totalPointsIssued / totalRegisteredUsers).toFixed(1) : "0"} />
              <MetricCard title="Total Points Redeemed" value={"N/A (mock)"} />
            </div>
            <div className="h-[200px] w-full">
            {pointsDistributionData.length > 0 ? (
               <ChartContainer config={chartConfigPointsDistribution} className="h-full w-full">
                  <BarChart accessibilityLayer data={pointsDistributionData}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="users" fill="var(--color-users)" radius={4} name="Users in Range"/>
                  </BarChart>
                </ChartContainer>
                 ) : <p className="text-muted-foreground">No points distribution data available.</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />User Management</CardTitle>
          <CardDescription>List of all registered users. (Search and sort are placeholders)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone Number</TableHead> 
                <TableHead className="text-right">Current Points</TableHead>
                <TableHead className="text-right">Total Visits</TableHead>
                <TableHead>Last Activity</TableHead>
                <TableHead className="text-right">Claimed Rewards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {userTableData.length > 0 ? userTableData.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.phoneNumber || 'N/A'}</TableCell>
                  <TableCell className="text-right">{u.totalPoints}</TableCell>
                  <TableCell className="text-right">{u.visitsCount}</TableCell>
                  <TableCell>{u.lastVisitDate}</TableCell> 
                  <TableCell className="text-right">{u.claimedRewardsCount}</TableCell>
                </TableRow>
              )) : (
                <TableRow><TableCell colSpan={7} className="text-center">No users found.</TableCell></TableRow> 
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Placeholder Sections */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><ListChecks className="mr-2 h-5 w-5 text-primary" />Reward Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Detailed statistics per reward, time to redemption, and missed opportunities will be displayed here. (Placeholder)</p>
             <Button variant="outline" className="mt-4 w-full" disabled>View Reward Stats (Soon)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" />Activity Feed / Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">A real-time feed of recent QR scans, reward claims, and user milestone achievements will appear here. (Placeholder)</p>
            <Button variant="outline" className="mt-4 w-full" disabled>View Activity (Soon)</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Download className="mr-2 h-5 w-5 text-primary" />Admin Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">Tools for data export and user management. (Placeholder)</p>
            <Button variant="outline" className="w-full" disabled><Download className="mr-2 h-4 w-4" />Export User Data (CSV)</Button>
            <Button variant="outline" className="w-full" disabled>Manually Adjust Points</Button>
            <Button variant="outline" className="w-full" disabled>Push Promotions</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
