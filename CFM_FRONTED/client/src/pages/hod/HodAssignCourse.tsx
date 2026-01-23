import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/utils/authFetch";

/* ================= TYPES ================= */

interface Teacher {
  id: number;
  name: string;
}

interface Course {
  id: number;
  code: string;
  title: string;
}

/* ================= COMPONENT ================= */

export default function HodAssignCourse() {
  const { toast } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [teacherId, setTeacherId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [section, setSection] = useState("");
  const [isSubjectHead, setIsSubjectHead] = useState(false);

  const [loading, setLoading] = useState(false);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadTeachers();
    loadCourses();
  }, []);

  const loadTeachers = async () => {
    try {
      const res = await authFetch("/api/hod/faculty");
      if (!res.ok) throw new Error();
      setTeachers(await res.json());
    } catch {
      toast({
        title: "Error",
        description: "Unable to load teachers",
        variant: "destructive",
      });
    }
  };

  const loadCourses = async () => {
    try {
      const res = await authFetch("/api/hod/courses");
      if (!res.ok) throw new Error();
      setCourses(await res.json());
    } catch {
      toast({
        title: "Error",
        description: "Unable to load courses",
        variant: "destructive",
      });
    }
  };

  /* ================= ASSIGN ================= */

  const assignCourse = async () => {
    if (!teacherId || !courseId || !academicYear || !section) {
      toast({
        title: "Missing fields",
        description: "Please fill all fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await authFetch("/api/hod/assign-course", {
        method: "POST",
        body: JSON.stringify({
          teacherId: Number(teacherId),
          courseId: Number(courseId),
          academicYear,
          section,
          isSubjectHead,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Assignment failed");
      }

      toast({
        title: "Success",
        description: isSubjectHead
          ? "Course assigned successfully. Teacher is now Subject Head for this course."
          : "Course assigned successfully",
      });

      // reset form
      setTeacherId("");
      setCourseId("");
      setAcademicYear("");
      setSection("");
      setIsSubjectHead(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Unable to assign course",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= UI ================= */

  return (
    <div className="max-w-xl mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Assign Course to Faculty</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* TEACHER */}
          <Select value={teacherId} onValueChange={setTeacherId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={String(t.id)}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* COURSE */}
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger>
              <SelectValue placeholder="Select Course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.code} — {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* ACADEMIC YEAR */}
          <Input
            placeholder="Academic Year (e.g. 2024-25)"
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
          />

          {/* SECTION */}
          <Input
            placeholder="Section (e.g. A)"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          />

          {/* IS SUBJECT HEAD CHECKBOX */}
          <div className="flex items-center space-x-3 p-3 border rounded-md bg-muted/30">
            <Checkbox
              id="isSubjectHead"
              checked={isSubjectHead}
              onCheckedChange={(checked) => setIsSubjectHead(checked === true)}
            />
            <div className="space-y-0.5">
              <Label htmlFor="isSubjectHead" className="cursor-pointer font-medium">
                Assign as Subject Head
              </Label>
              <p className="text-xs text-muted-foreground">
                This teacher will be the Subject Head for this course and can approve other teachers' course files.
              </p>
            </div>
          </div>

          {/* BUTTON */}
          <Button
            className="w-full"
            onClick={assignCourse}
            disabled={loading}
          >
            {loading ? "Assigning..." : "Assign Course"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}