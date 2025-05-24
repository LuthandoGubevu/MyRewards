
"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MetricCard } from '@/components/admin/MetricCard';
import { mockUsers, mockAdminStats, type MockUser } from '@/lib/mockAdminData';
import { Users, Activity, Gift, BarChart3, TrendingUp, Download, Settings } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Line, LineChart, ResponsiveContainer } from "recharts"


const chartConfigPoints = {
  users: {
    label: "Users",
    color: "hsl(var(--chart-1))",
  },
} satisfies Record<string, any>; // Adjusted to satisfy ChartConfig more broadly

const chartConfigVisits = {
  visits: {
    label: "Visits",
    color: "hsl(var(--chart-2))",
  },
} satisfies Record<string, any>;


export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [usersData, setUsersData] = useState<MockUser[]>([]);
  const [statsData, setStatsData] = useState<typeof mockAdminStats | null>(null);

  useEffect(() => {
    if (!loading && (!user || !user.isAdmin)) {
      router.push('/'); // Redirect if not admin or not logged in
    }
    // In a real app, fetch data here. For now, use mock data.
    setUsersData(mockUsers);
    setStatsData(mockAdminStats);
  }, [user, loading, router]);

  if (loading || !user || !user.isAdmin || !statsData) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 md:p-6 bg-background text-foreground">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-primary">Admin Dashboard</h1>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Admin Settings (Placeholder)
        </Button>
      </div>

      {/* User Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Users className="mr-2 h-5 w-5 text-primary" />User Overview</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <MetricCard title="Total Registered Users" value={statsData.totalRegisteredUsers} icon={Users} />
          <MetricCard title="Active Users (7 days)" value={statsData.activeUsersLast7Days} icon={Activity} description="Placeholder" />
          <MetricCard title="Active Users (30 days)" value={statsData.activeUsersLast30Days} icon={Activity} description="Placeholder" />
          <MetricCard title="Inactive Users" value={statsData.inactiveUsers} icon={Users} description="Placeholder" />
        </CardContent>
      </Card>

      {/* Points Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><BarChart3 className="mr-2 h-5 w-5 text-primary" />Points Analytics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <MetricCard title="Total Points Issued" value={statsData.totalPointsIssued} />
            <MetricCard title="Total Points Redeemed" value={statsData.totalPointsRedeemed} description="Placeholder" />
            <MetricCard title="Avg. Points/Patron" value={statsData.averagePointsPerPatron} />
          </div>
          <CardDescription>Point Distribution (Mock Data)</CardDescription>
          <div className="h-[200px] w-full">
             <ChartContainer config={chartConfigPoints} className="h-full w-full">
                <BarChart accessibilityLayer data={statsData.pointsDistribution}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="users" fill="var(--color-users)" radius={4} />
                </BarChart>
              </ChartContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Reward Redemptions Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Gift className="mr-2 h-5 w-5 text-primary" />Reward Redemptions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Analytics for reward redemptions (e.g., Total Rewards Claimed, Most Popular Reward, Redemption Rate) will be displayed here.</p>
           <div className="grid gap-4 md:grid-cols-3 mt-4">
            <MetricCard title="Total Rewards Claimed" value={statsData.totalRewardsClaimed} description="Placeholder" />
            <MetricCard title="Most Popular Reward" value={statsData.mostPopularReward} description="Placeholder" />
            <MetricCard title="Redemption Rate" value={`${statsData.redemptionRate}%`} description="Placeholder" />
          </div>
        </CardContent>
      </Card>

      {/* Visit Behavior Placeholder */}
       <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary" />Visit & Scan Behavior</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <CardDescription>Visits Per Day (Mock Data)</CardDescription>
           <div className="h-[200px] w-full">
            <ChartContainer config={chartConfigVisits} className="h-full w-full">
              <LineChart
                accessibilityLayer
                data={statsData.visitsPerDay}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <Line
                  dataKey="visits"
                  type="monotone"
                  stroke="var(--color-visits)"
                  strokeWidth={2}
                  dot={true}
                />
              </LineChart>
            </ChartContainer>
          </div>
          <p className="text-muted-foreground pt-4">Further analytics like Most Frequent Visitors and QR Code Scan Trends will be displayed here.</p>
        </CardContent>
      </Card>

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
                <TableHead className="text-right">Total Points</TableHead>
                <TableHead>Last Visit</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usersData.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell className="text-right">{u.totalPoints}</TableCell>
                  <TableCell>{new Date(u.lastVisitDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Export Tools Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl flex items-center"><Download className="mr-2 h-5 w-5 text-primary" />Export Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Functionality to export user and reward data to CSV will be available here.</p>
          <Button variant="outline" className="mt-4">
            <Download className="mr-2 h-4 w-4" />
            Export Data (Placeholder)
          </Button>
        </CardContent>
      </Card>

    </div>
  );
}

    