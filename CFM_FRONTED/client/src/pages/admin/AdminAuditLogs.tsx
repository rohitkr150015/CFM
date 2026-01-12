
import { auditLogs } from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground mt-1">Track system activity and user actions for security and compliance.</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Search logs..." />
        </div>
        <Button variant="outline"><Filter className="mr-2 h-4 w-4"/> Filter</Button>
        <Button variant="outline">Export CSV</Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Actor</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Details</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {auditLogs.map(log => (
                    <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs text-muted-foreground">{log.timestamp}</TableCell>
                        <TableCell className="font-medium">{log.actor}</TableCell>
                        <TableCell>
                            <Badge variant="outline" className={
                                log.action.includes("Deleted") ? "text-red-600 border-red-200 bg-red-50" : 
                                log.action.includes("Approved") ? "text-green-600 border-green-200 bg-green-50" : 
                                "text-blue-600 border-blue-200 bg-blue-50"
                            }>
                                {log.action}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{log.targetType}: {log.targetId}</TableCell>
                        <TableCell className="text-muted-foreground">{log.details}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
      </div>
    </div>
  );
}
