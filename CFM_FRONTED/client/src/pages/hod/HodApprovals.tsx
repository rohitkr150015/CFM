
import { useState } from "react";
import { pendingApprovals } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FileText, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

export default function HodApprovalsPage() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState(pendingApprovals);
  const [selectedFile, setSelectedFile] = useState<any>(null);

  const handleAction = (id: number, action: 'approve' | 'reject') => {
    setApprovals(approvals.filter(a => a.id !== id));
    setSelectedFile(null);
    toast({
      title: action === 'approve' ? "File Approved" : "File Rejected",
      description: `The file has been ${action}d successfully.`,
      variant: action === 'approve' ? "default" : "destructive"
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pending Approvals</h1>
        <p className="text-muted-foreground mt-1">Review and approve course materials uploaded by department faculty.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Awaiting Review</CardTitle>
          <CardDescription>There are {approvals.length} files pending your approval.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File Name</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {approvals.length === 0 ? (
                  <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No pending approvals found. Great job!
                      </TableCell>
                  </TableRow>
              ) : (
                  approvals.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {item.file}
                      </TableCell>
                      <TableCell>{item.teacher}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.course}</Badge>
                      </TableCell>
                      <TableCell>{item.type}</TableCell>
                      <TableCell className="text-muted-foreground">{item.date}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setSelectedFile(item)}>
                            <Eye className="mr-2 h-4 w-4" /> Review
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(item.id, 'approve')}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedFile} onOpenChange={(open) => !open && setSelectedFile(null)}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>Review File</DialogTitle>
                <DialogDescription>Reviewing {selectedFile?.file} from {selectedFile?.teacher}</DialogDescription>
            </DialogHeader>
            <div className="py-6 flex flex-col items-center justify-center bg-muted/30 rounded-lg border border-dashed">
                <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground">Preview not available in mockup mode.</p>
                <p className="text-xs text-muted-foreground mt-1">File Size: {selectedFile?.size}</p>
            </div>
            <DialogFooter className="flex gap-2 sm:justify-between">
                <Button variant="destructive" onClick={() => handleAction(selectedFile.id, 'reject')}>
                    <XCircle className="mr-2 h-4 w-4" /> Reject File
                </Button>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setSelectedFile(null)}>Cancel</Button>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleAction(selectedFile.id, 'approve')}>
                        <CheckCircle className="mr-2 h-4 w-4" /> Approve
                    </Button>
                </div>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
