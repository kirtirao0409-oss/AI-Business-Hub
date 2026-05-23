import { 
  useGetAnalyticsSummary, 
  useGetRevenueChart, 
  useGetRecentActivity 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Briefcase, Activity, DollarSign, ArrowUpRight, TrendingUp } from "lucide-react";

export default function Dashboard() {
  const { data: summary, isLoading: isSummaryLoading } = useGetAnalyticsSummary();
  const { data: revenueData, isLoading: isRevenueLoading } = useGetRevenueChart();
  const { data: activityData, isLoading: isActivityLoading } = useGetRecentActivity();

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mission Control</h1>
        <p className="text-muted-foreground">Welcome back. Here is what is happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Revenue"
          value={summary ? `$${summary.totalRevenue.toLocaleString()}` : null}
          icon={DollarSign}
          trend={summary?.revenueGrowth}
          isLoading={isSummaryLoading}
        />
        <MetricCard
          title="Active Leads"
          value={summary?.activeLeads}
          icon={Users}
          trend={summary?.leadGrowth}
          isLoading={isSummaryLoading}
        />
        <MetricCard
          title="Open Positions"
          value={summary?.openPositions}
          icon={Briefcase}
          isLoading={isSummaryLoading}
        />
        <MetricCard
          title="Active Projects"
          value={summary?.activeProjects}
          icon={Activity}
          isLoading={isSummaryLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card/50 backdrop-blur-sm border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Revenue Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {isRevenueLoading ? (
              <Skeleton className="w-full h-full rounded-md" />
            ) : revenueData ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="target" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">No data available</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-sm border-card-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isActivityLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-8 h-8 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : activityData?.length ? (
              <div className="space-y-6">
                {activityData.map((activity) => (
                  <div key={activity.id} className="flex gap-4 items-start">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-40 text-muted-foreground">No recent activity</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ title, value, icon: Icon, trend, isLoading }: any) {
  return (
    <Card className="bg-card/50 backdrop-blur-sm border-card-border hover:border-primary/50 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Icon className="w-6 h-6 text-primary" />
          </div>
          {trend !== undefined && trend !== null && (
            <div className={`flex items-center gap-1 text-sm font-medium ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
              {trend >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4 rotate-90" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-24 mt-1" />
          ) : (
            <h3 className="text-2xl font-bold mt-1">{value !== undefined && value !== null ? value : "—"}</h3>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
