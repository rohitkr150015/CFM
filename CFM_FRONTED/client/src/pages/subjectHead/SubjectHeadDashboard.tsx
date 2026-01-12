import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { KPICard } from "@/components/dashboard/KPICard";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/utils/authFetch";
import {
  BookOpen,
  ClipboardCheck,
  FileCheck,
  Clock,
  Eye,
  CheckCircle,
  XCircle,
  Send,
} from "lucide-react";

/* =======================
   TYPES
======================= */

interface PendingReview {
  id: number;
  courseFileId: number;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  submittedDate: string;
  status: string;
}

interface DashboardStats {
  assignedCourses: number;
  pendingReviews: number;
  approvedFiles: number;
  rejectedFiles: number;
}

/* =======================
   COMPONENT
======================= */

export default function SubjectHeadDashboardPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stats, setStats] = useState<DashboardStats>({
    assignedCourses: 0,
    pendingReviews: 0,
    approvedFiles: 0,
    rejectedFiles: 0,
  });

  const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
  const [loading, setLoading] = useState(true);

  /* =======================
     LOAD DATA
  ======================= */

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Try to fetch pending reviews
      const res = await authFetch("/api/subject-head/pending-approvals");

      if (res.ok) {
        const data = await res.json();
        setPendingReviews(Array.isArray(data) ? data : []);
        setStats(prev => ({
          ...prev,
          pendingReviews: Array.isArray(data) ? data.length : 0,
        }));
      } else {
        // API might not exist yet, use empty data
        setPendingReviews([]);
      }

      // Try to fetch assigned courses count
      try {
        const coursesRes = await authFetch("/api/subject-head/assigned-courses");
        if (coursesRes.ok) {
          const courses = await coursesRes.json();
          setStats(prev => ({
            ...prev,
            assignedCourses: Array.isArray(courses) ? courses.length : 0,
          }));
        }
      } catch {
        // Endpoint might not exist
      }

    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast({
        title: "Note",
        description: "Some data couldn't be loaded. Backend endpoints may need configuration.",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  /* =======================
     ACTIONS
  ======================= */

  const handleReview = (courseFileId: number) => {
    navigate(`/subject-head/review/${courseFileId}`);
  };

  const handleQuickApprove = async (courseFileId: number) => {
    try {
      const res = await authFetch(`/api/approval/${courseFileId}/forward`, {
        method: "POST",
        body: JSON.stringify({ comment: "Forwarded to HOD" }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Forwarded to HOD for approval" });
        loadDashboardData();
      } else {
        throw new Error("Failed to forward");
      }
    } catch {
      toast({
        title: "Error",
        description: "Failed to forward. Please try the detailed review.",
        variant: "destructive",
      });
    }
  };

  /* =======================
     KPI DATA
  ======================= */

  const kpiData = [
    {
      label: "Assigned Courses",
      value: String(stats.assignedCourses),
      change: "Courses under your supervision",
      icon: BookOpen,
      color: "text-blue-600",
    },
    {
      label: "Pending Reviews",
      value: String(stats.pendingReviews),
      change: "Awaiting your action",
      icon: Clock,
      color: "text-orange-600",
    },
    {
      label: "Approved Files",
      value: String(stats.approvedFiles),
      change: "This semester",
      icon: FileCheck,
      color: "text-green-600",
    },
    {
      label: "Review Queue",
      value: String(pendingReviews.length),
      change: "In queue",
      icon: ClipboardCheck,
      color: "text-purple-600",
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
            Subject Head Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and approve course files for your assigned courses
          </p>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiData.map((stat) => (
          <KPICard key={stat.label} {...stat} />
        ))}
      </div>

      {/* PENDING REVIEWS TABLE */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Pending Course File Reviews
            </span>
            <Badge variant="secondary" className="bg-orange-100 text-orange-700">
              {pendingReviews.length} Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingReviews.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-3 text-green-500" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm">No pending course files to review.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{review.courseCode}</p>
                        <p className="text-sm text-muted-foreground">
                          {review.courseTitle}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{review.teacherName}</TableCell>
                    <TableCell>
                      {new Date(review.submittedDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50">
                        {review.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleReview(review.courseFileId)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleQuickApprove(review.courseFileId)}
                        >
                          <Send className="h-4 w-4 mr-1" />
                          Forward
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* QUICK ACTIONS */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/subject-head/courses")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold">View Assigned Courses</h3>
                <p className="text-sm text-muted-foreground">
                  See all courses under your supervision
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/subject-head/history")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold">Review History</h3>
                <p className="text-sm text-muted-foreground">
                  View your past approvals and rejections
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate("/subject-head/reports")}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <ClipboardCheck className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold">Heading Completion</h3>
                <p className="text-sm text-muted-foreground">
                  Check document completion status
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
