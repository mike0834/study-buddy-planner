import { StudyItem } from "@/types/study";

/**
 * 복습 / 피드백 결과 분석 유틸리티
 *
 * 담당: wlr6709 (복습 / 피드백 기능 - FeedbackPanel, ReviewCompleteDialog)
 */

export type ReviewQuality = "weak" | "average" | "good" | "excellent";

/**
 * 이해도(1~5)와 오답 수로 복습 품질을 4단계로 판정한다.
 * - excellent : 이해도 5, 오답 0
 * - good      : 이해도 4 이상, 오답 1 이하
 * - weak      : 이해도 2 이하 또는 오답 5개 이상
 * - average   : 그 외
 */
export const judgeReviewQuality = (
  understanding: number,
  wrongCount: number
): ReviewQuality => {
  if (understanding <= 2 || wrongCount >= 5) return "weak";
  if (understanding === 5 && wrongCount === 0) return "excellent";
  if (understanding >= 4 && wrongCount <= 1) return "good";
  return "average";
};

/** 복습 품질별 격려 메시지. ReviewCompleteDialog 하단에 표시. */
export const REVIEW_FEEDBACK_MESSAGE: Record<ReviewQuality, string> = {
  weak: "조금 어려웠나봐요. 내일 보충 복습이 잡혀요. 천천히 다시 봐도 괜찮아요!",
  average: "기본 일정대로 다음 복습이 잡혔어요. 지금 페이스를 유지해보세요.",
  good: "잘 이해하고 있어요! 다음 복습 간격이 살짝 늘어났어요.",
  excellent: "완벽해요! 다음 복습 1회를 생략해도 좋아요. 🎉",
};

/** 복습 완료된 항목들의 평균 이해도 (소수점 첫째 자리까지). */
export const averageUnderstanding = (items: StudyItem[]): number => {
  const reviewed = items.filter(
    (i) => i.completed && typeof i.understanding === "number"
  );
  if (reviewed.length === 0) return 0;
  const total = reviewed.reduce((acc, i) => acc + (i.understanding ?? 0), 0);
  return Math.round((total / reviewed.length) * 10) / 10;
};

/** 최근 N개의 복습 결과를 최신순으로 반환. */
export const getRecentReviews = (
  items: StudyItem[],
  limit = 5
): Array<{ subject: string; understanding: number; completedAt: string }> => {
  return items
    .filter((i) => i.completed && i.understanding !== undefined && i.completedAt)
    .sort((a, b) => (b.completedAt ?? "").localeCompare(a.completedAt ?? ""))
    .slice(0, limit)
    .map((i) => ({
      subject: i.subject,
      understanding: i.understanding!,
      completedAt: i.completedAt!,
    }));
};

/** 오답이 많이 나온 과목 상위 N개. 약점 과목 파악에 사용. */
export const getStrugglingSubjects = (
  items: StudyItem[],
  topN = 3
): Array<{ subject: string; wrongCount: number }> => {
  const totals: Record<string, number> = {};
  for (const item of items) {
    if (item.completed && item.wrongCount) {
      totals[item.subject] = (totals[item.subject] ?? 0) + item.wrongCount;
    }
  }
  return Object.entries(totals)
    .map(([subject, wrongCount]) => ({ subject, wrongCount }))
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, topN);
};
