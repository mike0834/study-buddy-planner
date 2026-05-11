import { Difficulty, StudyItem } from "@/types/study";

export const todayStr = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
};

export const addDays = (dateStr: string, days: number) => {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export const daysUntil = (dateStr: string) => {
  const today = new Date(todayStr());
  const target = new Date(dateStr);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const difficultyWeight = (d: Difficulty) =>
  d === "어려움" ? 3 : d === "보통" ? 2 : 1;

// Higher score => higher priority
export const priorityScore = (item: StudyItem) => {
  const days = Math.max(daysUntil(item.deadline), -2);
  // Closer deadline => bigger score
  const deadlineScore = Math.max(0, 30 - days * 4);
  const diffScore = difficultyWeight(item.difficulty) * 4;
  const postponeScore = item.postponeCount * 5;
  const overdueBoost = days < 0 ? 40 : 0;
  return deadlineScore + diffScore + postponeScore + overdueBoost;
};

// Move yesterday's unfinished tasks to today (only once per calendar day)
export const rolloverItems = (items: StudyItem[], lastRollover?: string): { items: StudyItem[]; changed: boolean } => {
  const today = todayStr();
  if (lastRollover === today) return { items, changed: false };
  let changed = false;
  const next = items.map((it) => {
    if (!it.completed && it.scheduledDate < today) {
      changed = true;
      return { ...it, scheduledDate: today, postponeCount: it.postponeCount + 1 };
    }
    return it;
  });
  return { items: next, changed };
};

export interface SubjectStats {
  subject: string;
  total: number;
  completed: number;
  postponeAvg: number;
  hardCount: number;
}

export const computeSubjectStats = (items: StudyItem[]): SubjectStats[] => {
  const map = new Map<string, SubjectStats>();
  for (const it of items) {
    const s = map.get(it.subject) || {
      subject: it.subject,
      total: 0,
      completed: 0,
      postponeAvg: 0,
      hardCount: 0,
    };
    s.total += 1;
    if (it.completed) s.completed += 1;
    s.postponeAvg += it.postponeCount;
    if (it.difficulty === "어려움") s.hardCount += 1;
    map.set(it.subject, s);
  }
  return Array.from(map.values()).map((s) => ({
    ...s,
    postponeAvg: s.total ? s.postponeAvg / s.total : 0,
  }));
};

export interface Recommendation {
  subject: string;
  message: string;
  tone: "info" | "warn" | "success";
}

export const buildRecommendations = (items: StudyItem[]): Recommendation[] => {
  const stats = computeSubjectStats(items);
  const recs: Recommendation[] = [];
  for (const s of stats) {
    if (s.postponeAvg >= 1.5) {
      recs.push({
        subject: s.subject,
        tone: "warn",
        message: `${s.subject}을(를) 자주 미루고 있어요. 아침 시간대에 먼저 공부해보는 걸 추천해요.`,
      });
    }
    if (s.hardCount >= 1) {
      recs.push({
        subject: s.subject,
        tone: "info",
        message: `${s.subject}은(는) 난이도가 높아요. 더 긴 공부 블록(60~90분)과 빠른 시작을 추천해요.`,
      });
    }
    const rate = s.total ? s.completed / s.total : 0;
    if (s.total >= 3 && rate >= 0.8) {
      recs.push({
        subject: s.subject,
        tone: "success",
        message: `${s.subject} 진도율 ${Math.round(rate * 100)}%! 정말 잘하고 있어요.`,
      });
    }
  }
  return recs.slice(0, 6);
};

export const buildFeedback = (items: StudyItem[]): { tone: "info" | "warn" | "success"; message: string } => {
  const today = todayStr();
  const todays = items.filter((i) => i.scheduledDate === today);
  const done = todays.filter((i) => i.completed).length;
  const total = todays.length;
  const overdue = items.filter((i) => !i.completed && i.deadline < today).length;
  const dueSoon = items.filter((i) => !i.completed && daysUntil(i.deadline) >= 0 && daysUntil(i.deadline) <= 1).length;

  if (overdue > 0)
    return { tone: "warn", message: `마감이 지난 항목이 ${overdue}개 있어요. 가장 먼저 처리해 봅시다!` };
  if (total === 0)
    return { tone: "info", message: "오늘 계획이 비어 있어요. 새로운 학습 항목을 추가해 보세요." };
  if (done === total)
    return { tone: "success", message: "오늘 계획을 모두 완료했어요! 정말 멋져요 🎉" };
  if (dueSoon > 0)
    return { tone: "warn", message: `마감이 임박한 항목이 ${dueSoon}개 있어요. 우선순위에 따라 진행해 보세요.` };
  if (done / total >= 0.5)
    return { tone: "success", message: `오늘 ${done}/${total} 완료! 좋은 흐름을 유지하고 있어요.` };
  return { tone: "info", message: "차근차근 시작해 봐요. 첫 항목부터 가볍게 진행해보세요." };
};
