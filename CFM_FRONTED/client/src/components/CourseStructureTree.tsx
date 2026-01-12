import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { ChevronDown, ChevronRight, Plus, Trash2, Upload, Download, Edit2, Check, X } from "lucide-react";

export interface TreeNode {
  id: string;
  name: string;
  level: number;
  children: TreeNode[];
  files: FileItem[];
  completed: boolean;
}

export interface FileItem {
  id: string;
  name: string;
  size: string;
  date: string;
  versions: number;
}

interface TreeItemProps {
  node: TreeNode;
  onAddChild: (parentId: string) => void;
  onDelete: (nodeId: string) => void;
  onAddFile: (nodeId: string) => void;
  onDeleteFile: (nodeId: string, fileId: string) => void;
}

const TreeItem: React.FC<TreeItemProps> = ({
  node,
  onAddChild,
  onDelete,
  onAddFile,
  onDeleteFile,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(node.name);

  const childCompletion = node.children.length > 0
    ? (node.children.filter(c => c.completed).length / node.children.length) * 100
    : node.files.length > 0 ? 100 : 0;

  const hasChildren = node.children.length > 0;

  return (
    <div className="space-y-2">
      {/* Node Header */}
      <div className="flex items-center gap-2 p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors group">
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-0.5 hover:bg-muted rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}

        <div className="flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="h-7 text-sm"
              />
              <Button size="sm" className="h-7 px-2" onClick={() => setIsEditing(false)}>
                <Check className="h-3 w-3" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2"
                onClick={() => setIsEditing(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{node.name}</span>
                <Badge variant="outline" className="text-[10px]">
                  {node.files.length} files
                </Badge>
              </div>
              {node.children.length > 0 && (
                <div className="mt-1">
                  <Progress value={childCompletion} className="h-1.5" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onAddFile(node.id)}
          >
            <Upload className="h-3.5 w-3.5 text-blue-600" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setIsEditing(true)}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          {node.level < 3 && (
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={() => onAddChild(node.id)}
            >
              <Plus className="h-3.5 w-3.5 text-green-600" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="h-3.5 w-3.5 text-red-600" />
          </Button>
        </div>
      </div>

      {/* Files */}
      {node.files.length > 0 && isExpanded && (
        <div className="ml-6 space-y-2">
          {node.files.map((file) => (
            <div
              key={file.id}
              className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
            >
              <div className="flex-1">
                <p className="font-medium text-xs">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {file.size} • v{file.versions} • {file.date}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <Download className="h-3 w-3" />
                </Button>
                <Button size="icon" variant="ghost" className="h-6 w-6">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-6 w-6"
                  onClick={() => onDeleteFile(node.id, file.id)}
                >
                  <Trash2 className="h-3 w-3 text-red-600" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="ml-6 space-y-2 border-l-2 border-muted pl-2">
          {node.children.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onAddFile={onAddFile}
              onDeleteFile={onDeleteFile}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CourseStructureTreeProps {
  templateName: string;
  courseName: string;
  initialStructure: TreeNode;
  onStructureChange?: (structure: TreeNode) => void;
}

export const CourseStructureTree: React.FC<CourseStructureTreeProps> = ({
  templateName,
  courseName,
  initialStructure,
  onStructureChange,
}) => {
  const [structure, setStructure] = useState(initialStructure);

  const calculateCompletion = (node: TreeNode): number => {
    if (node.files.length > 0) {
      return 100;
    }
    if (node.children.length === 0) {
      return 0;
    }
    const childCompletion = node.children.map(calculateCompletion);
    return childCompletion.reduce((a, b) => a + b, 0) / node.children.length;
  };

  const totalCompletion = calculateCompletion(structure);

  const handleAddFile = (nodeId: string) => {
    const newFile: FileItem = {
      id: Math.random().toString(),
      name: `New_Document_${Date.now()}.pdf`,
      size: "0 KB",
      date: new Date().toLocaleDateString(),
      versions: 1,
    };

    const updateNode = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return { ...node, files: [...node.files, newFile] };
      }
      return {
        ...node,
        children: node.children.map(updateNode),
      };
    };

    const updated = updateNode(structure);
    setStructure(updated);
    onStructureChange?.(updated);
  };

  const handleDeleteFile = (nodeId: string, fileId: string) => {
    const updateNode = (node: TreeNode): TreeNode => {
      if (node.id === nodeId) {
        return {
          ...node,
          files: node.files.filter(f => f.id !== fileId),
        };
      }
      return {
        ...node,
        children: node.children.map(updateNode),
      };
    };

    const updated = updateNode(structure);
    setStructure(updated);
    onStructureChange?.(updated);
  };

  const handleAddChild = (parentId: string) => {
    const newChild: TreeNode = {
      id: Math.random().toString(),
      name: `New Section`,
      level: 2,
      children: [],
      files: [],
      completed: false,
    };

    const updateNode = (node: TreeNode): TreeNode => {
      if (node.id === parentId) {
        return { ...node, children: [...node.children, newChild] };
      }
      return {
        ...node,
        children: node.children.map(updateNode),
      };
    };

    const updated = updateNode(structure);
    setStructure(updated);
    onStructureChange?.(updated);
  };

  const handleDelete = (nodeId: string) => {
    if (nodeId === structure.id) return; // Don't delete root

    const updateNode = (node: TreeNode): TreeNode => {
      return {
        ...node,
        children: node.children
          .filter(c => c.id !== nodeId)
          .map(updateNode),
      };
    };

    const updated = updateNode(structure);
    setStructure(updated);
    onStructureChange?.(updated);
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{courseName}</p>
              <p className="font-semibold">Template: {templateName}</p>
            </div>
            <Badge>{Math.round(totalCompletion)}% Complete</Badge>
          </div>
          <Progress value={totalCompletion} className="h-2" />
        </div>

        <div className="space-y-2">
          <TreeItem
            node={structure}
            onAddChild={handleAddChild}
            onDelete={handleDelete}
            onAddFile={handleAddFile}
            onDeleteFile={handleDeleteFile}
          />
        </div>
      </CardContent>
    </Card>
  );
};
