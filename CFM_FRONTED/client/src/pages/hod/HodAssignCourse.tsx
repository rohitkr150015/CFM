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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/utils/authFetch";
import { Plus, BookOpen, Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

interface CourseAssignment {
  id: number;
  courseId: number;
  courseCode: string;
  courseTitle: string;
  teacherId: number;
  teacherName: string;
  section: string;
  academicYear: string;
  isSubjectHead: boolean;
}

/* ================= COMPONENT ================= */

export default function HodAssignCourse() {
  const { toast } = useToast();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [assignments, setAssignments] = useState<CourseAssignment[]>([]);

  const [teacherId, setTeacherId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [section, setSection] = useState("");
  const [isSubjectHead, setIsSubjectHead] = useState(false);

  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<CourseAssignment | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState<CourseAssignment | null>(null);

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadTeachers();
    loadCourses();
    loadAssignments();
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

  const loadAssignments = async () => {
    try {
      const res = await authFetch("/api/hod/course-assignments");
      if (!res.ok) throw new Error();
      setAssignments(await res.json());
    } catch {
      toast({
        title: "Error",
        description: "Unable to load assignments",
        variant: "destructive",
      });
    }
  };

  /* ================= ASSIGN / UPDATE ================= */

  const saveAssignment = async () => {
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
      const payload = {
        teacherId: Number(teacherId),
        courseId: Number(courseId),
        academicYear,
        section,
        isSubjectHead,
      };

      const res = editing
        ? await authFetch(`/api/hod/course-assignments/${editing.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        })
        : await authFetch("/api/hod/assign-course", {
          method: "POST",
          body: JSON.stringify(payload),
        });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Operation failed");
      }

      toast({
        title: "Success",
        description: editing
          ? "Assignment updated successfully"
          : isSubjectHead
            ? "Course assigned successfully. Teacher is now Subject Head for this course."
            : "Course assigned successfully",
      });

      resetForm();
      loadAssignments();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Unable to save assignment",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE ================= */

  const confirmDelete = (assignment: CourseAssignment) => {
    setAssignmentToDelete(assignment);
    setDeleteDialogOpen(true);
  };

  const deleteAssignment = async () => {
    if (!assignmentToDelete) return;

    try {
      const res = await authFetch(`/api/hod/course-assignments/${assignmentToDelete.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Delete failed");
      }

      toast({
        title: "Success",
        description: "Assignment deleted successfully",
      });

      loadAssignments();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Unable to delete assignment",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setAssignmentToDelete(null);
    }
  };

  /* ================= EDIT ================= */

  const openEditDialog = (assignment: CourseAssignment) => {
    setEditing(assignment);
    setTeacherId(String(assignment.teacherId));
    setCourseId(String(assignment.courseId));
    setAcademicYear(assignment.academicYear);
    setSection(assignment.section);
    setIsSubjectHead(assignment.isSubjectHead);
    setOpen(true);
  };

  const resetForm = () => {
    setTeacherId("");
    setCourseId("");
    setAcademicYear("");
    setSection("");
    setIsSubjectHead(false);
    setEditing(null);
    setOpen(false);
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assigned Courses</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Assign Course
        </Button>
      </div>

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Section</TableHead>
            <TableHead>Academic Year</TableHead>
            <TableHead>Subject Head</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {assignments.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                <BookOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
                No course assignments found
              </TableCell>
            </TableRow>
          )}

          {assignments.map((assignment) => (
            <TableRow key={assignment.id}>
              <TableCell className="font-medium">
                {assignment.courseCode} — {assignment.courseTitle}
              </TableCell>
              <TableCell>{assignment.teacherName}</TableCell>
              <TableCell>{assignment.section}</TableCell>
              <TableCell>{assignment.academicYear}</TableCell>
              <TableCell>
                {assignment.isSubjectHead ? (
                  <Badge variant="default" className="bg-green-600">
                    Yes
                  </Badge>
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    No
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openEditDialog(assignment)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => confirmDelete(assignment)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Assign/Edit Course Dialog */}
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && resetForm()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Assignment" : "Assign Course to Faculty"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* TEACHER */}
            <div className="space-y-2">
              <Label>Teacher</Label>
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
            </div>

            {/* COURSE */}
            <div className="space-y-2">
              <Label>Course</Label>
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
            </div>

            {/* ACADEMIC YEAR */}
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input
                placeholder="e.g. 2024-25"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
              />
            </div>

            {/* SECTION */}
            <div className="space-y-2">
              <Label>Section</Label>
              <Input
                placeholder="e.g. A"
                value={section}
                onChange={(e) => setSection(e.target.value)}
              />
            </div>

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
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button onClick={saveAssignment} disabled={loading}>
              {loading ? "Saving..." : editing ? "Update" : "Assign Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this assignment? This will remove{" "}
              <strong>{assignmentToDelete?.teacherName}</strong> from{" "}
              <strong>{assignmentToDelete?.courseCode}</strong> (Section{" "}
              {assignmentToDelete?.section}, {assignmentToDelete?.academicYear}).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteAssignment}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}