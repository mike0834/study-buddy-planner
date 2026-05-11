import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Clock, Flame } from "lucide-react";
import { StudyItem } from "@/types/study";
import { daysUntil, priorityScore, todayStr } from "@/lib/adaptive";

interface Props {
  items: StudyItem[];
  onToggle: (id: string) => void;
  onEdit: (item: StudyItem) => void;
  onDelete: (id: string) => void;
  emptyMessage?: string;
  showPriority?: boolean;
}

const diffColor = (d: string) =>
  d === "어려움" ? "destructive" : d === "보통" ? "default" : "secondary";

const deadlineLabel = (deadline: string) => {
  const days = daysUntil(deadline);
  if (days < 0) return { text: `${Math.abs(days)}일 지남`, cls: "text-destructive" };
  if (days === 0) return { text: "오늘 마감", cls: "text-destructive font-semibold" };
  if (days === 1) return { text: "내일 마감", cls: "text-warning font-semibold" };
  if (days <= 3) return { text: `D-${days}`, cls: "text-warning" };
  return { text: `D-${days}`, cls: "text-muted-foreground" };
};

export const TaskList = ({ items, onToggle, onEdit, onDelete, emptyMessage, showPriority }: Props) => {
  const sorted = [...items].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    return priorityScore(b) - priorityScore(a);
  });

  if (sorted.length === 0)
    return (
      <Card className="p-10 text-center text-muted-foreground shadow-card">
        {emptyMessage || "항목이 없어요."}
      </Card>
    );

  const today = todayStr();

  return (
    <div className="space-y-3">
      {sorted.map((item, idx) => {
        const dl = deadlineLabel(item.deadline);
        const isTopPriority = showPriority && !item.completed && idx === 0 && (daysUntil(item.deadline) <= 1 || item.postponeCount >= 1);
        return (
          <Card
            key={item.id}
            className={`p-4 shadow-card transition-all ${item.completed ? "opacity-60" : "hover:shadow-elegant"} ${isTopPriority ? "border-primary border-2" : ""}`}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={item.completed}
                onCheckedChange={() => onToggle(item.id)}
                className="mt-1"
              />
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-semibold">{item.subject}</span>
                  <Badge variant={diffColor(item.difficulty) as any}>{item.difficulty}</Badge>
                  {isTopPriority && (
                    <Badge className="gradient-primary text-primary-foreground border-0">
                      <Flame className="h-3 w-3 mr-1" /> 최우선
                    </Badge>
                  )}
                  {item.postponeCount > 0 && (
                    <Badge variant="outline" className="text-warning border-warning/40">
                      미룸 {item.postponeCount}회
                    </Badge>
                  )}
                </div>
                <p className={`text-sm mb-2 ${item.completed ? "line-through text-muted-foreground" : ""}`}>
                  {item.content}
                </p>
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className={dl.cls}>📅 {item.deadline} · {dl.text}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {item.estimatedMinutes}분
                  </span>
                  {item.scheduledDate !== today && (
                    <span>예정: {item.scheduledDate}</span>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => onEdit(item)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={() => onDelete(item.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
