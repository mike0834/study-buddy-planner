import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card } from "@/components/ui/card";
import { StudyItem, Subject } from "@/types/study";

interface StudyStatisticsDashboardProps {
  items: StudyItem[];
  subjects: Subject[];
}

type Period = "week" | "month";

const HEAT_COLORS = ["bg-muted", "bg-primary/15", "bg-primary/35", "bg-primary/60", "bg-primary"];

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDateNDaysAgo = (daysAgo: number) => {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date;
};

const getCompletionDate = (item: StudyItem) => item.completedAt?.slice(0, 10) ?? item.scheduledDate;

const getAverage = (values: number[]) => {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

const getHeatLevel = (count: number) => {
  if (count === 0) return 0;
  if (count < 2) return 1;
  if (count < 4) return 2;
  if (count < 7) return 3;
  return 4;
};

export const StudyStatisticsDashboard = ({ items, subjects }: StudyStatisticsDashboardProps) => {
  const [period, setPeriod] = useState<Period>("week");

  const completedItems = useMemo(() => items.filter((item) => item.completed), [items]);
  const reviewItems = useMemo(() => items.filter((item) => item.kind === "review"), [items]);
  const completedReviews = useMemo(() => reviewItems.filter((item) => item.completed), [reviewItems]);

  const completionRate = reviewItems.length
    ? Math.round((completedReviews.length / reviewItems.length) * 100)
    : items.length
      ? Math.round((completedItems.length / items.length) * 100)
      : 0;

  const retentionRate = useMemo(() => {
    const scores = completedItems
      .map((item) => item.understanding)
      .filter((score): score is number => typeof score === "number")
      .map((score) => score * 20);

    return scores.length ? getAverage(scores) : completionRate;
  }, [completedItems, completionRate]);

  const studyStreak = useMemo(() => {
    const completedDates = new Set(completedItems.map(getCompletionDate));
    let streak = 0;

    for (let daysAgo = 0; daysAgo < 365; daysAgo += 1) {
      if (!completedDates.has(toDateKey(getDateNDaysAgo(daysAgo)))) break;
      streak += 1;
    }

    return streak;
  }, [completedItems]);

  const barData = useMemo(() => {
    if (period === "week") {
      return Array.from({ length: 7 }, (_, index) => {
        const date = getDateNDaysAgo(6 - index);
        const key = toDateKey(date);
        const scheduled = items.filter((item) => item.scheduledDate === key);

        return {
          label: date.toLocaleDateString("ko-KR", { weekday: "short" }),
          완료: scheduled.filter((item) => item.completed).length,
          목표: scheduled.length || 1,
        };
      });
    }

    return Array.from({ length: 4 }, (_, index) => {
      const dates = new Set(
        Array.from({ length: 7 }, (_, dayIndex) => toDateKey(getDateNDaysAgo(27 - index * 7 - dayIndex))),
      );
      const scheduled = items.filter((item) => dates.has(item.scheduledDate));

      return {
        label: `${index + 1}주`,
        완료: scheduled.filter((item) => item.completed).length,
        목표: scheduled.length || 1,
      };
    });
  }, [items, period]);

  const subjectRetentionData = useMemo(() => {
    const subjectNames = subjects.length > 0
      ? subjects.map((subject) => subject.name)
      : [...new Set(items.map((item) => item.subject))];

    return subjectNames.slice(0, 6).map((subject) => {
      const subjectItems = items.filter((item) => item.subject === subject);
      const completedSubjectItems = subjectItems.filter((item) => item.completed);
      const scores = completedSubjectItems
        .map((item) => item.understanding)
        .filter((score): score is number => typeof score === "number")
        .map((score) => score * 20);
      const rate = scores.length
        ? getAverage(scores)
        : subjectItems.length
          ? Math.round((completedSubjectItems.length / subjectItems.length) * 100)
          : 0;

      return { subject, 유지율: rate };
    });
  }, [items, subjects]);

  const cumulativeData = useMemo(() => {
    const days = period === "week" ? 7 : 28;
    let total = 0;

    return Array.from({ length: days }, (_, index) => {
      const date = getDateNDaysAgo(days - 1 - index);
      const key = toDateKey(date);
      total += completedItems.filter((item) => getCompletionDate(item) === key).length;

      return {
        label: period === "week" ? date.toLocaleDateString("ko-KR", { weekday: "short" }) : `${index + 1}일`,
        누적: total,
      };
    });
  }, [completedItems, period]);

  const heatmapData = useMemo(() => {
    const countByDate = completedItems.reduce<Record<string, number>>((acc, item) => {
      const key = getCompletionDate(item);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    return Array.from({ length: 182 }, (_, index) => {
      const date = getDateNDaysAgo(181 - index);
      const key = toDateKey(date);
      const count = countByDate[key] ?? 0;

      return {
        key,
        label: date.toLocaleDateString("ko-KR", { month: "long", day: "numeric" }),
        count,
        level: getHeatLevel(count),
      };
    });
  }, [completedItems]);

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <PeriodButton active={period === "week"} onClick={() => setPeriod("week")}>주간</PeriodButton>
        <PeriodButton active={period === "month"} onClick={() => setPeriod("month")}>월간</PeriodButton>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard title="복습 완료율" value={`${completionRate}%`} description="완료된 복습 항목 기준" />
        <MetricCard title="총 복습 항목" value={`${reviewItems.length}개`} description={`전체 학습 항목 ${items.length}개`} />
        <MetricCard title="연속 학습일" value={`${studyStreak}일`} description="오늘부터 이어진 완료 기록" warning />
        <MetricCard title="기억 유지율" value={`${retentionRate}%`} description="이해도 입력값 기반" />
      </div>

      <Card className="p-6 shadow-card">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold">{period === "week" ? "최근 7일 복습 완료율" : "최근 4주 복습 완료율"}</h3>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary" />완료</span>
            <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-primary/15" />목표</span>
          </div>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
              <Tooltip />
              <Bar dataKey="완료" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              <Bar dataKey="목표" fill="hsl(var(--primary) / 0.15)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-6 shadow-card">
          <h3 className="mb-5 text-base font-semibold">과목별 기억 유지율</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={subjectRetentionData}>
                <PolarGrid stroke="hsl(var(--border))" />
                <PolarAngleAxis dataKey="subject" fontSize={12} />
                <PolarRadiusAxis domain={[0, 100]} tickCount={5} fontSize={10} />
                <Radar dataKey="유지율" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.22} />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-card">
          <h3 className="mb-5 text-base font-semibold">복습 누적 추이</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} interval="preserveStartEnd" />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip />
                <Line type="monotone" dataKey="누적" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-6 shadow-card">
        <h3 className="mb-5 text-base font-semibold">복습 잔디 - 최근 6개월</h3>
        <div className="overflow-x-auto pb-2">
          <div className="grid grid-flow-col grid-rows-7 gap-1" style={{ width: "max-content" }}>
            {heatmapData.map((day) => (
              <div
                key={day.key}
                className={`h-3.5 w-3.5 rounded-sm ${HEAT_COLORS[day.level]}`}
                title={`${day.label} · 복습 ${day.count}개`}
              />
            ))}
          </div>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span>적음</span>
          {HEAT_COLORS.map((color) => (
            <span key={color} className={`h-3 w-3 rounded-sm ${color}`} />
          ))}
          <span>많음</span>
        </div>
      </Card>
    </div>
  );
};

const PeriodButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) => (
  <button
    type="button"
    className={`rounded-md border px-4 py-2 text-sm transition ${
      active ? "border-primary bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

const MetricCard = ({
  title,
  value,
  description,
  warning = false,
}: {
  title: string;
  value: string;
  description: string;
  warning?: boolean;
}) => (
  <Card className="p-5 shadow-card">
    <p className="text-sm text-muted-foreground">{title}</p>
    <p className="mt-2 text-3xl font-bold">{value}</p>
    <p className={`mt-1 text-xs ${warning ? "text-warning" : "text-success"}`}>{description}</p>
  </Card>
);
