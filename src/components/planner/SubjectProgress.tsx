import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { computeSubjectStats } from "@/lib/adaptive";
import { StudyItem } from "@/types/study";

export const SubjectProgress = ({ items }: { items: StudyItem[] }) => {
  const stats = computeSubjectStats(items);
  if (stats.length === 0) return null;
  return (
    <Card className="p-6 shadow-card">
      <h3 className="text-lg font-semibold mb-4">과목별 진도율</h3>
      <div className="space-y-4">
        {stats.map((s) => {
          const pct = s.total ? Math.round((s.completed / s.total) * 100) : 0;
          return (
            <div key={s.subject}>
              <div className="flex justify-between mb-1.5 text-sm">
                <span className="font-medium">{s.subject}</span>
                <span className="text-muted-foreground">
                  {s.completed} / {s.total} · {pct}%
                </span>
              </div>
              <Progress value={pct} className="h-2" />
            </div>
          );
        })}
      </div>
    </Card>
  );
};
