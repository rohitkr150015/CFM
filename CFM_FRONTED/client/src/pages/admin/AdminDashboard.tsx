
import { KPICard } from "@/components/dashboard/KPICard";
import { adminStats, users, auditLogs } from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from 'recharts';
import { AlertCircle, TrendingUp, Users, Database, Settings } from 'lucide-react';

const uploadData = [
  { name: 'Jan', uploads: 450, users: 120 },
  { name: 'Feb', uploads: 620, users: 145 },
  { name: 'Mar', uploads: 890, users: 168 },
  { name: 'Apr', uploads: 810, users: 155 },
  { name: 'May', uploads: 1200, users: 192 },
  { name: 'Jun', uploads: 1450, users: 210 },
];

const categoryData = [
  { name: 'Course Materials', value: 4500 },
  { name: 'Assignments', value: 3200 },
  { name: 'Student Uploads', value: 2800 },
  { name: 'Admin Files', value: 1950 },
];

const COLORS = ['#2563eb', '#0ea5e9', '#10b981', '#f59e0b'];

export default function AdminDashboard() {
  const activeUsers = users.filter(u => u.status === 'Active').length;
  const recentLogs = auditLogs.slice(0, 3);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground mt-2">Monitor platform health, users, and storage.</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700"><Settings className="h-4 w-4 mr-2"/> System Settings</Button>
      </div>
      
      {/* Admin KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat) => (
          <KPICard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-6">
        {/* Top Row: Charts */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* System Growth Area Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>System Growth Trends</span>
                <Badge variant="outline"><TrendingUp className="h-3 w-3 mr-1"/>+18%</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={uploadData}>
                    <defs>
                      <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    <Area type="monotone" dataKey="uploads" stroke="#2563eb" strokeWidth={2} fillOpacity={1} fill="url(#colorUploads)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* File Distribution */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Content Distribution</span>
                <Badge variant="outline">12.4K files</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row: Audit Logs + System Health */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Recent Activity Log */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent System Activity</span>
                <Button variant="ghost" size="sm">View All</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-3 pb-3 border-b last:border-0">
                    <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2 bg-blue-600"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{log.actor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={
                          log.action.includes('Deleted') ? 'bg-red-50 text-red-700' : 
                          log.action.includes('Approved') ? 'bg-green-50 text-green-700' : 
                          'bg-blue-50 text-blue-700'
                        }>
                          {log.action}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{log.timestamp}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* System Health Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">System Health</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-600"/>
                    <span className="text-sm font-medium">Database</span>
                  </div>
                  <Badge variant="outline" className="text-green-700">Healthy</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-green-600"/>
                    <span className="text-sm font-medium">Users Online</span>
                  </div>
                  <Badge variant="outline" className="text-green-700">{activeUsers} Active</Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600"/>
                    <span className="text-sm font-medium">Storage</span>
                  </div>
                  <Badge variant="outline" className="text-amber-700">85% Full</Badge>
                </div>
              </div>

              <Button variant="outline" className="w-full">View Detailed Status</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
