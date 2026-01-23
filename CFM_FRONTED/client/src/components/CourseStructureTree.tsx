import { useState, useRef } from "react";
import {
  ChevronRight,
  ChevronDown,
  FileText,
  FolderOpen,
  Plus,
  Upload,
  MoreVertical,
  Trash2,
  Edit2,
  Download,
  X,
  Loader2,
  Eye,
  ExternalLink,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { authFetch } from "@/utils/authFetch";
import { useToast } from "@/hooks/use-toast";
import { FileViewerModal } from "./FileViewerModal";

export interface CourseFile {
  id: string;
  name: string;
  size?: string;
  date?: string;
  version?: number;
}

export interface TreeNode {
  id: string;
  name: string;
  level: number;
  children: TreeNode[];
  files: CourseFile[];
  completed: boolean;
  isTemplateNode?: boolean;
}

interface CourseStructureTreeProps {
  templateName?: string;
  courseName?: string;
  courseCode?: string;
  courseFileId?: number | null;
  initialStructure: TreeNode;
  onStructureChange: (structure: TreeNode) => void;
  onRefresh?: () => void;
  onOpenComment?: (target: { headingId?: number; documentId?: number; headingTitle?: string; fileName?: string }) => void;
}

const calculateCompletion = (node: TreeNode): number => {
  let totalSections = 0;
  let completedSections = 0;

  const traverse = (n: TreeNode) => {
    totalSections++;
    if (n.files.length > 0 || n.completed) {
      completedSections++;
    }
    n.children.forEach(traverse);
  };

  traverse(node);
  return totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;
};

const countFiles = (node: TreeNode): number => {
  let count = node.files.length;
  node.children.forEach(child => {
    count += countFiles(child);
  });
  return count;
};

export function CourseStructureTree({
  templateName,
  courseCode,
  courseFileId,
  initialStructure,
  onStructureChange,
  onRefresh
}: CourseStructureTreeProps) {
  const [data, setData] = useState<TreeNode>(initialStructure);
  const { toast } = useToast();

  const completion = calculateCompletion(data);
  const totalFiles = countFiles(data);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gradient-to-r from-slate-50 to-blue-50/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Template: {templateName || "Course Syllabus Template"}</p>
            </div>
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium",
                completion >= 75 ? "bg-green-100 text-green-700" :
                  completion >= 50 ? "bg-blue-100 text-blue-700" :
                    "bg-orange-100 text-orange-700"
              )}
            >
              {completion}% Complete
            </Badge>
          </div>
        </div>

        <div className="p-4">
          <RootSectionNode
            node={data}
            courseCode={courseCode || ""}
            courseFileId={courseFileId || null}
            onRefresh={onRefresh}
          />
        </div>
      </div>
    </div>
  );
}

interface RootSectionNodeProps {
  node: TreeNode;
  courseCode: string;
  courseFileId: number | null;
  onRefresh?: () => void;
}

