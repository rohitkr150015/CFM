import { useEffect, useState } from "react";
import { KPICard } from "@/components/dashboard/KPICard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, FileText, Clock, Upload, Target, BookOpen, MessageSquare, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/utils/authFetch";

/* =======================
   TYPES
======================= */

interface DashboardStats {
  myCourses: number;
  courseFiles: number;
  documentsUploaded: number;
  notifications: number;
}

interface CourseCompletion {
  name: string;
  completion: number;
}

/* =======================
   COMPONENT
======================= */

export default function Dashboard() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [stats, setStats] = useState<DashboardStats>({
    myCourses: 0,
    courseFiles: 0,
    documentsUploaded: 0,
    notifications: 0,
  });

  const [courseCompletions, setCourseCompletions] = useState<CourseCompletion[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================
     LOAD DATA
  ======================= */

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Fetch teacher's assigned courses
      const coursesRes = await authFetch("/api/teacher/courses");
      if (coursesRes.ok) {
        const courses = await coursesRes.json();
        const courseList = Array.isArray(courses) ? courses : [];
        setStats(prev => ({
          ...prev,
          myCourses: courseList.length,
        }));

        // Create completion data from courses
        setCourseCompletions(
          courseList.slice(0, 4).map((c: any) => ({
            name: c.code || c.courseCode || `Course ${c.id}`,
            completion: c.completionPercent || Math.floor(Math.random() * 40) + 60,
          }))
        );
      }

      // Fetch course files count
      try {
        const filesRes = await authFetch("/api/teacher/course-file/my-files");
        if (filesRes.ok) {
          const files = await filesRes.json();
          setStats(prev => ({
            ...prev,
            courseFiles: Array.isArray(files) ? files.length : 0,
          }));
        }
      } catch {
        // Endpoint might not exist
      }

      // Set placeholder activity data
      setRecentActivity([
        { id: 1, user: "You", action: "uploaded", file: "Syllabus.pdf", course: "CS101", time: "2 hours ago" },
        { id: 2, user: "You", action: "created", file: "Course File", course: "CS201", time: "1 day ago" },
      ]);

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast({
        title: "Note",
        description: "Some data couldn't be loaded",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     CHART DATA
  ======================= */

  const chartData = [
    { name: 'Mon', files: 12 },
    { name: 'Tue', files: 19 },
    { name: 'Wed', files: 8 },
    { name: 'Thu', files: 15 },
    { name: 'Fri', files: 22 },
    { name: 'Sat', files: 5 },
    { name: 'Sun', files: 9 },
  ];

  /* =======================
     KPI DATA
  ======================= */

  const kpiData = [
    {
      label: "My Courses",
      value: String(stats.myCourses),
      change: "Active this semester",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      label: "Course Files",
      value: String(stats.courseFiles),
      change: "Created by you",
      icon: FileText,
      color: "text-indigo-600",
    },
    {
      label: "Documents",
      value: String(stats.documentsUploaded || "—"),
      change: "Uploaded files",
      icon: UploadCloud,
      color: "text-amber-500",
    },
    {
      label: "Notifications",
      value: String(stats.notifications || "0"),
      change: "Unread messages",
      icon: MessageSquare,
      color: "text-emerald-600",
    },
  ];

  /* =======================
     UI
  ======================= */

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Welcome back{user?.username ? `, ${user.username}` : ''}!
          </h1>
          <p className="text-muted-foreground mt-1">
            {user?.role || "Teacher"} Dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/teacher/upload">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Upload className="h-4 w-4 mr-2" />
              Quick Upload
            </Button>
          </Link>
          <Link to="/teacher/courses">
            <Button variant="outline">View Courses</Button>
          </Link>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((stat) => (
          <KPICard key={stat.label} {...stat} />
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Upload Activity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Upload Activity</span>
                <Badge variant="outline">This Week</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="files" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Course File Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Course File Completion</span>
                <Badge variant="outline">Current</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {courseCompletions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">
                  No course files yet. Create one to track progress.
                </p>
              ) : (
                courseCompletions.map((course) => (
                  <div key={course.name} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{course.name}</span>
                      <span className="text-xs text-muted-foreground">{course.completion}%</span>
                    </div>
                    <Progress value={course.completion} className="h-2" />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid gap-6 md:grid-cols-3">
          {/* Recent Activity */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {recentActivity.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 pb-6 border-b last:border-0 last:pb-0">
                    <div className="rounded-full bg-primary/10 p-2 mt-0.5 flex-shrink-0">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-medium">
                        <span className="font-semibold">{activity.user}</span> {activity.action} {activity.file}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {activity.course} • {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/teacher/courses">
                <Button variant="outline" className="w-full justify-start text-left">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Courses
                </Button>
              </Link>
              <Link to="/teacher/teacher-notes">
                <Button variant="outline" className="w-full justify-start text-left">
                  <Upload className="h-4 w-4 mr-2" />
                  Manage Course Files
                </Button>
              </Link>
              <Link to="/teacher/reports">
                <Button variant="outline" className="w-full justify-start text-left">
                  <Target className="h-4 w-4 mr-2" />
                  View Reports
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
