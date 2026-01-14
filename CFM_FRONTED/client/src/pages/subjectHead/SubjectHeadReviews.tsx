import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/utils/authFetch";
import {
    Clock,
    Eye,
    Send,
    RotateCcw,
    FileCheck,
    RefreshCw,
    AlertCircle,
} from "lucide-react";

interface PendingReview {
    id: number;
    courseFileId: number;
    courseCode: string;
    courseTitle: string;
    teacherName: string;
    academicYear: string;
    section: string;
    status: string;
    submittedDate: string;
}

export default function SubjectHeadReviewsPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [pendingReviews, setPendingReviews] = useState<PendingReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Dialog states
    const [showApproveDialog, setShowApproveDialog] = useState(false);
    const [showReturnDialog, setShowReturnDialog] = useState(false);
    const [selectedReview, setSelectedReview] = useState<PendingReview | null>(null);
    const [comment, setComment] = useState("");

    useEffect(() => {
        loadPendingReviews();
    }, []);

    const loadPendingReviews = async () => {
        setLoading(true);
        try {
            const res = await authFetch("/api/subject-head/pending-approvals");
            if (res.ok) {
                const data = await res.json();
                setPendingReviews(Array.isArray(data) ? data : []);
            }
        } catch (error) {
            console.error("Failed to load pending reviews:", error);
            toast({
                title: "Error",
                description: "Failed to load pending reviews",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!selectedReview) return;
        setActionLoading(true);
        try {
            const res = await authFetch(`/api/subject-head/approvals/${selectedReview.id}/approve`, {
                method: "POST",
                body: JSON.stringify({ comment: comment || "Forwarded to HOD for final approval" }),
            });

            if (res.ok) {
                toast({ title: "Success", description: "Course file forwarded to HOD" });
                setShowApproveDialog(false);
                setComment("");
                loadPendingReviews();
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
            setActionLoading(false);
        }
    };

    const handleReturn = async () => {
        if (!selectedReview) return;
        if (!comment.trim()) {
            toast({
                title: "Error",
                description: "Please provide a comment explaining the issues",
                variant: "destructive",
            });
            return;
        }

        setActionLoading(true);
        try {
            const res = await authFetch(`/api/subject-head/approvals/${selectedReview.id}/return`, {
                method: "POST",
                body: JSON.stringify({ comment }),
            });

            if (res.ok) {
                toast({ title: "Success", description: "Course file returned to teacher" });
                setShowReturnDialog(false);
                setComment("");
                loadPendingReviews();
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
            setActionLoading(false);
        }
    };

    const openApproveDialog = (review: PendingReview) => {
        setSelectedReview(review);
        setComment("");
        setShowApproveDialog(true);
    };

    const openReturnDialog = (review: PendingReview) => {
        setSelectedReview(review);
        setComment("");
        setShowReturnDialog(true);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Pending Reviews</h1>
                    <p className="text-muted-foreground mt-1">
                        Review and approve submitted course files
                    </p>
                </div>
                <Button onClick={loadPendingReviews} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                </Button>
            </div>

            {/* Pending Reviews */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-orange-500" />
                            Course Files Awaiting Review
                        </span>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                            {pendingReviews.length} Pending
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {pendingReviews.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <FileCheck className="h-16 w-16 mx-auto mb-4 text-green-500" />
                            <p className="text-xl font-medium">All caught up!</p>
                            <p className="text-sm mt-1">No pending course files to review.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Course</TableHead>
                                    <TableHead>Teacher</TableHead>
                                    <TableHead>Academic Year</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingReviews.map((review) => (
                                    <TableRow key={review.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{review.courseCode}</p>
                                                <p className="text-sm text-muted-foreground">{review.courseTitle}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{review.teacherName}</TableCell>
                                        <TableCell>{review.academicYear}</TableCell>
                                        <TableCell>{review.section || "-"}</TableCell>
                                        <TableCell>
                                            {review.submittedDate
                                                ? new Date(review.submittedDate).toLocaleDateString()
                                                : "-"}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 justify-end">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => navigate(`/subject-head/review/${review.id}`)}
                                                >
                                                    <Eye className="h-4 w-4 mr-1" />
                                                    Review
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="default"
                                                    className="bg-green-600 hover:bg-green-700"
                                                    onClick={() => openApproveDialog(review)}
                                                >
                                                    <Send className="h-4 w-4 mr-1" />
                                                    Forward
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-orange-600 border-orange-300 hover:bg-orange-50"
                                                    onClick={() => openReturnDialog(review)}
                                                >
                                                    <RotateCcw className="h-4 w-4 mr-1" />
                                                    Return
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Approve Dialog */}
            <Dialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Forward to HOD</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            You are forwarding{" "}
                            <span className="font-medium text-foreground">
                                {selectedReview?.courseCode} - {selectedReview?.courseTitle}
                            </span>{" "}
                            to HOD for final approval.
                        </p>
                        <Textarea
                            placeholder="Add a comment (optional)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowApproveDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-green-600 hover:bg-green-700"
                            onClick={handleApprove}
                            disabled={actionLoading}
                        >
                            {actionLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <Send className="h-4 w-4 mr-2" />
                            )}
                            Forward to HOD
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Return Dialog */}
            <Dialog open={showReturnDialog} onOpenChange={setShowReturnDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-orange-600">
                            <AlertCircle className="h-5 w-5" />
                            Return to Teacher
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <p className="text-sm text-muted-foreground">
                            You are returning{" "}
                            <span className="font-medium text-foreground">
                                {selectedReview?.courseCode} - {selectedReview?.courseTitle}
                            </span>{" "}
                            to the teacher for corrections.
                        </p>
                        <Textarea
                            placeholder="Explain what needs to be corrected (required)..."
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            className="border-orange-200 focus:border-orange-400"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowReturnDialog(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="outline"
                            className="text-orange-600 border-orange-300 hover:bg-orange-50"
                            onClick={handleReturn}
                            disabled={actionLoading || !comment.trim()}
                        >
                            {actionLoading ? (
                                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <RotateCcw className="h-4 w-4 mr-2" />
                            )}
                            Return to Teacher
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
