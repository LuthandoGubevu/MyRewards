
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MetricCard } from '@/components/admin/MetricCard';
import { mockUsers, mockAdminStats, type MockUser } from '@/lib/mockAdminData';
import { Users, Activity, Gift, BarChart3, TrendingUp, Download, Settings, ScanLine, UserPlus, ListChecks, Clock } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ResponsiveContainer, Area, AreaChart } from "recharts"
import { useToast } from '@/hooks/use-toast';
import { db } from '@/lib/firebase/firebase';
import { collection, getDocs } from 'firebase/firestore';


const chartConfigPoints = {
  users: { label: "Users", color: "hsl(var(--chart-1))" },
} satisfies Record<string, any>;

const chartConfigVisits = {
  visits: { label: "Visits", color: "hsl(var(--chart-2))" },
  scans: { label: "Scans", color: "hsl(var(--chart-3))" },
} satisfies Record<string, any>;

const chartConfigSignups = {
  signups: { label: "Daily Signups", color: "hsl(var(--chart-4))" },
} satisfies Record<string, any>;

const chartConfigMilestoneRedemptions = {
  count: { label: "Redemptions", color: "hsl(var(--chart-5))" },
} satisfies Record<string, any>;


export default function AdminPage() {
  console.log("AdminPage component rendering...");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [usersData, setUsersData] = useState<MockUser[]>([]);
  const [statsData, setStatsData] = useState<typeof mockAdminStats | null>(null);

  // State for real data
  const [realTotalRegisteredUsers, setRealTotalRegisteredUsers] = useState<number | string>("Loading...");
  const [realTotalScans, setRealTotalScans] = useState<number | string>("Loading...");
  const [realTotalPointsIssued, setRealTotalPointsIssued] = useState<number | string>("Loading...");
  const [isDataLoading, setIsDataLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You do not have permission to view this page.",
      });
      router.push('/'); 
    }
    // Set mock data for parts of the dashboard still using it
    setUsersData(mockUsers);
    setStatsData(mockAdminStats);

    // Fetch real data if user is admin
    if (user?.isAdmin) {
      const fetchData = async () => {
        setIsDataLoading(true);
        try {
          // Fetch total registered users
          const usersCollectionRef = collection(db, 'users');
          const usersSnapshot = await getDocs(usersCollectionRef);
          setRealTotalRegisteredUsers(usersSnapshot.size);

          // Fetch total points issued
          let totalPoints = 0;
          usersSnapshot.forEach((doc) => {
            totalPoints += doc.data().points || 0; 
          });
          setRealTotalPointsIssued(totalPoints);

          // Fetch total QR scans
          try {
            const scansCollectionRef = collection(db, 'scans');
            const scansSnapshot = await getDocs(scansCollectionRef);
            setRealTotalScans(scansSnapshot.size);
          } catch (scanError: any) {
            if (scanError.code === 'permission-denied') {
                 console.warn("Permission denied fetching scans collection. Ensure Firestore rules allow admin access. Defaulting to 0.", scanError);
                 toast({
                    variant: "default",
                    title: "Scan Data Restricted",
                    description: "Could not load QR scan totals due to permission issues. Check Firestore rules.",
                 });
            } else {
                console.warn("Could not fetch scans collection (it might not exist yet), defaulting to 0. Error:", scanError);
            }
            setRealTotalScans(0); 
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
          setRealTotalRegisteredUsers("N/A");
          setRealTotalPointsIssued("N/A");
          setRealTotalScans("N/A");
        } finally {
          setIsDataLoading(false);
        }
      };
      fetchData();
    }
  }, [user, authLoading, router, toast]);

  if (authLoading || !user || !user.isAdmin || !statsData) {
    return (
      <div className="flex min-h-[calc(100vh-7rem)] items-center justify-center">
        <p className="text-lg">Loading Admin Dashboard & Verifying Permissions...</p>
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
        <MetricCard title="Total Registered Users" value={realTotalRegisteredUsers} icon={Users} />
        <MetricCard title="Active Users (30 days)" value={statsData.activeUsersLast30Days} icon={Activity} description="Based on recent activity (mock)" />
        <MetricCard title="Total QR Scans" value={realTotalScans} icon={ScanLine} description="All-time scans" />
        <MetricCard title="Total Points Issued" value={realTotalPointsIssued} icon={Gift} />
      </div>
      
      {/* Charts & Graphs Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Scans Per Day</CardTitle>
            <CardDescription>Mocked scan data trends over the last week.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ChartContainer config={chartConfigVisits} className="h-full w-full">
                <LineChart accessibilityLayer data={statsData.visitsPerDay} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                  <YAxis />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Line dataKey="scans" type="monotone" stroke="var(--color-scans)" strokeWidth={2} dot={true} name="Scans" />
                </LineChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Reward Redemptions by Milestone</CardTitle>
            <CardDescription>Number of users who have redeemed rewards at each point milestone (mock).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ChartContainer config={chartConfigMilestoneRedemptions} className="h-full w-full">
                <BarChart accessibilityLayer data={statsData.rewardRedemptionsByMilestone}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="milestone" tickLine={false} tickMargin={10} axisLine={false} />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="var(--color-count)" radius={4} name="Redemptions" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><UserPlus className="mr-2 h-5 w-5 text-primary" />Daily Signups</CardTitle>
            <CardDescription>New user registrations per day for the last week (mock).</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] w-full">
              <ChartContainer config={chartConfigSignups} className="h-full w-full">
                <AreaChart accessibilityLayer data={statsData.dailySignups} margin={{ left: 12, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}/>
                  <YAxis />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area dataKey="signups" type="monotone" fill="var(--color-signups)" stroke="var(--color-signups)" stackId="a" name="Signups" />
                </AreaChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Points Analytics (Mock)</CardTitle>
             <CardDescription>Current distribution of points among users (mock).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <MetricCard title="Avg. Points/Patron" value={statsData.averagePointsPerPatron} />
              <MetricCard title="Total Points Redeemed" value={statsData.totalPointsRedeemed} />
            </div>
            <div className="h-[200px] w-full">
               <ChartContainer config={chartConfigPoints} className="h-full w-full">
                  <BarChart accessibilityLayer data={statsData.pointsDistribution}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="users" fill="var(--color-users)" radius={4} name="Users in Range"/>
                  </BarChart>
                </ChartContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />User Management</CardTitle>
          <CardDescription>List of all registered users. (Search, sort, and claimed rewards are placeholders from mock data)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Current Points</TableHead>
                <TableHead className="text-right">Total Visits</TableHead>
                <TableHead>Last Scan Date</TableHead>
                <TableHead className="text-right">Claimed Rewards</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="text-right">{u.totalPoints}</TableCell>
                  <TableCell className="text-right">{u.visitsCount}</TableCell>
                  <TableCell>{new Date(u.lastVisitDate).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">{u.claimedRewardsCount}</TableCell>
                </TableRow>
              ))}
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
            <p className="text-muted-foreground">Detailed statistics per reward, time to redemption, and missed opportunities will be displayed here.</p>
             <Button variant="outline" className="mt-4 w-full" disabled>View Reward Stats (Soon)</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Clock className="mr-2 h-5 w-5 text-primary" />Activity Feed / Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">A real-time feed of recent QR scans, reward claims, and user milestone achievements will appear here.</p>
            <Button variant="outline" className="mt-4 w-full" disabled>View Activity (Soon)</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-xl flex items-center"><Download className="mr-2 h-5 w-5 text-primary" />Admin Tools</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground">Tools for data export and user management.</p>
            <Button variant="outline" className="w-full" disabled><Download className="mr-2 h-4 w-4" />Export User Data (CSV)</Button>
            <Button variant="outline" className="w-full" disabled>Manually Adjust Points</Button>
            <Button variant="outline" className="w-full" disabled>Push Promotions</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    
