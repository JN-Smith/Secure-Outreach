import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_STATS, MOCK_CONTACTS } from "@/lib/mock-data";
import { 
  Users, 
  UserCheck, 
  Clock, 
  GraduationCap, 
  ArrowUpRight,
  MapPin
} from "lucide-react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

const data = [
  { name: 'Mon', value: 4 },
  { name: 'Tue', value: 3 },
  { name: 'Wed', value: 7 },
  { name: 'Thu', value: 5 },
  { name: 'Fri', value: 8 },
  { name: 'Sat', value: 12 },
  { name: 'Sun', value: 9 },
];

const pieData = [
  { name: 'New', value: 30 },
  { name: 'Follow-up', value: 45 },
  { name: 'Connected', value: 25 },
];

const COLORS = ['hsl(175, 60%, 35%)', 'hsl(15, 70%, 65%)', 'hsl(45, 80%, 60%)'];

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-heading font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground mt-1">Overview of your outreach impact this week.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-elevate transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reached</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.totalReached}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-primary mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Follow-ups</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.pendingFollowUps}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Students Reached</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.studentsReached}</div>
            <p className="text-xs text-muted-foreground mt-1">Across 3 campuses</p>
          </CardContent>
        </Card>
        <Card className="hover-elevate transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected to Church</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MOCK_STATS.connectedToChurch}</div>
            <p className="text-xs text-muted-foreground mt-1">Success rate: 22%</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Weekly Outreach Activity</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tickFormatter={(value) => `${value}`} 
                  />
                  <Tooltip 
                    cursor={{fill: 'hsl(var(--muted))', opacity: 0.4}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]} 
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Contact Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(175,60%,35%)]" /> New
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(15,70%,65%)]" /> Follow-up
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[hsl(45,80%,60%)]" /> Connected
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {MOCK_CONTACTS.slice(0, 3).map((contact) => (
              <div key={contact.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground font-bold">
                    {contact.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{contact.fullName}</p>
                    <div className="flex items-center text-xs text-muted-foreground gap-2">
                      <MapPin className="h-3 w-3" /> {contact.location}
                      <span>•</span>
                      <span>{contact.status}</span>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {contact.createdAt}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
