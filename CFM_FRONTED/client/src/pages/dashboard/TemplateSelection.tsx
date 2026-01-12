import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { templates as defaultTemplates, courses } from "@/lib/dummy-data";

// Load templates from localStorage or use defaults
const getTemplates = () => {
  try {
    const stored = localStorage.getItem("templates");
    return stored ? JSON.parse(stored) : defaultTemplates;
  } catch {
    return defaultTemplates;
  }
};
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle2, BookOpen, FileText, AlertCircle, Lightbulb } from "lucide-react";

export default function TemplateSelectionPage() {
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [templates, setTemplates] = useState(getTemplates());

  useEffect(() => {
    setTemplates(getTemplates());
  }, []);

  const handleApplyTemplate = () => {
    if (selectedCourse && selectedTemplate) {
      setIsApplying(true);
      // Save selected template to localStorage for CourseStructure to retrieve
      localStorage.setItem("selectedTemplate", selectedTemplate.toString());
      setTimeout(() => {
        navigate(`/course-structure/${selectedCourse}`);
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Setup Your Course</h1>
        <p className="text-muted-foreground mt-1">Choose your course and select a template to organize your materials.</p>
      </div>

      <Tabs defaultValue="setup" className="space-y-4">
        <TabsList>
          <TabsTrigger value="setup">Setup</TabsTrigger>
          <TabsTrigger value="about">What is a Template?</TabsTrigger>
        </TabsList>

        {/* Setup Tab */}
        <TabsContent value="setup" className="space-y-6">
          {/* Selection Cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* Course Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  Step 1: Select Your Course
                </CardTitle>
                <CardDescription>Which course do you want to organize?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a course..." />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map(c => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.code} - {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedCourse && (
                  <div className="p-3 bg-green-50 rounded-lg flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700 font-medium">Course selected ✓</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Step 2: Choose a Template
                </CardTitle>
                <CardDescription>Pick a structure for organizing your files</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  {templates.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                        selectedTemplate === t.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{t.structure.length} sections</p>
                        </div>
                        <Badge variant="outline">Template</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Template Preview */}
          {selectedTemplate && (
            <Card className="border-primary/50 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base">📋 Your Template Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-3">This template will create these sections for you:</p>
                  {templates
                    .find(t => t.id === selectedTemplate)
                    ?.structure.map((field, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-2 bg-background rounded-lg">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <span className="text-sm font-medium">{field}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleApplyTemplate}
              disabled={!selectedCourse || !selectedTemplate || isApplying}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isApplying ? "Setting up..." : "Continue to Course Structure"}
            </Button>
            <Button variant="outline">Cancel</Button>
          </div>

          {!selectedCourse && (
            <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-amber-900">
                <p className="font-medium">Please select both a course and template to continue.</p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* About Templates Tab */}
        <TabsContent value="about" className="space-y-4">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Lightbulb className="h-5 w-5 text-blue-600" />
                What is a Template?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-blue-900">
                A <strong>template</strong> is a pre-made folder structure that helps you organize your course materials in a standardized way.
              </p>
              
              <div className="bg-white p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-sm">Why use templates?</h4>
                <ul className="text-sm text-blue-900 space-y-2 ml-4">
                  <li>✓ <strong>Consistency:</strong> Keep all courses organized the same way</li>
                  <li>✓ <strong>Speed:</strong> Don't start from scratch - instant folder structure</li>
                  <li>✓ <strong>Completeness:</strong> Ensures you don't forget important sections</li>
                  <li>✓ <strong>Easy sharing:</strong> Others know where to find specific materials</li>
                </ul>
              </div>

              <div className="bg-white p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-sm">Available Templates</h4>
                <div className="space-y-2">
                  {templates.map(t => (
                    <div key={t.id} className="border-l-2 border-blue-600 pl-3 py-1">
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{Array.isArray(t.structure) ? t.structure.join(" • ") : "Template structure"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg space-y-3">
                <h4 className="font-semibold text-sm">Example: Using a Template</h4>
                <div className="text-sm text-blue-900 space-y-2">
                  <p>1️⃣ Select your course (e.g., "CS101 - Intro to Computer Science")</p>
                  <p>2️⃣ Pick a template (e.g., "Course Syllabus Template")</p>
                  <p>3️⃣ Click "Continue to Course Structure"</p>
                  <p>4️⃣ You'll see folders for: Course Outcomes, Weekly Plan, Textbooks</p>
                  <p>5️⃣ Upload your files into each folder</p>
                  <p>6️⃣ Your course is organized!</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button onClick={() => {
            const setupTab = document.querySelector('[role="tab"][data-state="inactive"]');
            if (setupTab) (setupTab as HTMLElement).click();
          }} className="w-full">
            Ready? Go to Setup
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
