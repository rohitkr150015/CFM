
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: string;
  change: string;
  icon: LucideIcon;
  color: string;
}

export function KPICard({ label, value, change, icon: Icon, color }: KPICardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <h3 className="text-2xl font-bold mt-2">{value}</h3>
          </div>
          <div className={cn("p-3 rounded-full bg-opacity-10", color.replace("text-", "bg-"))}>
            <Icon className={cn("w-6 h-6", color)} />
          </div>
        </div>
        <div className="mt-4 flex items-center text-sm">
          <span className="text-green-600 font-medium">{change}</span>
        </div>
      </CardContent>
    </Card>
  );
}