function RootSectionNode({ node, courseCode, courseFileId, onRefresh }: RootSectionNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const completion = calculateCompletion(node);
  const fileCount = countFiles(node);

  return (
    <div className="space-y-2">
      <div
        className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 cursor-pointer hover:border-blue-200 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-blue-100">
          {isOpen ? <ChevronDown className="h-4 w-4 text-blue-600" /> : <ChevronRight className="h-4 w-4 text-blue-600" />}
        </Button>

        <FolderOpen className="h-5 w-5 text-blue-600" />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-blue-900">{node.name}</span>
            <Badge variant="outline" className="text-xs bg-white">{fileCount} files</Badge>
          </div>
        </div>

        <div className="w-48 hidden md:block">
          <Progress value={completion} className="h-2" />
        </div>
      </div>

      {isOpen && (
        <div className="ml-4 space-y-2 border-l-2 border-blue-100 pl-4">
          {node.children.map(child => (
            <SectionNode
              key={child.id}
              node={child}
              courseCode={courseCode}
              courseFileId={courseFileId}
              onRefresh={onRefresh}
              depth={1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SectionNodeProps {
  node: TreeNode;
  courseCode: string;
  courseFileId: number | null;
  onRefresh?: () => void;
  depth: number;
}

function SectionNode({ node, courseCode, courseFileId, onRefresh, depth }: SectionNodeProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);
  const [isAddingSub, setIsAddingSub] = useState(false);
  const [newSubName, setNewSubName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const hasChildren = node.children.length > 0 || node.files.length > 0;
  const fileCount = countFiles(node);
  const completion = calculateCompletion(node);

  const handleSaveEdit = async () => {
    if (!editName.trim() || node.isTemplateNode) return;

    setIsLoading(true);
    try {
      const res = await authFetch(`/api/teacher/headings/${node.id}`, {
        method: 'PUT',
        body: JSON.stringify({ title: editName.trim() })
      });

      if (res.ok) {
        toast({ title: "Success", description: "Section renamed" });
        onRefresh?.();
      } else {
        throw new Error("Failed to rename");
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to rename section", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsEditing(false);
    }
  };

  const handleAddSub = async () => {
    if (!newSubName.trim() || !courseFileId) return;

    setIsLoading(true);
    try {
      const res = await authFetch('/api/teacher/headings', {
        method: 'POST',
        body: JSON.stringify({
          courseFileId: courseFileId,
          parentHeadingId: Number(node.id),
          title: newSubName.trim(),
          orderIndex: node.children.length + 1
        })
      });

      if (res.ok) {
        toast({ title: "Success", description: "Sub-section added" });
        onRefresh?.();
      } else {
        throw new Error("Failed to add");
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to add sub-section", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setNewSubName("");
      setIsAddingSub(false);
      setIsOpen(true);
    }
  };

  const handleDelete = async () => {
    if (node.isTemplateNode) return;

    setIsLoading(true);
    try {
      const res = await authFetch(`/api/teacher/headings/${node.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast({ title: "Success", description: "Section deleted" });
        onRefresh?.();
      } else {
        throw new Error("Failed to delete");
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete section", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('headingId', node.id);
      formData.append('courseCode', courseCode || 'UNKNOWN');

      // Get token from courseflow_auth storage
      const authStr = localStorage.getItem('courseflow_auth');
      const auth = authStr ? JSON.parse(authStr) : null;
      const token = auth?.token;

      if (!token) {
        throw new Error("Not authenticated");
      }

      const res = await fetch('http://localhost:8080/api/teacher/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        toast({ title: "Success", description: `File "${file.name}" uploaded` });
        onRefresh?.();
      } else {
        const errorData = await res.text();
        console.error("Upload error:", res.status, errorData);
        throw new Error(errorData || "Upload failed");
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to upload file", variant: "destructive" });
    } finally {
      setIsLoading(false);
      e.target.value = '';
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setIsLoading(true);
    try {
      const res = await authFetch(`/api/teacher/documents/${fileId}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        toast({ title: "Success", description: "File deleted" });
        onRefresh?.();
      } else {
        throw new Error("Delete failed");
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to delete file", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadFile = async (fileId: string, fileName: string) => {
    try {
      const authStr = localStorage.getItem('courseflow_auth');
      const auth = authStr ? JSON.parse(authStr) : null;
      const token = auth?.token;

      const res = await fetch(`http://localhost:8080/api/teacher/documents/download/${fileId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        a.remove();
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to download file", variant: "destructive" });
    }
  };

  const bgColors = [
    "bg-amber-50 border-amber-200 hover:border-amber-300",
    "bg-green-50 border-green-200 hover:border-green-300",
    "bg-purple-50 border-purple-200 hover:border-purple-300",
    "bg-pink-50 border-pink-200 hover:border-pink-300"
  ];
  const bgClass = bgColors[(depth - 1) % bgColors.length];

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip"
      />

      <div className={cn(
        "group flex items-center gap-2 p-3 rounded-lg border transition-all",
        bgClass,
        isLoading && "opacity-50"
      )}>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => setIsOpen(!isOpen)}
          disabled={isLoading}
        >
          {hasChildren ? (
            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <div className="h-2 w-2 rounded-full bg-muted-foreground/30" />
          )}
        </Button>

        <div className="flex-1 flex items-center gap-2">
          {isEditing ? (
            <div className="flex gap-2 items-center">
              <Input
                value={editName}
                onChange={e => setEditName(e.target.value)}
                className="h-8 text-sm max-w-[200px]"
                autoFocus
                onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
              />
              <Button size="sm" variant="default" onClick={handleSaveEdit} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            </div>
          ) : (
            <>
              <span className={cn("font-medium text-sm", node.isTemplateNode && "text-slate-700")}>
                {node.name}
              </span>
              {node.isTemplateNode && (
                <Badge variant="outline" className="text-[10px] h-4 px-1 bg-white border-blue-200 text-blue-600">Template</Badge>
              )}
              {fileCount > 0 && (
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">{fileCount} files</Badge>
              )}
            </>
          )}
        </div>

        {node.children.length > 0 && (
          <div className="w-32 hidden lg:block">
            <Progress value={completion} className="h-1.5" />
          </div>
        )}

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin mr-1" />}

          <Button variant="ghost" size="sm" className="h-7 w-7" onClick={() => fileInputRef.current?.click()} disabled={isLoading} title="Upload File">
            <Upload className="h-3.5 w-3.5 text-blue-600" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7" disabled={isLoading}>
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => { setIsAddingSub(true); setIsOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" /> Add Sub-Section
              </DropdownMenuItem>
              {!node.isTemplateNode && (
                <>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit2 className="h-4 w-4 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={handleDelete}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete Section
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isAddingSub && (
        <div className="ml-8 flex gap-2 items-center p-2 bg-muted/50 rounded-lg border border-dashed">
          <Input
            placeholder="New sub-section name..."
            value={newSubName}
            onChange={e => setNewSubName(e.target.value)}
            className="h-8 text-sm flex-1"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleAddSub()}
          />
          <Button size="sm" onClick={handleAddSub} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsAddingSub(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {isOpen && hasChildren && (
        <div className="ml-6 space-y-1.5 border-l-2 border-muted pl-4">
          {node.files.map(file => (
            <FileItem
              key={file.id}
              file={file}
              onDelete={() => handleDeleteFile(file.id)}
              onDownload={() => handleDownloadFile(file.id, file.name)}
            />
          ))}

          {node.children.map(child => (
            <SectionNode
              key={child.id}
              node={child}
              courseCode={courseCode}
              courseFileId={courseFileId}
              onRefresh={onRefresh}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}



interface FileItemProps {
  file: CourseFile;
  onDelete: () => void;
  onDownload: () => void;
}

function FileItem({ file, onDelete, onDownload }: FileItemProps) {
  const [isViewing, setIsViewing] = useState(false);
  const [showViewOptions, setShowViewOptions] = useState(false);

  const handleOpenInNewTab = () => {
    const authStr = localStorage.getItem('courseflow_auth');
    const auth = authStr ? JSON.parse(authStr) : null;
    const token = auth?.token;

    if (token) {
      // Fetch the file and open in new tab
      fetch(`http://localhost:8080/api/teacher/documents/view/${file.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.blob())
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          window.open(url, '_blank');
        })
        .catch(err => console.error('Error opening file:', err));
    }
    setShowViewOptions(false);
  };

  const handleOpenInside = () => {
    setShowViewOptions(false);
    setIsViewing(true);
  };

  return (
    <>
      <div className="group flex items-center gap-3 p-2.5 rounded-lg bg-white border hover:border-slate-300 hover:shadow-sm transition-all">
        <FileText className="h-4 w-4 text-orange-500 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">
            {file.size} • v{file.version || 1} • {file.date}
          </p>
        </div>

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-7 w-7" onClick={() => setShowViewOptions(true)} title="View">
            <Eye className="h-3.5 w-3.5 text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7" onClick={onDownload} title="Download">
            <Download className="h-3.5 w-3.5 text-blue-600" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={onDelete} title="Delete">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* View Options Dialog */}
      {showViewOptions && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowViewOptions(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full mx-4 animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-2">View Document</h3>
            <p className="text-sm text-muted-foreground mb-5">
              How would you like to view <span className="font-medium text-foreground">{file.name}</span>?
            </p>

            <div className="flex flex-col gap-3">
              <Button
                onClick={handleOpenInside}
                className="w-full justify-start gap-3 h-12"
                variant="outline"
              >
                <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Eye className="h-4 w-4 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Open Inside</p>
                  <p className="text-xs text-muted-foreground">View in resizable modal</p>
                </div>
              </Button>

              <Button
                onClick={handleOpenInNewTab}
                className="w-full justify-start gap-3 h-12"
                variant="outline"
              >
                <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center">
                  <ExternalLink className="h-4 w-4 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Open in New Tab</p>
                  <p className="text-xs text-muted-foreground">Opens in a new browser tab</p>
                </div>
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full mt-4"
              onClick={() => setShowViewOptions(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      <FileViewerModal
        isOpen={isViewing}
        onClose={() => setIsViewing(false)}
        fileId={file.id}
        fileName={file.name}
      />
    </>
  );
}

