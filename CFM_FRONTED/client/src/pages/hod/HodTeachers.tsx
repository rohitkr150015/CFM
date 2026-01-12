
import { teacherPerformance } from "@/lib/dummy-data";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MoreHorizontal, Mail, BookOpen } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export default function HodTeachersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Faculty Management</h1>
          <p className="text-muted-foreground mt-1">Overview of department teaching staff and performance.</p>
        </div>
        <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" /> Email Department
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Performance</CardTitle>
          <CardDescription>Activity and student satisfaction metrics.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Teacher Name</TableHead>
                <TableHead>Active Courses</TableHead>
                <TableHead>Total Uploads</TableHead>
                <TableHead>Student Rating</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teacherPerformance.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableCell className="font-medium flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                        <AvatarFallback>{teacher.name.substring(0,2)}</AvatarFallback>
                    </Avatar>
                    {teacher.name}
                  </TableCell>
                  <TableCell>{teacher.courses}</TableCell>
                  <TableCell>{teacher.uploads}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                        <span className="font-bold">{teacher.rating}</span>
                        <span className="text-muted-foreground text-xs">/ 5.0</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                        variant={teacher.status === 'Top Performer' ? 'default' : teacher.status === 'Needs Improvement' ? 'destructive' : 'secondary'}
                        className={teacher.status === 'Top Performer' ? 'bg-green-600 hover:bg-green-700' : ''}
                    >
                        {teacher.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Assign Course</DropdownMenuItem>
                        <DropdownMenuItem className="text-blue-600">View Reports</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
         <Card>
            <CardHeader>
                <CardTitle className="text-lg">Top Performer</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center pt-0">
                <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center mb-4 text-3xl">🏆</div>
                <h3 className="font-bold text-xl">Jane Miller</h3>
                <p className="text-sm text-muted-foreground mb-4">Highest student engagement score (4.9/5)</p>
                <Button variant="outline" size="sm">Send Appreciation</Button>
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle className="text-lg">Most Active</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center pt-0">
                <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center mb-4 text-3xl">📚</div>
                <h3 className="font-bold text-xl">Prof. Sarah Smith</h3>
                <p className="text-sm text-muted-foreground mb-4">Most course materials uploaded (45 files)</p>
                <Button variant="outline" size="sm">View Activity</Button>
            </CardContent>
         </Card>
         <Card>
            <CardHeader>
                <CardTitle className="text-lg">Course Coverage</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center text-center pt-0">
                <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center mb-4 text-3xl">📊</div>
                <h3 className="font-bold text-xl">98%</h3>
                <p className="text-sm text-muted-foreground mb-4">Of department courses have active materials</p>
                <Button variant="outline" size="sm">View Missing</Button>
            </CardContent>
         </Card>
      </div>
    </div>
  );
}
