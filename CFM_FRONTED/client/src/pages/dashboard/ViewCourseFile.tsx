import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CourseFileTree, HeadingNode } from "@/components/CourseFileTree";
import { ArrowLeft, FileText } from "lucide-react";
import { course_files, courses, headings, documents, currentUser } from "@/lib/dummy-data";

export default function ViewCourseFilePage() {
  const navigate = useNavigate();
  const [courseFileId, setCourseFileId] = useState<number | null>(null);
  const [courseFileData, setCourseFileData] = useState<any>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id') || localStorage.getItem('viewCourseFileId');
    
    if (id) {
      const fileId = parseInt(id);
      setCourseFileId(fileId);
      
      const courseFile = course_files.find(cf => cf.id === fileId);
      if (courseFile) {
        const course = courses.find(c => c.id === courseFile.course_id);
        
        const fileHeadings = headings
          .filter(h => h.course_file_id === fileId)
          .map(heading => {
            const headingDocs = documents.filter(d => d.heading_id === heading.id);
            return {
              id: heading.id,
              title: heading.title,
              parent_heading_id: heading.parent_heading_id,
              order_index: heading.order_index,
              documents: headingDocs.map(doc => ({
                id: doc.id,
                file_name: doc.file_name,
                file_path: doc.file_path,
                type: doc.type,
                file_size: doc.file_size,
                version_no: doc.version_no,
                uploaded_at: doc.uploaded_at,
              })),
            } as HeadingNode;
          });

        setCourseFileData({
          courseFile,
          course,
          headings: fileHeadings,
        });
      }
    }
  }, []);

  if (!courseFileId || !courseFileData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/courses")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <p className="text-muted-foreground">Course file not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { courseFile, course, headings: fileHeadings } = courseFileData;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/courses")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Courses
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">View Course File</h1>
            <p className="text-muted-foreground mt-1">
              {course?.code} - {course?.title}
            </p>
          </div>
        </div>
        <Badge variant={courseFile.status === "APPROVED" ? "default" : "outline"}>
          {courseFile.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Course File Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Academic Year</p>
              <p className="text-sm font-medium">{courseFile.academic_year}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge variant="outline">{courseFile.status}</Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Created</p>
              <p className="text-sm font-medium">{new Date(courseFile.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Course Code</p>
              <p className="text-sm font-medium">{course?.code}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <CourseFileTree
        courseFileId={courseFile.id}
        courseCode={course?.code || ""}
        courseTitle={course?.title || ""}
        headings={fileHeadings}
        isReadOnly={true}
      />
    </div>
  );
}

