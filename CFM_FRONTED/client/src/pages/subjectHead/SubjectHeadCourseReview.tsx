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
    Send,
    Download,
    FolderOpen,
    File,
    Eye,
    ChevronDown,
    ChevronRight,
    RefreshCw,
    LayoutGrid,
    MessageSquare,
} from "lucide-react";
import { EnhancedCourseFileView } from "@/components/EnhancedCourseFileView";
import { InlineCommentDialog } from "@/components/InlineCommentDialog";

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

export default function SubjectHeadCourseReviewPage() {
    const { courseFileId } = useParams<{ courseFileId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [courseFile, setCourseFile] = useState<CourseFileDetails | null>(null);
    const [headings, setHeadings] = useState<HeadingNode[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedHeadings, setExpandedHeadings] = useState<Set<number>>(new Set());

    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [showEnhancedView, setShowEnhancedView] = useState(false);

    // Comment dialog state
    const [commentTarget, setCommentTarget] = useState<{
        headingId?: number;
        documentId?: number;
        headingTitle?: string;
        fileName?: string;
    } | null>(null);

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

    const handleForward = async () => {
        if (!courseFileId) return;
        setSubmitting(true);

        try {
            const res = await authFetch(`/api/subject-head/approvals/${courseFileId}/approve`, {
                method: "POST",
                body: JSON.stringify({ comment: comment || "Forwarded to HOD for final approval" }),
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Course file forwarded to HOD for approval",
                });
                navigate("/subject-head/reviews");
            } else {
                const error = await res.json();
                throw new Error(error.error || "Failed to forward");
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to forward course file",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
            setShowApproveDialog(false);
        }
    };

    const handleReject = async () => {
        if (!courseFileId || !comment.trim()) {
            toast({
                title: "Required",
                description: "Please provide a reason for rejection",
                variant: "destructive",
            });
            return;
        }

        setSubmitting(true);

        try {
            const res = await authFetch(`/api/subject-head/approvals/${courseFileId}/return`, {
                method: "POST",
                body: JSON.stringify({ comment }),
            });

            if (res.ok) {
                toast({
                    title: "Returned",
                    description: "Course file has been returned to teacher with feedback",
                });
                navigate("/subject-head/reviews");
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
            setShowRejectDialog(false);
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
                        <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 ml-auto"
                            onClick={(e) => {
                                e.stopPropagation();
                                setCommentTarget({
                                    headingId: heading.id,
                                    headingTitle: heading.title,
                                });
                            }}
                            title="Add comment"
                        >
                            <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
                        </Button>
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
                                                setCommentTarget({
                                                    headingId: heading.id,
                                                    documentId: doc.id,
                                                    fileName: doc.fileName,
                                                });
                                            }}
                                            title="Comment"
                                        >
                                            <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
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

    const canTakeAction = courseFile?.status === "SUBMITTED";

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
                            className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                            onClick={() => setShowEnhancedView(true)}
                        >
                            <LayoutGrid className="h-4 w-4 mr-2" />
                            View More Structured
                        </Button>
                        <Button
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => setShowRejectDialog(true)}
                        >
                            <XCircle className="h-4 w-4 mr-2" />
                            Return
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => setShowApproveDialog(true)}
                        >
                            <Send className="h-4 w-4 mr-2" />
                            Forward to HOD
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
                                    courseFile?.status === "SUBMITTED" ? "bg-yellow-100 text-yellow-700" :
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

            {/* FORWARD DIALOG */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Send className="h-5 w-5 text-green-600" />
                            Forward to HOD
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            This will forward the course file to the HOD for final approval.
                        </p>
                        <div>
                            <Label>Comments (Optional)</Label>
                            <Textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Add any comments for the HOD..."
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
                            onClick={handleForward}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                                    Forwarding...
                                </>
                            ) : (
                                <>
                                    <Send className="h-4 w-4 mr-2" />
                                    Forward to HOD
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* REJECT DIALOG */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <XCircle className="h-5 w-5 text-red-600" />
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
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
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

            {/* Enhanced Structured View */}
            {showEnhancedView && courseFileId && (
                <EnhancedCourseFileView
                    courseFileId={parseInt(courseFileId)}
                    courseName={`${courseFile?.courseCode} - ${courseFile?.courseTitle}`}
                    courseCode={courseFile?.courseCode || ""}
                    teacherName={courseFile?.teacherName}
                    onClose={() => setShowEnhancedView(false)}
                    useReviewApi={true}
                />
            )}

            {/* Inline Comment Dialog */}
            {commentTarget && courseFileId && (
                <InlineCommentDialog
                    courseFileId={parseInt(courseFileId)}
                    headingId={commentTarget.headingId}
                    documentId={commentTarget.documentId}
                    headingTitle={commentTarget.headingTitle}
                    fileName={commentTarget.fileName}
                    isOpen={!!commentTarget}
                    onClose={() => setCommentTarget(null)}
                />
            )}
        </div>
    );
}
