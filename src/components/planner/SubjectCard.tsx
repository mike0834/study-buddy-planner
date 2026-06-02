import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { StudyItem, Subject } from "@/types/study";
import { subjectColorClass } from "./SubjectManager";

interface Props {
  subject: Subject;
  items: StudyItem[];
  onClick: () => void;
}

/** 홈 화면에 표시되는 과목 카드. 클릭하면 해당 과목 상세 화면으로 이동한다. */
export const SubjectCard = ({ subject, items, onClick }: Props) => {
  const subjectItems = items.filter((i) => i.subject === subject.name);
  const completed = subjectItems.filter((i) => i.completed).length;
  const total = subjectItems.length;
  const pct = total ? Math.round((completed / total) * 100) : 0;
  const pendingReviews = subjectItems.filter((i) => i.kind === "review" && !i.completed).length;

  return (
    <Card
      className="p-5 shadow-card cursor-pointer transition-all hover:shadow-elegant hover:-translate-y-0.5 group"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className={`h-4 w-4 rounded-full ${subjectColorClass(subject.color)}`} />
          <h3 className="text-lg font-bold">{subject.name}</h3>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary">전체 {total}개</Badge>
        <Badge variant="secondary">완료 {completed}개</Badge>
        {pendingReviews > 0 && <Badge variant="destructive">복습 {pendingReviews}개</Badge>}
      </div>

      <div className="flex items-center gap-3">
        <Progress value={pct} className="h-2 flex-1" />
        <span className="text-sm font-semibold text-primary">{pct}%</span>
      </div>

      {total === 0 && (
        <p className="text-xs text-muted-foreground mt-3">
          아직 학습 항목이 없어요. 눌러서 추가해 보세요!
        </p>
      )}
    </Card>
  );
};
