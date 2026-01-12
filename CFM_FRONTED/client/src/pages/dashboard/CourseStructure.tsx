import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CourseStructureTree, TreeNode } from "@/components/CourseStructureTree";
import { AlertCircle, Download, Save, BookOpen, CheckCircle2, Upload, FileText, HelpCircle } from "lucide-react";

const createStructureFromTemplate = (templateName: string, sections: string[]): TreeNode => {
  return {
    id: "root",
    name: templateName,
    level: 0,
    children: sections.map((section, idx) => ({
      id: idx.toString(),
      name: section,
      level: 1,
      children: [],
      files: [],
      completed: false,
    })),
    files: [],
    completed: false,
  };
};

const mockInitialStructure: TreeNode = {
  id: "root",
  name: "CS101 - Intro to Computer Science",
  level: 0,
  children: [
    {
      id: "1",
      name: "Course Outcomes",
      level: 1,
      children: [],
      files: [
        { id: "f1", name: "CO_Document.pdf", size: "245 KB", date: "Nov 27, 2024", versions: 1 }
      ],
      completed: true,
    },
    {
      id: "2",
      name: "Weekly Plan",
      level: 1,
      children: [
        {
          id: "2a",
          name: "Week 1-4",
          level: 2,
          children: [],
          files: [
            { id: "f2", name: "Week1_Slides.pptx", size: "12.5 MB", date: "Nov 20, 2024", versions: 2 }
          ],
          completed: true,
        },
        {
          id: "2b",
          name: "Week 5-8",
          level: 2,
          children: [],
          files: [],
          completed: false,
        },
      ],
      files: [],
      completed: false,
    },
    {
      id: "3",
      name: "Textbooks & References",
      level: 1,
      children: [],
      files: [],
      completed: false,
    },
  ],
  files: [],
  completed: false,
};

export default function CourseStructurePage() {
  const [structure, setStructure] = useState(mockInitialStructure);

  useEffect(() => {
    // Load selected template from localStorage
    const selectedTemplateId = localStorage.getItem("selectedTemplate");
    if (selectedTemplateId) {
      const templates = JSON.parse(localStorage.getItem("templates") || "[]");
      const template = templates.find((t: any) => t.id === parseInt(selectedTemplateId));
      if (template && template.structure) {
        const courseName = `${template.name}`;
        const newStructure = createStructureFromTemplate(courseName, template.structure);
        setStructure(newStructure);
        localStorage.removeItem("selectedTemplate");
      }
    }
  }, []);
  const [isSaved, setIsSaved] = useState(true);

  const handleStructureChange = (newStructure: TreeNode) => {
    setStructure(newStructure);
    setIsSaved(false);
  };

  const handleSave = () => {
    setIsSaved(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Course Structure</h1>
          <p className="text-muted-foreground mt-1">Organize your course materials in a hierarchical structure.</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            disabled={isSaved}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaved ? "Saved" : "Save Changes"}
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
              <p className="text-2xl font-bold">65%</p>
              <p className="text-sm text-muted-foreground">Completion</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">8</p>
              <p className="text-sm text-muted-foreground">Total Files</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">5</p>
              <p className="text-sm text-muted-foreground">Sections</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Badge variant="outline" className="text-green-700">Active</Badge>
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
            templateName="Course Syllabus Template"
            courseName="CS101"
            initialStructure={structure}
            onStructureChange={handleStructureChange}
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
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold">Understand the Structure</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      You have a hierarchical tree structure for your course. Each box is a "section" (e.g., "Course Outcomes", "Weekly Plan"). You can have:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 ml-4 space-y-1">
                      <li>• <strong>Main sections</strong> (Level 1): Large topics like "Course Outcomes"</li>
                      <li>• <strong>Sub-sections</strong> (Level 2): Smaller topics like "Week 1-4" under "Weekly Plan"</li>
                      <li>• <strong>Files</strong>: PDFs, PowerPoints, Documents inside each section</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold">Upload Files</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click the <Upload className="h-3 w-3 inline text-blue-600" /> icon next to any section to upload files:
                    </p>
                    <div className="bg-white p-3 rounded mt-2 text-sm">
                      <p className="font-mono text-xs">Example: Click upload button on "Course Outcomes" section</p>
                      <p className="text-xs text-muted-foreground mt-1">→ Upload your course outcomes PDF</p>
                      <p className="text-xs text-muted-foreground">→ File appears under that section</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold">Manage Files</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Each file shows options to:
                    </p>
                    <ul className="text-sm text-muted-foreground mt-2 ml-4 space-y-1">
                      <li>• <Download className="h-3 w-3 inline" /> Download the file</li>
                      <li>• <FileText className="h-3 w-3 inline" /> Edit/Update the file (creates new version)</li>
                      <li>• Delete the file if needed</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                    4
                  </div>
                  <div>
                    <h4 className="font-semibold">Add New Sections (Optional)</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click the <span className="text-green-600 font-semibold">+ icon</span> to add sub-sections under a main section:
                    </p>
                    <div className="bg-white p-3 rounded mt-2 text-sm">
                      <p className="font-mono text-xs">Example: Click + on "Weekly Plan"</p>
                      <p className="text-xs text-muted-foreground mt-1">→ Add "Week 9-12" as a new sub-section</p>
                      <p className="text-xs text-muted-foreground">→ You can now upload files to that section</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Step 5 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                    5
                  </div>
                  <div>
                    <h4 className="font-semibold">Track Progress</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      The progress bar shows your completion status. Each section automatically updates when you upload files.
                    </p>
                  </div>
                </div>
              </div>

              {/* Step 6 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-600 text-white font-bold text-sm flex-shrink-0">
                    6
                  </div>
                  <div>
                    <h4 className="font-semibold">Save Your Work</h4>
                    <p className="text-sm text-muted-foreground mt-1">
                      Always click the <Save className="h-3 w-3 inline text-blue-600" /> <strong>Save Changes</strong> button after making changes to save your structure.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Example */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Real-World Example
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
                <p className="font-semibold">Scenario: You're teaching "Database Systems"</p>
                <div className="mt-3 space-y-2">
                  <div className="ml-4">
                    <p className="font-mono text-xs font-bold">📁 Database Systems</p>
                    <div className="ml-4 mt-2 space-y-2">
                      <p className="font-mono text-xs">📄 Course Syllabus.pdf (uploaded ✓)</p>
                      <p className="font-mono text-xs">📁 Module 1: SQL Basics</p>
                      <div className="ml-4 space-y-1">
                        <p className="font-mono text-xs">📄 SQL_Introduction.pptx (uploaded ✓)</p>
                        <p className="font-mono text-xs">📄 Practice_Queries.pdf (uploaded ✓)</p>
                      </div>
                      <p className="font-mono text-xs">📁 Module 2: Normalization</p>
                      <div className="ml-4 space-y-1">
                        <p className="font-mono text-xs">📄 (Empty - needs file)</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-2 bg-green-50 rounded flex items-center gap-2 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs">Progress: 60% Complete</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2 text-amber-900">
                <AlertCircle className="h-5 w-5" />
                Tips & Best Practices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-amber-900">
                <li>✓ Use clear, descriptive section names (e.g., "Week 1-2" instead of "Week 1")</li>
                <li>✓ Upload files one section at a time to keep organized</li>
                <li>✓ Version control: Upload updated files with new version numbers</li>
                <li>✓ Always save your changes before leaving the page</li>
                <li>✓ You can export your entire course structure as a PDF for backup</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
