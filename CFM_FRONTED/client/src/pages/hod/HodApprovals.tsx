import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, FileText, Eye, RefreshCw, Send, RotateCcw, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { authFetch } from "@/utils/authFetch";

interface PendingApproval {
  id: number;
  courseFileId: number;
  courseCode: string;
  courseTitle: string;
  teacherName: string;
  academicYear: string;
  section: string;
  status: string;
  forwardedBy?: string;
  forwardedAt?: string;
  subjectHeadComment?: string;
}

export default function HodApprovalsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<PendingApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Dialog states
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showReturnDialog, setShowReturnDialog] = useState(false);
  const [selectedApproval, setSelectedApproval] = useState<PendingApproval | null>(null);
  const [comment, setComment] = useState("");

  useEffect(() => {
    loadPendingApprovals();
  }, []);

  const loadPendingApprovals = async () => {
    setLoading(true);
    try {
      const res = await authFetch("/api/hod/pending-approvals");
      if (res.ok) {
        const data = await res.json();
        setApprovals(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to load pending approvals:", error);
      toast({
        title: "Error",
        description: "Failed to load pending approvals",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedApproval) return;
    setActionLoading(true);
    try {
      const res = await authFetch(`/api/hod/approvals/${selectedApproval.id}/approve`, {
        method: "POST",
        body: JSON.stringify({ comment: comment || "Approved" }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Course file has been approved" });
        setShowApproveDialog(false);
        setComment("");
        loadPendingApprovals();
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
    if (!selectedApproval) return;
    if (!comment.trim()) {
      toast({
        title: "Error",
        description: "Please provide a reason for returning",
        variant: "destructive",
      });
      return;
    }

    setActionLoading(true);
    try {
      const res = await authFetch(`/api/hod/approvals/${selectedApproval.id}/return`, {
        method: "POST",
        body: JSON.stringify({ comment }),
      });

      if (res.ok) {
        toast({ title: "Success", description: "Course file returned to teacher" });
        setShowReturnDialog(false);
        setComment("");
        loadPendingApprovals();
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

  const openApproveDialog = (approval: PendingApproval) => {
    setSelectedApproval(approval);
    setComment("");
    setShowApproveDialog(true);
  };

  const openReturnDialog = (approval: PendingApproval) => {
    setSelectedApproval(approval);
    setComment("");
    setShowReturnDialog(true);
  };

  const handleReview = (approval: PendingApproval) => {
    navigate(`/hod/review/${approval.id}`);
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
          <p className="text-muted-foreground mt-1">Review and approve course files forwarded by Subject Heads.</p>
        </div>
        <Button variant="outline" onClick={loadPendingApprovals}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Awaiting Review</CardTitle>
          <CardDescription>
            {approvals.length === 0
              ? "No pending approvals. Great job!"
              : `There are ${approvals.length} files pending your approval.`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <p className="text-xl font-medium">All caught up!</p>
              <p className="text-sm mt-1">No course files pending approval.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Course</TableHead>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Academic Year</TableHead>
                  <TableHead>Section</TableHead>
                  <TableHead>Forwarded By</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{item.courseCode}</p>
                        <p className="text-sm text-muted-foreground">{item.courseTitle}</p>
                      </div>
                    </TableCell>
                    <TableCell>{item.teacherName}</TableCell>
                    <TableCell>{item.academicYear}</TableCell>
                    <TableCell>{item.section || "-"}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm">{item.forwardedBy || "Subject Head"}</p>
                        {item.forwardedAt && (
                          <p className="text-xs text-muted-foreground">
                            {new Date(item.forwardedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleReview(item)}>
                          <Eye className="mr-2 h-4 w-4" /> Review
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openApproveDialog(item)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                          onClick={() => openReturnDialog(item)}
                        >
                          <RotateCcw className="mr-2 h-4 w-4" /> Return
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
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Approve Course File
            </DialogTitle>
            <DialogDescription>
              Approve {selectedApproval?.courseCode} - {selectedApproval?.courseTitle}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">
                This will give final approval to this course file. The teacher will be notified of the approval.
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
              disabled={actionLoading}
            >
              {actionLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle className="h-4 w-4 mr-2" />
              )}
              Approve
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
            <DialogDescription>
              Return {selectedApproval?.courseCode} - {selectedApproval?.courseTitle} for corrections
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
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
