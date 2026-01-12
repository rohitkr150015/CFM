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
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/utils/authFetch";
import { getHeadingTree, HeadingTreeDto } from "@/api/headingApi";
import {
    ArrowLeft,
    FileText,
    CheckCircle,
    XCircle,
    Send,
    Download,
    MessageSquare,
    FolderOpen,
    File,
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
}

/* =======================
   COMPONENT
======================= */

export default function SubjectHeadCourseReviewPage() {
    const { courseFileId } = useParams<{ courseFileId: string }>();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [courseFile, setCourseFile] = useState<CourseFileDetails | null>(null);
    const [headings, setHeadings] = useState<HeadingTreeDto[]>([]);
    const [loading, setLoading] = useState(true);

    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    /* =======================
       LOAD DATA
    ======================= */

    useEffect(() => {
        if (courseFileId) {
            loadCourseFileData(parseInt(courseFileId));
        }
    }, [courseFileId]);

    const loadCourseFileData = async (id: number) => {
        try {
            // Load course file details
            const res = await authFetch(`/api/course-file/${id}`);
            if (res.ok) {
                const data = await res.json();
                setCourseFile(data);
            }

            // Load heading tree
            const tree = await getHeadingTree(id);
            setHeadings(tree);
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
            const res = await authFetch(`/api/approval/${courseFileId}/forward`, {
                method: "POST",
                body: JSON.stringify({ comment }),
            });

            if (res.ok) {
                toast({
                    title: "Success",
                    description: "Course file forwarded to HOD for approval",
                });
                navigate("/subject-head/dashboard");
            } else {
                throw new Error("Failed to forward");
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to forward course file",
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
            const res = await authFetch(`/api/approval/${courseFileId}/reject`, {
                method: "POST",
                body: JSON.stringify({ comment }),
            });

            if (res.ok) {
                toast({
                    title: "Rejected",
                    description: "Course file has been rejected with feedback",
                });
                navigate("/subject-head/dashboard");
            } else {
                throw new Error("Failed to reject");
            }
        } catch {
            toast({
                title: "Error",
                description: "Failed to reject course file",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
            setShowRejectDialog(false);
        }
    };

    /* =======================
       RENDER HEADING TREE
    ======================= */

    const renderHeadingTree = (items: HeadingTreeDto[], level = 0) => {
        return items.map((heading) => (
            <AccordionItem key={heading.id} value={`heading-${heading.id}`}>
                <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="h-4 w-4 text-blue-500" />
                        <span style={{ marginLeft: level * 16 }}>{heading.title}</span>
                        {heading.documents?.length > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {heading.documents.length} files
                            </Badge>
                        )}
                    </div>
                </AccordionTrigger>
                <AccordionContent>
                    {/* Documents */}
                    {heading.documents?.length > 0 && (
                        <div className="space-y-2 mb-4 pl-6">
                            {heading.documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
                                >
                                    <div className="flex items-center gap-2">
                                        <File className="h-4 w-4 text-gray-500" />
                                        <div>
                                            <p className="text-sm font-medium">{doc.fileName}</p>
                                            <p className="text-xs text-muted-foreground">
                                                v{doc.versionNo} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="ghost">
                                        <Download className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Child headings */}
                    {heading.children?.length > 0 && (
                        <div className="pl-4">
                            <Accordion type="multiple">
                                {renderHeadingTree(heading.children, level + 1)}
                            </Accordion>
                        </div>
                    )}
                </AccordionContent>
            </AccordionItem>
        ));
    };

    /* =======================
       UI
    ======================= */

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

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

                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setShowRejectDialog(true)}
                    >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                    </Button>
                    <Button
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => setShowApproveDialog(true)}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        Forward to HOD
                    </Button>
                </div>
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
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <Label className="text-muted-foreground">Teacher</Label>
                            <p className="font-medium">{courseFile?.teacherName || "N/A"}</p>
                        </div>
                        <div>
                            <Label className="text-muted-foreground">Academic Year</Label>
                            <p className="font-medium">{courseFile?.academicYear || "N/A"}</p>
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
                            <Badge variant="outline" className="mt-1">
                                {courseFile?.status || "PENDING"}
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
                            <FolderOpen className="h-12 w-12 mx-auto mb-3" />
                            <p>No headings or documents found in this course file.</p>
                        </div>
                    ) : (
                        <Accordion type="multiple" className="w-full">
                            {renderHeadingTree(headings)}
                        </Accordion>
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
                            {submitting ? "Forwarding..." : "Forward to HOD"}
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
                            Reject Course File
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Please provide feedback so the teacher can make necessary corrections.
                        </p>
                        <div>
                            <Label>Reason for Rejection *</Label>
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
                            {submitting ? "Rejecting..." : "Reject"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
