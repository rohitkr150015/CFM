import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseStructureTree, TreeNode } from "@/components/CourseStructureTree";
import { Download, Save, HelpCircle, ArrowLeft, Upload, RefreshCw } from "lucide-react";
import { authFetch } from "@/utils/authFetch";
import { useToast } from "@/hooks/use-toast";

const mockInitialStructure: TreeNode = {
  id: "root",
  name: "Loading Course...",
  level: 0,
  children: [],
  files: [],
  completed: false,
  isTemplateNode: true
};

// Convert backend tree response to frontend TreeNode format
const convertBackendToTreeNode = (
  backendNodes: any[],
  courseName: string,
  parentLevel: number = 0,
  isRootLevel: boolean = true
): TreeNode => {
  const children: TreeNode[] = backendNodes.map((node: any) => ({
    id: String(node.id),
    name: node.title,
    level: parentLevel + 1,
    children: node.children && node.children.length > 0
      ? node.children.map((child: any) => convertSingleNode(child, parentLevel + 1))
      : [],
    files: (node.files || []).map((f: any) => ({
      id: String(f.id),
      name: f.fileName,
      size: formatFileSize(f.fileSize),
      date: f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
      version: f.versionNo || 1
    })),
    completed: (node.files || []).length > 0,
    isTemplateNode: node.parentHeadingId === null // Root level headings from template
  }));

  return {
    id: "root",
    name: courseName,
    level: 0,
    children,
    files: [],
    completed: false,
    isTemplateNode: true
  };
};

const convertSingleNode = (node: any, parentLevel: number): TreeNode => ({
  id: String(node.id),
  name: node.title,
  level: parentLevel + 1,
  children: node.children && node.children.length > 0
    ? node.children.map((child: any) => convertSingleNode(child, parentLevel + 1))
    : [],
  files: (node.files || []).map((f: any) => ({
    id: String(f.id),
    name: f.fileName,
    size: formatFileSize(f.fileSize),
    date: f.uploadedAt ? new Date(f.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
    version: f.versionNo || 1
  })),
  completed: (node.files || []).length > 0,
  isTemplateNode: node.parentHeadingId === null
});

const formatFileSize = (bytes: number): string => {
  if (!bytes) return '0 KB';
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function CourseStructurePage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [structure, setStructure] = useState<TreeNode>(mockInitialStructure);
  const [templateName, setTemplateName] = useState<string>("Course Template");
  const [courseCode, setCourseCode] = useState<string>("");
  const [courseFileId, setCourseFileId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadStructure = async () => {
    if (!courseId) return;

    setLoading(true);
    try {
      // Get course file details from localStorage (set during template selection)
      const storedTemplate = localStorage.getItem("temp_selected_template");
      const storedCourse = localStorage.getItem("temp_selected_course");

      let courseName = "Course Structure";
      let tplName = "Course Template";
      let cCode = "";

      if (storedTemplate && storedCourse) {
        const template = JSON.parse(storedTemplate);
        const course = JSON.parse(storedCourse);
        courseName = `${course.code} - ${course.title}`;
        tplName = template.name || "Course Template";
        cCode = course.code || "";
      }

      setTemplateName(tplName);
      setCourseCode(cCode);
      setCourseFileId(Number(courseId));

      // Fetch tree structure from backend
      const res = await authFetch(`/api/teacher/headings/course-file/${courseId}/tree`);

      if (res.ok) {
        const data = await res.json();
        const tree = convertBackendToTreeNode(data, courseName);
        setStructure(tree);
      } else {
        // If no headings yet, show empty structure with course name
        setStructure({
          ...mockInitialStructure,
          name: courseName,
          children: []
        });
      }
    } catch (err) {
      console.error("Error loading structure:", err);
      toast({
        title: "Error",
        description: "Failed to load course structure",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStructure();
  }, [courseId, refreshKey]);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleStructureChange = (newStructure: TreeNode) => {
    setStructure(newStructure);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-muted-foreground">Loading course structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Course Structure</h1>
          </div>
          <p className="text-muted-foreground">Manage and organize your course materials.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">0%</p>
              <p className="text-sm text-muted-foreground">Completion</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{structure.children.length}</p>
              <p className="text-sm text-muted-foreground">Main Units</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className="text-green-700 bg-green-50 border-green-200">Active</Badge>
              <p className="text-xs text-muted-foreground mt-2">Status</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="structure" className="space-y-4">
        <TabsList>
          <TabsTrigger value="structure">Course Structure</TabsTrigger>
          <TabsTrigger value="guide">How to Use</TabsTrigger>
        </TabsList>

        {/* Structure Tab */}
        <TabsContent value="structure">
          <CourseStructureTree
            templateName={templateName}
            courseCode={courseCode}
            courseFileId={courseFileId}
            initialStructure={structure}
            onStructureChange={handleStructureChange}
            onRefresh={handleRefresh}
          />
        </TabsContent>

        {/* Guide Tab */}
        <TabsContent value="guide" className="space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                How to Manage Your Course Files
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white font-bold text-xs">1</div>
                <div>
                  <strong>Add Sub-Sections:</strong> Click the menu (⋮) on any section and select "Add Sub-Section"
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white font-bold text-xs">2</div>
                <div>
                  <strong>Upload Files:</strong> Click the <Upload className="h-3 w-3 inline" /> icon on any section to upload files
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-600 text-white font-bold text-xs">3</div>
                <div>
                  <strong>Template Sections:</strong> Sections marked with <Badge variant="outline" className="text-[10px] h-4 px-1 bg-blue-50 text-blue-700">Template</Badge> cannot be renamed or deleted
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
