import { StudyItem } from "@/types/study";
import { todayStr } from "@/lib/adaptive";

/**
 * 학습 진척도 및 통계 계산 유틸리티
 *
 * 담당: (진척도 / 통계 UI - SubjectProgress, StatCard, TaskList)
 */

export interface ProgressSummary {
  total: number;
  completed: number;
  inProgress: number;
  overdue: number;
  completionRate: number;
}

/**
 * 전체 학습 항목에 대한 요약 통계.
 * 대시보드 상단의 StatCard들에서 사용한다.
 */
export const computeOverallProgress = (items: StudyItem[]): ProgressSummary => {
  const today = todayStr();
  const total = items.length;
  const completed = items.filter((i) => i.completed).length;
  const overdue = items.filter(
    (i) => !i.completed && i.deadline < today
  ).length;
  const inProgress = total - completed - overdue;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  return { total, completed, inProgress, overdue, completionRate };
};

/** 과목별 완료된 학습 시간(분) 합계. */
export const sumStudyMinutesBySubject = (
  items: StudyItem[]
): Record<string, number> => {
  const result: Record<string, number> = {};
  for (const item of items) {
    if (!item.completed) continue;
    result[item.subject] = (result[item.subject] ?? 0) + item.estimatedMinutes;
  }
  return result;
};

/** 학습 시간이 많은 상위 N개 과목. */
export const getTopSubjects = (
  items: StudyItem[],
  topN = 3
): Array<{ subject: string; minutes: number }> => {
  const minutesBySubject = sumStudyMinutesBySubject(items);
  return Object.entries(minutesBySubject)
    .map(([subject, minutes]) => ({ subject, minutes }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, topN);
};

/**
 * 연속 학습일 (오늘부터 거꾸로 카운트).
 * 하루라도 완료 기록이 없으면 카운트가 끊긴다.
 */
export const computeStreak = (items: StudyItem[]): number => {
  const completionDates = new Set(
    items
      .filter((i) => i.completed && i.completedAt)
      .map((i) => i.completedAt!.slice(0, 10))
  );

  let streak = 0;
  const cursor = new Date();
  while (completionDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

/** 진척률(%)을 0~100 범위로 안전하게 클램프한다. */
export const clampProgress = (value: number): number =>
  Math.max(0, Math.min(100, Math.round(value)));
