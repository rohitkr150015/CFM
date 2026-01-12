
import { calendarEvents } from "@/lib/dummy-data";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-tight">Department Calendar</h1>
            <p className="text-muted-foreground mt-1">Schedule and upcoming academic events.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="icon"><ChevronLeft className="h-4 w-4"/></Button>
            <span className="font-semibold text-lg px-2">November 2024</span>
            <Button variant="outline" size="icon"><ChevronRight className="h-4 w-4"/></Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
             <Card className="h-[600px]">
                <CardContent className="p-0">
                    <div className="grid grid-cols-7 border-b text-center py-4 font-semibold text-muted-foreground">
                        <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
                    </div>
                    <div className="grid grid-cols-7 h-[540px]">
                        {/* Mock Calendar Grid */}
                        {Array.from({length: 35}).map((_, i) => (
                            <div key={i} className="border-r border-b p-2 min-h-[80px] relative hover:bg-muted/20 transition-colors">
                                <span className={`text-sm ${i < 3 || i > 32 ? 'text-muted-foreground/30' : ''}`}>{i > 2 ? i - 2 : 30 + i}</span>
                                {i === 15 && (
                                    <div className="mt-1 text-[10px] bg-blue-100 text-blue-700 p-1 rounded truncate font-medium">
                                        Faculty Meeting
                                    </div>
                                )}
                                {i === 25 && (
                                    <div className="mt-1 text-[10px] bg-red-100 text-red-700 p-1 rounded truncate font-medium">
                                        Exam Start
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </CardContent>
             </Card>
        </div>

        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {calendarEvents.map(e => (
                        <div key={e.id} className="flex items-start gap-3 pb-4 border-b last:border-0 last:pb-0">
                            <div className="flex flex-col items-center bg-muted rounded-md p-2 w-14">
                                <span className="text-xs font-bold uppercase text-muted-foreground">{new Date(e.date).toLocaleString('default', { month: 'short' })}</span>
                                <span className="text-xl font-bold">{new Date(e.date).getDate()}</span>
                            </div>
                            <div>
                                <h4 className="font-medium">{e.title}</h4>
                                <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-[10px]">{e.type}</Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3"/> All Day
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
