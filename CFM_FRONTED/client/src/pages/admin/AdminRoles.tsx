import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Shield, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function AdminRolesPage() {
  const { toast } = useToast();
  const [roles, setRoles] = useState<any[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newRoleName, setNewRoleName] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("admin_roles") || JSON.stringify([
      { id: 1, name: "Admin", users: 3, permissions: ["all"] },
      { id: 2, name: "HOD", users: 12, permissions: ["approve_file", "manage_dept", "view_reports"] },
      { id: 3, name: "Teacher", users: 45, permissions: ["create_course_file", "upload_document", "submit_file"] },
    ]);
    setRoles(JSON.parse(stored));
  }, []);

  const allPermissions = [
    "create_course_file",
    "upload_document",
    "submit_file",
    "approve_file",
    "manage_dept",
    "view_reports",
    "edit_course",
    "delete_course",
    "all"
  ];

  const handleAddRole = () => {
    if (!newRoleName.trim() || selectedPermissions.length === 0) {
      toast({ title: "Error", description: "Fill role name and select permissions" });
      return;
    }

    const newRole = {
      id: Math.max(...roles.map(r => r.id), 0) + 1,
      name: newRoleName,
      users: 0,
      permissions: selectedPermissions
    };

    const updated = [...roles, newRole];
    setRoles(updated);
    localStorage.setItem("admin_roles", JSON.stringify(updated));
    toast({ title: "Success", description: "Role created" });
    setNewRoleName("");
    setSelectedPermissions([]);
    setIsAddOpen(false);
  };

  const handleDeleteRole = (id: number) => {
    if (id <= 3) {
      toast({ title: "Error", description: "Cannot delete default roles" });
      return;
    }
    const updated = roles.filter(r => r.id !== id);
    setRoles(updated);
    localStorage.setItem("admin_roles", JSON.stringify(updated));
    toast({ title: "Deleted", description: "Role removed" });
  };

  const togglePermission = (perm: string) => {
    if (selectedPermissions.includes(perm)) {
      setSelectedPermissions(selectedPermissions.filter(p => p !== perm));
    } else {
      setSelectedPermissions([...selectedPermissions, perm]);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Roles & Permissions</h1>
          <p className="text-muted-foreground mt-1">Configure access levels for different user types.</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="mr-2 h-4 w-4" /> Add Role
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Role</DialogTitle>
              <DialogDescription>Define a new role and assign permissions</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Role Name</Label>
                <Input value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} placeholder="e.g. Subject Coordinator"/>
              </div>
              <div className="space-y-3">
                <Label>Permissions</Label>
                <div className="grid grid-cols-2 gap-3">
                  {allPermissions.map(perm => (
                    <div key={perm} className="flex items-center gap-2 border p-2 rounded">
                      <input type="checkbox" checked={selectedPermissions.includes(perm)} onChange={() => togglePermission(perm)} className="w-4 h-4"/>
                      <span className="text-sm">{perm.replace(/_/g, " ").toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter><Button onClick={handleAddRole} className="bg-blue-600 hover:bg-blue-700">Create Role</Button></DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role Name</TableHead>
              <TableHead>Active Users</TableHead>
              <TableHead>Permissions Summary</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  {role.name}
                </TableCell>
                <TableCell>{role.users} users</TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {role.permissions.map((perm) => (
                      <Badge key={perm} variant="secondary" className="text-xs font-mono">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDeleteRole(role.id)} data-testid={`button-delete-role-${role.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
