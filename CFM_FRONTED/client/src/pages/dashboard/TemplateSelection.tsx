import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authFetch } from "@/utils/authFetch";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CheckCircle2, BookOpen, FileText, AlertCircle, Lightbulb } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

/* ================= TYPES ================= */

interface Course {
  courseId: number;
  code: string;
  title: string;
  academicYear: string;
  section: string;
}

interface HeadingItem {
  title: string;
  order: number;
}

interface Template {
  id: number;
  name: string;
  type: string;
  structure: HeadingItem[];
}

/* ================= COMPONENT ================= */

export default function TemplateSelectionPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [viewTemplate, setViewTemplate] = useState<Template | null>(null);
  const [isApplying, setIsApplying] = useState(false);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadCourses();
    loadTemplates();
  }, []);

  const loadCourses = async () => {
    try {
      const res = await authFetch("/api/teacher/my-courses");
      if (!res.ok) throw new Error();
      setCourses(await res.json());
    } catch {
      toast({
        title: "Error",
        description: "Unable to load your courses",
        variant: "destructive",
      });
    }
  };

  const loadTemplates = async () => {
    try {
      const res = await authFetch("/api/teacher/templates");
      if (!res.ok) throw new Error();
      const data = await res.json();

      // Parse the JSON structure like HOD side does
      const formatted = data.map((t: any) => {
        let parsed = { type: "UNKNOWN", headings: [] as HeadingItem[] };
        try {
          if (t.structure && typeof t.structure === "string") {
            parsed = JSON.parse(t.structure);
          }
        } catch (e) {
          console.error("Failed to parse template structure", t);
        }

        return {
          id: t.id,
          name: t.name,
          type: parsed.type || "UNKNOWN",
          structure: Array.isArray(parsed.headings) ? parsed.headings : [],
        };
      });

      setTemplates(formatted);
    } catch {
      toast({
        title: "Error",
        description: "Unable to load templates",
        variant: "destructive",
      });
    }
  };

  /* ================= APPLY TEMPLATE ================= */

  const handleApplyTemplate = async () => {
    if (!selectedCourse || !selectedTemplate) return;

    setIsApplying(true);

    try {
      const course = courses.find(
        (c) => c.courseId.toString() === selectedCourse
      );

      const template = templates.find(t => t.id === selectedTemplate);

      // Save to localStorage for demo data passing
      if (course) localStorage.setItem("temp_selected_course", JSON.stringify(course));
      if (template) localStorage.setItem("temp_selected_template", JSON.stringify(template));

      const res = await authFetch("/api/teacher/course-files", {
        method: "POST",
        body: JSON.stringify({
          courseId: Number(selectedCourse),
          templateId: selectedTemplate,
          academicYear: course?.academicYear,
          section: course?.section,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to create course file");
      }

      const data = await res.json();

      navigate(`/teacher/course-structure/${data.id}`);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsApplying(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Setup Your Course</h1>
        <p className="text-muted-foreground mt-1">
          Choose your course and select a template to organize your materials.
        </p>
      </div>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="about">What is a Template?</TabsTrigger>
        </TabsList>

        {/* ================= SETUP TAB ================= */}
        <TabsContent value="setup" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* COURSE */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Step 1: Select Your Course
                </CardTitle>
                <CardDescription>
                  Only courses assigned to you are shown
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.courseId} value={String(c.courseId)}>
                        {c.code} - {c.title} ({c.section})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedCourse && (
                  <div className="mt-3 p-3 bg-green-50 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">
                      Course selected ✓
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* TEMPLATE */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Step 2: Choose a Template
                </CardTitle>
                <CardDescription>
                  Templates from your department
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {templates.map((t) => {
                  const structureArr = Array.isArray(t.structure) ? t.structure : [];
                  return (
                    <div
                      key={t.id}
                      onClick={() => setViewTemplate(t)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${selectedTemplate === t.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={t.type === 'LAB' ? "secondary" : "default"}
                            className={t.type === 'THEORY' ? "bg-green-600" : t.type === 'LAB' ? "bg-purple-600 text-white" : ""}
                          >
                            {t.type}
                          </Badge>
                          <div>
                            <p className="font-medium text-sm">{t.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {structureArr.length} sections
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline">Template</Badge>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* TEMPLATE PREVIEW DIALOG */}
            <Dialog open={!!viewTemplate} onOpenChange={(open) => !open && setViewTemplate(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{viewTemplate?.name}</DialogTitle>
                </DialogHeader>
                <div className="mt-4 space-y-2">
                  <p className="font-medium text-sm text-muted-foreground mb-2">Structure:</p>
                  <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-2">
                    {(Array.isArray(viewTemplate?.structure) ? viewTemplate.structure : []).map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-2 bg-secondary/50 rounded-lg">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <span className="text-sm">{s.title}</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setViewTemplate(null)}>Cancel</Button>
                    <Button onClick={() => {
                      if (viewTemplate) {
                        setSelectedTemplate(viewTemplate.id);
                        setViewTemplate(null);
                      }
                    }}>Select Template</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* PREVIEW */}
          {selectedTemplate && (() => {
            const selected = templates.find((t) => t.id === selectedTemplate);
            const structureArr = Array.isArray(selected?.structure) ? selected.structure : [];
            return (
              <Card className="border-primary/50 bg-primary/5">
                <CardHeader>
                  <CardTitle className="text-base">
                    📋 Template Structure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {structureArr.map((s, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 bg-background rounded-lg"
                    >
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{s.title}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })()}

          {/* ACTION */}
          <Button
            onClick={handleApplyTemplate}
            disabled={!selectedCourse || !selectedTemplate || isApplying}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isApplying ? "Setting up..." : "Continue to Course Structure"}
          </Button>

          {!selectedCourse && (
            <div className="flex gap-3 p-4 bg-amber-50 rounded-lg border">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              <p className="text-sm">
                Please select both a course and a template to continue.
              </p>
            </div>
          )}
        </TabsContent>

        {/* ================= ABOUT TAB ================= */}
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                What is a Template?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              Templates help standardize and speed up course file creation.
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}