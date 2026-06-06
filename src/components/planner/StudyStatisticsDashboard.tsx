import { Card } from "@/components/ui/card";
import { StudyItem, Subject } from "@/types/study";

interface StudyStatisticsDashboardProps {
  items: StudyItem[];
  subjects: Subject[];
}

export const StudyStatisticsDashboard = ({
  items,
  subjects,
}: StudyStatisticsDashboardProps) => {
  const completedCount = items.filter((item) => item.completed).length;
  const totalCount = items.length;
  const completionRate =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 shadow-card">
          <p className="text-sm text-muted-foreground">복습 완료율</p>
          <p className="text-3xl font-bold mt-2">{completionRate}%</p>
        </Card>

        <Card className="p-5 shadow-card">
          <p className="text-sm text-muted-foreground">총 학습 항목</p>
          <p className="text-3xl font-bold mt-2">{totalCount}개</p>
        </Card>

        <Card className="p-5 shadow-card">
          <p className="text-sm text-muted-foreground">완료 항목</p>
          <p className="text-3xl font-bold mt-2">{completedCount}개</p>
        </Card>

        <Card className="p-5 shadow-card">
          <p className="text-sm text-muted-foreground">등록 과목</p>
          <p className="text-3xl font-bold mt-2">{subjects.length}개</p>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-2">학습 통계</h3>
        <p className="text-sm text-muted-foreground">
          여기에 복습 완료율, 과목별 기억 유지율, 복습 잔디를 추가할 수 있어요.
        </p>
      </Card>
    </div>
  );
};
