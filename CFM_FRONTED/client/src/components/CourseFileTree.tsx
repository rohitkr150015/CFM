import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, Download, Eye } from "lucide-react";

export interface HeadingNode {
  id: number;
  title: string;
  parent_heading_id: number | null;
  order_index: number;
  documents: DocumentItem[];
  children?: HeadingNode[];
}

export interface DocumentItem {
  id: number;
  file_name: string;
  file_path: string;
  type: string;
  file_size: number;
  version_no: number;
  uploaded_at: string;
}

interface TreeItemProps {
  node: HeadingNode;
  level: number;
  isReadOnly?: boolean;
}

const TreeItem: React.FC<TreeItemProps> = ({ node, level, isReadOnly = true }) => {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownload = (document: DocumentItem) => {
    console.log("Downloading:", document.file_path);
    alert(`Downloading ${document.file_name}`);
  };

  const handlePreview = (document: DocumentItem) => {
    window.open(document.file_path, '_blank');
  };

  const hasChildren = node.children && node.children.length > 0;
  const hasDocuments = node.documents && node.documents.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 p-3 bg-card border rounded-lg hover:bg-muted/50 transition-colors">
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
          <div className="flex items-center gap-2">
            <span className={`font-medium text-sm ${level === 0 ? 'text-base' : ''}`}>
              {node.title}
            </span>
            {hasDocuments && (
              <Badge variant="outline" className="text-[10px]">
                {node.documents.length} {node.documents.length === 1 ? 'file' : 'files'}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {hasDocuments && isExpanded && (
        <div className="ml-6 space-y-2">
          {node.documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-2 bg-muted/50 rounded-lg text-sm"
            >
              <div className="flex-1">
                <p className="font-medium text-xs">{doc.file_name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(doc.file_size)} • v{doc.version_no} • {new Date(doc.uploaded_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6"
                  onClick={() => handlePreview(doc)}
                  title="Preview"
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="h-6 w-6"
                  onClick={() => handleDownload(doc)}
                  title="Download"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {hasChildren && isExpanded && (
        <div className="ml-6 space-y-2 border-l-2 border-muted pl-2">
          {node.children!.map((child) => (
            <TreeItem
              key={child.id}
              node={child}
              level={level + 1}
              isReadOnly={isReadOnly}
            />
          ))}
        </div>
      )}
    </div>
  );
};

interface CourseFileTreeProps {
  courseFileId: number;
  courseCode: string;
  courseTitle: string;
  headings: HeadingNode[];
  isReadOnly?: boolean;
}

export const CourseFileTree: React.FC<CourseFileTreeProps> = ({
  courseFileId,
  courseCode,
  courseTitle,
  headings,
  isReadOnly = true,
}) => {
  const buildTree = (headings: HeadingNode[]): HeadingNode[] => {
    const map = new Map<number, HeadingNode>();
    const roots: HeadingNode[] = [];

    headings.forEach(heading => {
      map.set(heading.id, { ...heading, children: [] });
    });

    headings.forEach(heading => {
      const node = map.get(heading.id)!;
      if (heading.parent_heading_id === null) {
        roots.push(node);
      } else {
        const parent = map.get(heading.parent_heading_id);
        if (parent) {
          if (!parent.children) parent.children = [];
          parent.children.push(node);
        }
      }
    });

    const sortByOrder = (nodes: HeadingNode[]): HeadingNode[] => {
      return nodes
        .sort((a, b) => a.order_index - b.order_index)
        .map(node => ({
          ...node,
          children: node.children ? sortByOrder(node.children) : []
        }));
    };

    return sortByOrder(roots);
  };

  const treeStructure = buildTree(headings);
  const totalDocuments = headings.reduce((sum, h) => sum + (h.documents?.length || 0), 0);

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{courseCode}</p>
              <p className="font-semibold">{courseTitle}</p>
            </div>
            <Badge variant="outline">{totalDocuments} {totalDocuments === 1 ? 'document' : 'documents'}</Badge>
          </div>
        </div>

        <div className="space-y-2">
          {treeStructure.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No headings found for this course file.</p>
            </div>
          ) : (
            treeStructure.map((root) => (
              <TreeItem
                key={root.id}
                node={root}
                level={0}
                isReadOnly={isReadOnly}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

