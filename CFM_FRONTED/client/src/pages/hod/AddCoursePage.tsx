import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { authFetch } from "@/utils/authFetch";
import { getPrograms } from "@/api/programApi";
import { getBranches } from "@/api/branchApi";
import { getSemesters } from "@/api/semesterApi";

/* ===== TYPES ===== */
interface Program {
  id: number;
  name: string;
}

interface Branch {
  id: number;
  name: string;
}

interface Semester {
  id: number;
  label: string;
}

interface Course {
  id: number;
  code: string;
  title: string;
  credits: number;
  contactHour: number;
}

/* ================= COMPONENT ================= */

export default function HodCoursesPage() {
  const { toast } = useToast();

  /* ===== STATE ===== */
  const [programs, setPrograms] = useState<Program[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);

  const [form, setForm] = useState({
    programId: "",
    branchId: "",
    semesterId: "",
    code: "",
    title: "",
    credits: "",
    contactHour: "",
  });

  /* ================= LOAD ================= */

  useEffect(() => {
    loadPrograms();
    loadCourses();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await getPrograms();
      setPrograms(Array.isArray(data) ? data : []);
    } catch {
      setPrograms([]);
    }
  };

  const loadCourses = async () => {
    try {
      const res = await authFetch("/api/hod/courses");

      if (!res.ok) {
        setCourses([]);
        return;
      }

      const data = await res.json();
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setCourses([]);
      toast({
        title: "Session expired",
        description: "Please login again",
        variant: "destructive",
      });
    }
  };

  /* ================= CASCADING ================= */

  const onProgramChange = async (programId: string) => {
    setForm({
      programId,
      branchId: "",
      semesterId: "",
      code: "",
      title: "",
      credits: "",
      contactHour: "",
    });

    setBranches([]);
    setSemesters([]);

    try {
      const data = await getBranches(Number(programId));
      setBranches(Array.isArray(data) ? data : []);
    } catch {
      setBranches([]);
    }
  };

  const onBranchChange = async (branchId: string) => {
    setForm(f => ({ ...f, branchId, semesterId: "" }));

    try {
      const data = await getSemesters(
        Number(form.programId),
        Number(branchId)
      );
      setSemesters(Array.isArray(data) ? data : []);
    } catch {
      setSemesters([]);
    }
  };

  /* ================= VALIDATION ================= */

  const isFormValid = () =>
    form.programId &&
    form.branchId &&
    form.semesterId &&
    form.code.trim() &&
    form.title.trim() &&
    Number(form.credits) > 0 &&
    Number(form.contactHour) > 0;

  /* ================= SAVE ================= */

  const saveCourse = async () => {
    if (!isFormValid()) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }

    const payload = {
      programId: Number(form.programId),
      branchId: Number(form.branchId),
      semesterId: Number(form.semesterId),
      code: form.code,
      title: form.title,
      credits: Number(form.credits),
      contactHour: Number(form.contactHour),
    };

    try {
      const res = await authFetch(
        editing ? `/api/hod/courses/${editing.id}` : "/api/hod/courses",
        {
          method: editing ? "PUT" : "POST",
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        toast({ title: "Save failed", variant: "destructive" });
        return;
      }

      toast({ title: editing ? "Course updated" : "Course added" });
      resetForm();
      loadCourses();
    } catch {
      toast({ title: "Server error", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setOpen(false);
    setEditing(null);
    setForm({
      programId: "",
      branchId: "",
      semesterId: "",
      code: "",
      title: "",
      credits: "",
      contactHour: "",
    });
  };

  /* ================= DELETE ================= */

  const deleteCourse = async (id: number) => {
    try {
      const res = await authFetch(`/api/hod/courses/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({ title: "Course deleted" });
        loadCourses();
      }
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Course
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Hours</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {courses.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted">
                No courses found
              </TableCell>
            </TableRow>
          )}

          {courses.map(c => (
            <TableRow key={c.id}>
              <TableCell>{c.code}</TableCell>
              <TableCell>{c.title}</TableCell>
              <TableCell>{c.credits}</TableCell>
              <TableCell>{c.contactHour}</TableCell>
              <TableCell className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setEditing(c);
                    setOpen(true);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteCourse(c.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* ===== DIALOG ===== */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit Course" : "Add Course"}
            </DialogTitle>
          </DialogHeader>

          <Label>Program</Label>
          <Select value={form.programId} onValueChange={onProgramChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Program" />
            </SelectTrigger>
            <SelectContent>
              {programs.map(p => (
                <SelectItem key={p.id} value={String(p.id)}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Branch</Label>
          <Select value={form.branchId} onValueChange={onBranchChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select Branch" />
            </SelectTrigger>
            <SelectContent>
              {branches.map(b => (
                <SelectItem key={b.id} value={String(b.id)}>
                  {b.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Semester</Label>
          <Select
            value={form.semesterId}
            onValueChange={v =>
              setForm(f => ({ ...f, semesterId: v }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              {semesters.map(s => (
                <SelectItem key={s.id} value={String(s.id)}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Label>Code</Label>
          <Input
            value={form.code}
            onChange={e =>
              setForm(f => ({ ...f, code: e.target.value }))
            }
          />

          <Label>Title</Label>
          <Input
            value={form.title}
            onChange={e =>
              setForm(f => ({ ...f, title: e.target.value }))
            }
          />

          <Label>Credits</Label>
          <Input
            type="number"
            value={form.credits}
            onChange={e =>
              setForm(f => ({ ...f, credits: e.target.value }))
            }
          />

          <Label>Contact Hours</Label>
          <Input
            type="number"
            value={form.contactHour}
            onChange={e =>
              setForm(f => ({ ...f, contactHour: e.target.value }))
            }
          />

          <DialogFooter>
            <Button onClick={saveCourse}>
              {editing ? "Update" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
