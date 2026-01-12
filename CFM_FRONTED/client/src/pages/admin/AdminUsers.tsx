import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import {
  Search, Trash2, UserPlus, MoreHorizontal, CheckCircle2
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/utils/authFetch";

/* ================= TYPES ================= */

interface BackendUser {
  id: number;
  username: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "HOD" | "SUBJECT_HEAD";
  isActive: boolean;
  createdAt: string;
}

/* ================= COMPONENT ================= */

export default function AdminUsersPage() {
  const { toast } = useToast();

  const [users, setUsers] = useState<BackendUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  const [isAddOpen, setIsAddOpen] = useState(false);


  /* ================= LOAD USERS ================= */

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const res = await authFetch("/api/admin/teachers");

      if (!res.ok) {
        toast({
          title: "Unauthorized",
          description: "Please login again",
          variant: "destructive",
        });
        setUsers([]);
        return;
      }

      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      toast({
        title: "Error",
        description: "Unable to load users",
        variant: "destructive",
      });
      setUsers([]);
    }
  };

  /* ================= APPROVE USER ================= */

  const approveUser = async (userId: number) => {
    try {
      const res = await authFetch(`/api/admin/approve/${userId}`, {
        method: "POST",
      });

      if (!res.ok) {
        const err = await res.json();
        toast({
          title: "Approval Failed",
          description: err.message || "Unable to approve user",
          variant: "destructive",
        });
        return;
      }

      toast({ title: "User Approved" });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isActive: true } : u));
    } catch {
      toast({
        title: "Server Error",
        description: "Backend se connect nahi ho paa raha",
        variant: "destructive",
      });
    }
  };

  /* ================= FILTER ================= */

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
          ? u.isActive
          : !u.isActive;

    return matchesSearch && matchesStatus;
  });

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Manage system access and approvals
          </p>
        </div>

        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create User</DialogTitle>
            </DialogHeader>
            <DialogFooter>
              <Button onClick={() => setIsAddOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* SEARCH + FILTER */}
      <div className="flex items-center gap-4 p-4 border rounded-lg">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
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
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Joined</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredUsers.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-muted-foreground">
                No users found
              </TableCell>
            </TableRow>
          )}

          {filteredUsers.map(user => (
            <TableRow key={user.id}>
              <TableCell>#{user.id}</TableCell>
              <TableCell>{user.username}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge>{user.role}</Badge>
              </TableCell>
              <TableCell>
                {user.isActive ? "Active" : "Inactive"}
              </TableCell>
              <TableCell>
                {user.createdAt?.split("T")[0]}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">

                    {!user.isActive && (
                      <DropdownMenuItem onClick={() => approveUser(user.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                        Approve
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
