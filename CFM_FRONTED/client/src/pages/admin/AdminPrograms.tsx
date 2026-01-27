import { useEffect, useState } from "react";
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
  Plus, Trash2, BookOpen, GitBranch, Calendar, Edit2
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// APIs
import { getDepartments } from "@/api/departments";
import {
  getPrograms, createProgram, updateProgram, deleteProgram
} from "@/api/programApi";
import {
  getBranches, getAllBranches, createBranch, deleteBranch
} from "@/api/branchApi";
import {
  getSemesters, getAllSemesters, createSemester, deleteSemester
} from "@/api/semesterApi";

export default function AdminProgramsPage() {
  const { toast } = useToast();

  /* ================= STATE ================= */
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  // For table display (all data)
  const [allBranches, setAllBranches] = useState<any[]>([]);
  const [allSemesters, setAllSemesters] = useState<any[]>([]);
  // For dialog filtered dropdowns
  const [filteredBranches, setFilteredBranches] = useState<any[]>([]);

  const [programForm, setProgramForm] = useState<any>({
    id: null, name: "", code: "", duration_year: "", degree_type: "", department_id: ""
  });

  const [branchForm, setBranchForm] = useState<any>({
    name: "", code: "", program_id: ""
  });

  const [semesterForm, setSemesterForm] = useState<any>({
    semester_number: "", label: "", program_id: "", branch_id: ""
  });

  const [openProgram, setOpenProgram] = useState(false);
  const [openBranch, setOpenBranch] = useState(false);
  const [openSemester, setOpenSemester] = useState(false);
  const [editProgram, setEditProgram] = useState(false);

  /* ================= HELPERS ================= */
  const toArray = (res: any) => Array.isArray(res) ? res : res?.data || [];

  /* ================= LOADERS ================= */
  const loadDepartments = async () => setDepartments(toArray(await getDepartments()));
  const loadPrograms = async () => setPrograms(toArray(await getPrograms()));
  const loadAllBranches = async () => setAllBranches(toArray(await getAllBranches()));
  const loadAllSemesters = async () => setAllSemesters(toArray(await getAllSemesters()));
  const loadFilteredBranches = async (pid: number) =>
    pid ? setFilteredBranches(toArray(await getBranches(pid))) : setFilteredBranches([]);

  useEffect(() => {
    loadDepartments();
    loadPrograms();
    loadAllBranches();
    loadAllSemesters();
  }, []);

  /* ================= PROGRAM ================= */
  const saveProgram = async () => {
    editProgram
      ? await updateProgram(programForm.id, programForm)
      : await createProgram(programForm);
    toast({ title: editProgram ? "Program Updated" : "Program Added" });
    setOpenProgram(false);
    setEditProgram(false);
    loadPrograms();
  };

  const removeProgram = async (id: number) => {
    await deleteProgram(id);
    toast({ title: "Program Deleted" });
    loadPrograms();
  };

  /* ================= BRANCH ================= */
  const saveBranch = async () => {
    await createBranch(branchForm);
    toast({ title: "Branch Added" });
    setOpenBranch(false);
    loadAllBranches();
  };

  const removeBranch = async (id: number) => {
    await deleteBranch(id);
    toast({ title: "Branch Deleted" });
    loadAllBranches();
  };

  /* ================= SEMESTER ================= */
  const saveSemester = async () => {
    await createSemester(semesterForm);
    toast({ title: "Semester Added" });
    setOpenSemester(false);
    loadAllSemesters();
  };

  const removeSemester = async (id: number) => {
    await deleteSemester(id);
    toast({ title: "Semester Deleted" });
    loadAllSemesters();
  };

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Academic Structure</h1>

      <Tabs defaultValue="programs">
        <TabsList>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="semesters">Semesters</TabsTrigger>
        </TabsList>

        {/* ================= PROGRAMS ================= */}
        <TabsContent value="programs">
          <div className="flex justify-end mb-4">
            <Dialog open={openProgram} onOpenChange={setOpenProgram}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditProgram(false);
                  setProgramForm({ id: null, name: "", code: "", duration_year: "", degree_type: "", department_id: "" });
                }}>
                  <Plus className="mr-2 h-4 w-4" /> Add Program
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader><DialogTitle>{editProgram ? "Edit Program" : "Add Program"}</DialogTitle></DialogHeader>

                <Label>Department</Label>
                <Select value={programForm.department_id}
                  onValueChange={(v) => setProgramForm({ ...programForm, department_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Department" /></SelectTrigger>
                  <SelectContent>
                    {departments.map(d => (
                      <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input placeholder="Name" value={programForm.name}
                  onChange={e => setProgramForm({ ...programForm, name: e.target.value })} />
                <Input placeholder="Code" value={programForm.code}
                  onChange={e => setProgramForm({ ...programForm, code: e.target.value })} />
                <Input type="number" placeholder="Duration" value={programForm.duration_year}
                  onChange={e => setProgramForm({ ...programForm, duration_year: e.target.value })} />
                <Input placeholder="Degree Type" value={programForm.degree_type}
                  onChange={e => setProgramForm({ ...programForm, degree_type: e.target.value })} />

                <DialogFooter>
                  <Button onClick={saveProgram}>{editProgram ? "Update" : "Save"}</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programs.map(p => (
                <TableRow key={p.id}>
                  <TableCell>{p.code}</TableCell>
                  <TableCell className="flex items-center gap-2"><BookOpen size={16} />{p.name}</TableCell>
                  <TableCell>{p.department?.name || "-"}</TableCell>
                  <TableCell>{p.duration_year} Years</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" onClick={() => {
                      setEditProgram(true);
                      setProgramForm(p);
                      setOpenProgram(true);
                    }}>
                      <Edit2 size={16} />
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-600"
                      onClick={() => removeProgram(p.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ================= BRANCHES ================= */}
        <TabsContent value="branches" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openBranch} onOpenChange={setOpenBranch}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Branch</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader><DialogTitle>Add Branch</DialogTitle></DialogHeader>

                <Label>Program</Label>
                <Select value={branchForm.program_id}
                  onValueChange={(v) => {
                    setBranchForm({ ...branchForm, program_id: v });
                    loadFilteredBranches(Number(v));
                  }}>
                  <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                  <SelectContent>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.department?.name || "No Dept"})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input placeholder="Branch Name" value={branchForm.name}
                  onChange={e => setBranchForm({ ...branchForm, name: e.target.value })} />
                <Input placeholder="Code" value={branchForm.code}
                  onChange={e => setBranchForm({ ...branchForm, code: e.target.value })} />

                <DialogFooter><Button onClick={saveBranch}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Program</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allBranches.map((b: any) => (
                <TableRow key={b.id}>
                  <TableCell>{b.code}</TableCell>
                  <TableCell className="flex items-center gap-2"><GitBranch size={16} />{b.name}</TableCell>
                  <TableCell>{b.program?.name || "-"} ({b.program?.department?.name || "-"})</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="text-red-600"
                      onClick={() => removeBranch(b.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        {/* ================= SEMESTERS ================= */}
        <TabsContent value="semesters" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={openSemester} onOpenChange={setOpenSemester}>
              <DialogTrigger asChild>
                <Button><Plus className="mr-2 h-4 w-4" /> Add Semester</Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader><DialogTitle>Add Semester</DialogTitle></DialogHeader>

                <Label>Program</Label>
                <Select value={semesterForm.program_id}
                  onValueChange={(v) => {
                    setSemesterForm({ ...semesterForm, program_id: v });
                    loadFilteredBranches(Number(v));
                  }}>
                  <SelectTrigger><SelectValue placeholder="Select Program" /></SelectTrigger>
                  <SelectContent>
                    {programs.map(p => (
                      <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.department?.name || "No Dept"})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Label>Branch</Label>
                <Select value={semesterForm.branch_id}
                  onValueChange={(v) => setSemesterForm({ ...semesterForm, branch_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Branch" /></SelectTrigger>
                  <SelectContent>
                    {filteredBranches.map((b: any) => (
                      <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input type="number" placeholder="Semester No"
                  value={semesterForm.semester_number}
                  onChange={e => setSemesterForm({ ...semesterForm, semester_number: e.target.value })} />
                <Input placeholder="Label"
                  value={semesterForm.label}
                  onChange={e => setSemesterForm({ ...semesterForm, label: e.target.value })} />

                <DialogFooter><Button onClick={saveSemester}>Save</Button></DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Program</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allSemesters.map((s: any) => (
                <TableRow key={s.id}>
                  <TableCell>{s.semester_number}</TableCell>
                  <TableCell className="flex items-center gap-2"><Calendar size={16} />{s.label}</TableCell>
                  <TableCell>{s.program?.name || "-"} ({s.program?.department?.name || "-"})</TableCell>
                  <TableCell className="text-right">
                    <Button size="icon" variant="ghost" className="text-red-600"
                      onClick={() => removeSemester(s.id)}>
                      <Trash2 size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

      </Tabs>
    </div>
  );
}
