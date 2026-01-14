import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/utils/authFetch";
import { FileViewerModal } from "@/components/FileViewerModal";
import {
    ArrowLeft,
    FileText,
    XCircle,
    CheckCircle,
    Download,
    FolderOpen,
    Eye,
    ChevronDown,
    ChevronRight,
    RefreshCw,
    RotateCcw,
} from "lucide-react";

/* =======================
   TYPES
======================= */

interface CourseFileDetails {
    id: number;
    courseCode: string;
    courseTitle: string;
    teacherName: string;
    academicYear: string;
    status: string;
    submittedDate: string;
    section: string;
}

interface DocumentDto {
    id: number;
    fileName: string;
    fileSize: number;
    versionNo: number;
    uploadedAt: string;
}

interface HeadingNode {
    id: number;
    title: string;
    orderIndex: number;
    documents: DocumentDto[];
    children: HeadingNode[];
}

/* =======================
   COMPONENT
======================= */

export default function HodCourseReviewPage() {
    const { courseFileId } = useParams<{ courseFileId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [courseFile, setCourseFile] = useState<CourseFileDetails | null>(null);
    const [headings, setHeadings] = useState<HeadingNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedHeadings, setExpandedHeadings] = useState<Set<number>>(new Set());

    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showReturnDialog, setShowReturnDialog] = useState(false);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // File viewer
    const [viewingFile, setViewingFile] = useState<{ id: number; name: string } | null>(null);

    /* =======================
       LOAD DATA
    ======================= */

    useEffect(() => {
        if (courseFileId) {
            loadCourseFileData(parseInt(courseFileId));
        }
    }, [courseFileId]);

    const loadCourseFileData = async (id: number) => {
        setLoading(true);
        try {
            // Load course file details using the review endpoint
            const statusRes = await authFetch(`/api/review/course-file/${id}`);
            if (statusRes.ok) {
                const data = await statusRes.json();
                setCourseFile({
                    id: data.id,
                    courseCode: data.courseCode || "",
                    courseTitle: data.courseTitle || "",
                    teacherName: data.teacherName || "",
                    academicYear: data.academicYear || "",
                    status: data.status || "PENDING",
                    submittedDate: data.submittedDate || "",
                    section: data.section || "",
                });
            }

            // Load heading tree using the review endpoint
            const treeRes = await authFetch(`/api/review/course-file/${id}/tree`);
            if (treeRes.ok) {
                const tree = await treeRes.json();
                setHeadings(tree || []);
                // Expand all headings by default
                const allIds = new Set<number>();
                const collectIds = (items: HeadingNode[]) => {
                    items.forEach(item => {
                        allIds.add(item.id);
                        if (item.children) collectIds(item.children);
                    });
                };
                collectIds(tree || []);
                setExpandedHeadings(allIds);
            }
        } catch (error) {
            console.error("Failed to load course file:", error);
            toast({
                title: "Error",
                description: "Failed to load course file details",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    /* =======================
       ACTIONS
    ======================= */

    const handleApprove = async () => {
        if (!courseFileId) return;
        setSubmitting(true);

        try {
            const res = await authFetch(`/api/hod/approvals/${courseFileId}/approve`, {
                method: "POST",
                body: JSON.stringify({ comment: comment || "Final approval granted" }),
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Course file has been approved",
                });
                navigate("/hod/approvals");
            } else {
                const error = await res.json();
                throw new Error(error.error || "Failed to approve");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to approve course file",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
            setShowApproveDialog(false);
        }
    };

    const handleReturn = async () => {
        if (!courseFileId || !comment.trim()) {
            toast({
                title: "Required",
                description: "Please provide a reason for returning",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);

        try {
            const res = await authFetch(`/api/hod/approvals/${courseFileId}/return`, {
                method: "POST",
                body: JSON.stringify({ comment }),
            });

            if (res.ok) {
                toast({
                    title: "Returned",
                    description: "Course file has been returned to teacher with feedback",
                });
                navigate("/hod/approvals");
            } else {
                const error = await res.json();
                throw new Error(error.error || "Failed to return");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to return course file",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
            setShowReturnDialog(false);
        }
    };

    const toggleHeading = (id: number) => {
        setExpandedHeadings(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleDownload = async (docId: number, fileName: string) => {
        try {
            const res = await authFetch(`/api/teacher/documents/download/${docId}`);
            if (res.ok) {
                const blob = await res.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                a.remove();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to download file",
                variant: "destructive",
            });
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / 1024 / 1024).toFixed(2) + " MB";
    };

    /* =======================
       RENDER HEADING TREE
    ======================= */

    const renderHeadingTree = (items: HeadingNode[], level = 0) => {
        return items.map((heading) => {
            const isExpanded = expandedHeadings.has(heading.id);
            const hasChildren = heading.children && heading.children.length > 0;
            const hasDocuments = heading.documents && heading.documents.length > 0;

            return (
                <div key={heading.id} className="border-l-2 border-gray-200 ml-2">
                    {/* Heading row */}
                    <div
                        className={`flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer ${level === 0 ? 'bg-gray-50' : ''}`}
                        style={{ paddingLeft: level * 16 + 8 }}
                        onClick={() => toggleHeading(heading.id)}
                    >
                        {(hasChildren || hasDocuments) ? (
                            isExpanded ? (
                                <ChevronDown className="h-4 w-4 text-gray-500" />
                            ) : (
                                <ChevronRight className="h-4 w-4 text-gray-500" />
                            )
                        ) : (
                            <div className="w-4" />
                        )}
                        <FolderOpen className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-sm">{heading.title}</span>
                        {hasDocuments && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                                {heading.documents.length} files
                            </Badge>
                        )}
                    </div>

                    {/* Documents */}
                    {isExpanded && hasDocuments && (
                        <div className="ml-8 space-y-1 pb-2">
                            {heading.documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-2 bg-white border rounded-lg mx-2 hover:shadow-sm transition-shadow"
                                >
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-4 w-4 text-orange-500" />
                                        <div>
                                            <p className="text-sm font-medium">{doc.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {formatFileSize(doc.fileSize)} • v{doc.versionNo}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setViewingFile({ id: doc.id, name: doc.fileName });
                                            }}
                                            title="View"
                                        >
                                            <Eye className="h-3.5 w-3.5 text-blue-600" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDownload(doc.id, doc.fileName);
                                            }}
                                            title="Download"
                                        >
                                            <Download className="h-3.5 w-3.5 text-blue-600" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Child headings */}
                    {isExpanded && hasChildren && (
                        <div className="ml-4">
                            {renderHeadingTree(heading.children, level + 1)}
                        </div>
                    )}
                </div>
            );
        });
    };

    /* =======================
       UI
    ======================= */

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    const canTakeAction = courseFile?.status === "UNDER_REVIEW_HOD";

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold">Course File Review</h1>
                        <p className="text-muted-foreground">
                            {courseFile?.courseCode} - {courseFile?.courseTitle}
                        </p>
                    </div>
                </div>

                {canTakeAction && (
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            className="text-orange-600 border-orange-200 hover:bg-orange-50"
                            onClick={() => setShowReturnDialog(true)}
                        >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Return
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setShowApproveDialog(true)}
                        >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Approve
                        </Button>
                    </div>
                )}
            </div>

            {/* COURSE INFO */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Course File Details
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Teacher</Label>
                            <p className="font-medium">{courseFile?.teacherName || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Academic Year</Label>
                            <p className="font-medium">{courseFile?.academicYear || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Section</Label>
                            <p className="font-medium">{courseFile?.section || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Submitted On</Label>
                            <p className="font-medium">
                                {courseFile?.submittedDate
                                    ? new Date(courseFile.submittedDate).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Status</Label>
                            <Badge
                                variant="outline"
                                className={
                                    courseFile?.status === "UNDER_REVIEW_HOD" ? "bg-blue-100 text-blue-700" :
                                        courseFile?.status === "APPROVED" ? "bg-green-100 text-green-700" :
                                            "bg-gray-100"
                                }
                            >
                                {courseFile?.status?.replace(/_/g, " ") || "PENDING"}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* HEADING TREE */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <FolderOpen className="h-5 w-5" />
                        Course File Structure
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {headings.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                            <FolderOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
                            <p>No headings or documents found in this course file.</p>
                        </div>
                    ) : (
                        <div className="border rounded-lg overflow-hidden">
                            {renderHeadingTree(headings)}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* APPROVE DIALOG */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            Approve Course File
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-sm text-green-800">
                                This will grant final approval to this course file. The teacher will be notified.
                            </p>
                        </div>
                        <div>
                            <Label>Comments (Optional)</Label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add any comments..."
                                rows={3}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleApprove}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    Approving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* RETURN DIALOG */}
            <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-orange-600" />
                            Return to Teacher
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please provide feedback so the teacher can make necessary corrections.
                        </p>
                        <div>
                            <Label>Reason for Return *</Label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Enter feedback for the teacher..."
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            onClick={handleReturn}
                            disabled={submitting || !comment.trim()}
                        >
                            {submitting ? "Returning..." : "Return to Teacher"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* FILE VIEWER MODAL */}
            {viewingFile && (
                <FileViewerModal
                    isOpen={!!viewingFile}
                    onClose={() => setViewingFile(null)}
                    fileId={String(viewingFile.id)}
                    fileName={viewingFile.name}
                />
            )}
        </div>
    );
}
