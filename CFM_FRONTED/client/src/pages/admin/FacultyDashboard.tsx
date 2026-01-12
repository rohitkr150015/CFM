import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Search, Edit2, Trash2, MoreHorizontal, UserCog
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/utils/authFetch";

/* ================= TYPES ================= */

type RoleType = "TEACHER" | "HOD" | "SUBJECT_HEAD" | "ADMIN";

interface Department {
  id: number;
  name: string;
}

interface TeacherInfo {
  id: number;
  name: string;
  departmentId?: number | null;
  departmentName?: string | null;
}

interface FacultyUser {
  id: number;
  username: string;
  email: string;
  role: RoleType;
  isActive: boolean;
  createdAt: string;
  teacher?: TeacherInfo | null;
}

/* ================= COMPONENT ================= */

export default function FacultyDashboard() {
  const { toast } = useToast();

  const [faculty, setFaculty] = useState<FacultyUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");
  const [roleFilter, setRoleFilter] =
    useState<"all" | RoleType>("all");

  const [editingUser, setEditingUser] = useState<FacultyUser | null>(null);
  const [deleteUser, setDeleteUser] = useState<FacultyUser | null>(null);

  const [editForm, setEditForm] = useState<{
    name: string;
    email: string;
    role: RoleType;
    departmentId: number | "";
  }>({
    name: "",
    email: "",
    role: "TEACHER",
    departmentId: "",
  });

  /* ================= LOAD DATA ================= */

  useEffect(() => {
    loadFaculty();
    loadDepartments();
  }, []);

  const loadFaculty = async () => {
    try {
      const res = await authFetch("/api/admin/faculty/all");
      if (!res.ok) return setFaculty([]);
      const data = await res.json();
      setFaculty(Array.isArray(data) ? data : []);
    } catch {
      toast({
        title: "Error",
        description: "Unable to load faculty list",
        variant: "destructive",
      });
      setFaculty([]);
    }
  };

  const loadDepartments = async () => {
    try {
      const res = await authFetch("/api/admin/departments");
      if (!res.ok) return setDepartments([]);
      const data = await res.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch {
      setDepartments([]);
    }
  };

  /* ================= FILTER ================= */

  const filteredFaculty = faculty.filter(u => {
    const name = u.teacher?.name || u.username;
    const matchesSearch =
      name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? u.isActive
        : !u.isActive;

    const matchesRole =
      roleFilter === "all" ? true : u.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  /* ================= EDIT ================= */

  const openEditDialog = (user: FacultyUser) => {
    setEditingUser(user);
    setEditForm({
      name: user.teacher?.name || user.username,
      email: user.email,
      role: user.role,
      departmentId: user.teacher?.departmentId || "",
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      const res = await authFetch(
        `/api/admin/faculty/update/${editingUser.id}`,
        {
          method: "PUT",
          body: JSON.stringify({
            name: editForm.name,
            email: editForm.email,
            role: editForm.role,
            departmentId:
              editForm.departmentId === "" ? null : editForm.departmentId,
          }),
        }
      );

      if (!res.ok) {
        const err = await res.json();
        toast({
          title: "Update Failed",
          description: err.message || "Could not update faculty",
          variant: "destructive",
        });
        return;
      }

      const updated = await res.json();
      setFaculty(prev =>
        prev.map(u => (u.id === updated.id ? updated : u))
      );

      toast({ title: "Faculty Updated" });
      setEditingUser(null);
    } catch {
      toast({
        title: "Server Error",
        description: "Backend se connect nahi ho paa raha",
        variant: "destructive",
      });
    }
  };

  /* ================= DELETE ================= */

  const confirmDelete = async () => {
    if (!deleteUser) return;

    try {
      const res = await authFetch(
        `/api/admin/faculty/delete/${deleteUser.id}`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        toast({ title: "Delete Failed", variant: "destructive" });
        return;
      }

      setFaculty(prev => prev.filter(u => u.id !== deleteUser.id));
      toast({ title: "Faculty Deleted" });
      setDeleteUser(null);
    } catch {
      toast({
        title: "Server Error",
        description: "Backend se connect nahi ho paa raha",
        variant: "destructive",
      });
    }
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Faculty</h1>

      {/* SEARCH + FILTER */}
      <div className="flex flex-wrap gap-3 p-4 border rounded-lg">
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search faculty..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
          <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="TEACHER">TEACHER</SelectItem>
            <SelectItem value="HOD">HOD</SelectItem>
            <SelectItem value="SUBJECT_HEAD">SUBJECT_HEAD</SelectItem>
            <SelectItem value="ADMIN">ADMIN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABLE */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredFaculty.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground">
                No faculty found
              </TableCell>
            </TableRow>
          )}

          {filteredFaculty.map(user => (
            <TableRow key={user.id}>
              <TableCell>#{user.id}</TableCell>
              <TableCell>{user.teacher?.name || user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{user.teacher?.departmentName || "-"}</TableCell>
              <TableCell><Badge>{user.role}</Badge></TableCell>
              <TableCell>{user.isActive ? "Active" : "Inactive"}</TableCell>
              <TableCell>{user.createdAt?.split("T")[0]}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openEditDialog(user)}>
                      <Edit2 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => setDeleteUser(user)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* EDIT DIALOG */}
      <Dialog open={!!editingUser} onOpenChange={o => !o && setEditingUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex gap-2 items-center">
              <UserCog className="h-5 w-5" /> Edit Faculty
            </DialogTitle>
          </DialogHeader>

          {editingUser && (
            <form onSubmit={handleEditSubmit} className="space-y-4 py-4">
              <Label>Name</Label>
              <Input
                value={editForm.name}
                onChange={e =>
                  setEditForm(f => ({ ...f, name: e.target.value }))
                }
              />

              <Label>Email</Label>
              <Input
                value={editForm.email}
                onChange={e =>
                  setEditForm(f => ({ ...f, email: e.target.value }))
                }
              />

              <Label>Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(v: any) =>
                  setEditForm(f => ({ ...f, role: v }))
                }
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="TEACHER">TEACHER</SelectItem>
                  <SelectItem value="HOD">HOD</SelectItem>
                  <SelectItem value="SUBJECT_HEAD">SUBJECT_HEAD</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>

              {/* 🔥 DEPARTMENT SELECT */}
              <Label>Department</Label>
              <Select
                value={editForm.departmentId === "" ? "none" : String(editForm.departmentId)}
                onValueChange={(v: string) =>
                  setEditForm(f => ({
                    ...f,
                    departmentId: v === "none" ? "" : Number(v),
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not Assigned</SelectItem>
                  {departments.map(d => (
                    <SelectItem key={d.id} value={String(d.id)}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <DialogFooter>
                <Button type="submit">Save</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRM */}
      <Dialog open={!!deleteUser} onOpenChange={o => !o && setDeleteUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Faculty</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteUser(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
