import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, AlertTriangle } from "lucide-react";
import { StudyItem, Subject } from "@/types/study";
import { subjectColorClass } from "./SubjectManager";
import { computeSubjectRisk, getSubjectPhase, riskLabel } from "@/lib/adaptive";

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

  const risk = computeSubjectRisk(items, subject.name);
  const phase = getSubjectPhase(items, subject.name);

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

      {/* 시험 단계 + 위험 과목 표시 */}
      {(phase.phase !== "none" || risk.level !== "safe") && (
        <div className="flex flex-wrap items-center gap-2 mb-3">
          {phase.phase === "concept" && <Badge variant="secondary">{phase.emoji} D-{phase.dday} · {phase.label}</Badge>}
          {phase.phase === "practice" && <Badge className="bg-warning/15 text-warning border-warning/30">{phase.emoji} D-{phase.dday} · {phase.label}</Badge>}
          {phase.phase === "memorize" && <Badge className="gradient-primary text-primary-foreground border-0">{phase.emoji} D-{phase.dday} · {phase.label}</Badge>}
          {risk.level === "caution" && (
            <Badge variant="outline" className="text-warning border-warning/40">
              <AlertTriangle className="h-3 w-3 mr-1" /> {riskLabel(risk.level)} 과목
            </Badge>
          )}
          {risk.level === "danger" && (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" /> {riskLabel(risk.level)} 과목
            </Badge>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 mb-3">
        <Badge variant="secondary">전체 {total}개</Badge>
        <Badge variant="secondary">완료 {completed}개</Badge>
        {pendingReviews > 0 && <Badge variant="destructive">복습 {pendingReviews}개</Badge>}
      </div>

      {risk.reasons.length > 0 && risk.level !== "safe" && (
        <p className="text-xs text-warning mb-3 flex items-start gap-1">
          <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0" /> {risk.reasons[0]}
        </p>
      )}

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
