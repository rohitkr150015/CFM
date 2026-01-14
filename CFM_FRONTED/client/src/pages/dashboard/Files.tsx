import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LayoutGrid,
  List,
  FolderOpen,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  RefreshCw,
  FileText,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { authFetch } from "@/utils/authFetch";
import { useToast } from "@/hooks/use-toast";

interface CourseFile {
  id: number;
  course: {
    id: number;
    code: string;
    title: string;
  };
  academicYear: string;
  section: string;
  status: string;
  createdAt: string;
}

export default function FilesPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [courseFiles, setCourseFiles] = useState<CourseFile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourseFiles = async () => {
    setLoading(true);
    try {
      const res = await authFetch('/api/teacher/course-files/my');
      if (res.ok) {
        const data = await res.json();
        setCourseFiles(data);
      }
    } catch (err) {
      console.error("Error fetching course files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseFiles();
  }, []);

  const filteredFiles = courseFiles.filter(
    (f) =>
      f.course?.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewCourseFile = (courseFile: CourseFile) => {
    // Store course info for the view page
    localStorage.setItem('temp_selected_course', JSON.stringify({
      id: courseFile.course?.id,
      code: courseFile.course?.code,
      title: courseFile.course?.title
    }));
    localStorage.setItem('temp_selected_template', JSON.stringify({
      name: 'Course Template'
    }));
    navigate(`/teacher/course-structure/${courseFile.id}`);
  };

  const handleDelete = async (courseFileId: number) => {
    if (!confirm("Are you sure you want to delete this course file? All sections and files within it will be permanently deleted.")) {
      return;
    }

    try {
      const res = await authFetch(`/api/teacher/course-files/${courseFileId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast({ title: "Success", description: "Course file deleted successfully" });
        fetchCourseFiles();
      } else {
        toast({ title: "Error", description: "Failed to delete course file", variant: "destructive" });
      }
    } catch (err) {
      console.error("Delete error:", err);
      toast({ title: "Error", description: "Failed to delete course file", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: "default" | "secondary" | "outline" | "destructive", label: string }> = {
      DRAFT: { variant: "outline", label: "Draft" },
      SUBMITTED: { variant: "secondary", label: "Submitted" },
      APPROVED: { variant: "default", label: "Approved" },
      REJECTED: { variant: "destructive", label: "Rejected" }
    };
    const config = variants[status] || { variant: "outline", label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Files</h1>
          <p className="text-muted-foreground mt-1">View and manage your course file structures</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchCourseFiles}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => navigate('/teacher/template-selection')}>
            <Plus className="h-4 w-4 mr-2" />
            New Course File
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Input
            placeholder="Search course files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex bg-muted rounded-md p-1">
          <Button
            variant={view === "grid" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setView("grid")}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
          <Button
            variant={view === "list" ? "secondary" : "ghost"}
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setView("list")}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredFiles.length === 0 ? (
        <Card>
          <CardContent className="pt-12 pb-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No course files yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first course file by selecting a template
            </p>
            <Button onClick={() => navigate('/teacher/template-selection')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Course File
            </Button>
          </CardContent>
        </Card>
      ) : view === "grid" ? (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {filteredFiles.map((file) => (
            <Card key={file.id} className="group hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleViewCourseFile(file)}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <FolderOpen className="h-6 w-6 text-blue-600" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewCourseFile(file); }}>
                      <Eye className="mr-2 h-4 w-4" /> View Structure
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleViewCourseFile(file); }}>
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <CardTitle className="text-base font-medium truncate" title={file.course?.title}>
                  {file.course?.code} - {file.course?.title}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-1">
                  {file.academicYear} {file.section ? `• Section ${file.section}` : ''}
                </p>
                <div className="mt-3">
                  {getStatusBadge(file.status)}
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground border-t pt-3">
                <span>Created: {new Date(file.createdAt).toLocaleDateString()}</span>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border bg-card overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 text-sm font-medium">Course</th>
                <th className="text-left p-3 text-sm font-medium">Academic Year</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Created</th>
                <th className="text-right p-3 text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr key={file.id} className="border-t hover:bg-muted/30 cursor-pointer" onClick={() => handleViewCourseFile(file)}>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{file.course?.code}</span>
                      <span className="text-muted-foreground">- {file.course?.title}</span>
                    </div>
                  </td>
                  <td className="p-3 text-sm">{file.academicYear}</td>
                  <td className="p-3">{getStatusBadge(file.status)}</td>
                  <td className="p-3 text-sm text-muted-foreground">
                    {new Date(file.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleViewCourseFile(file); }}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={(e) => { e.stopPropagation(); handleDelete(file.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
