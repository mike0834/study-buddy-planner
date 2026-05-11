import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  progress?: number;
  accent?: "primary" | "success" | "warning" | "accent";
}

const accentMap: Record<string, string> = {
  primary: "from-primary/15 to-primary/5 text-primary",
  success: "from-success/15 to-success/5 text-success",
  warning: "from-warning/15 to-warning/5 text-warning",
  accent: "from-accent/15 to-accent/5 text-accent",
};

export const StatCard = ({ title, value, subtitle, icon: Icon, progress, accent = "primary" }: Props) => {
  return (
    <Card className="p-5 shadow-card overflow-hidden relative">
      <div className={`absolute inset-0 bg-gradient-to-br ${accentMap[accent]} opacity-60 pointer-events-none`} />
      <div className="relative">
        <div className="flex items-start justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <div className={`p-2 rounded-lg bg-background/70 ${accentMap[accent].split(" ").pop()}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
        <div className="text-3xl font-bold mb-1">{value}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {progress !== undefined && <Progress value={progress} className="h-1.5 mt-3" />}
      </div>
    </Card>
  );
};
