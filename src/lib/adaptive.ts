import { Difficulty, StudyItem } from "@/types/study";

// 로컬 시간대 기준 YYYY-MM-DD 문자열로 변환.
// toISOString()은 UTC로 변환하면서 한국(UTC+9) 등에서 날짜가 하루 밀리는 문제가 있어
// 로컬 연/월/일 값을 직접 조합한다.
const toDateStr = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const todayStr = () => toDateStr(new Date());

export const addDays = (dateStr: string, days: number) => {
  // "T00:00:00"을 붙여 로컬 자정으로 파싱한다.
  // (date-only 문자열은 UTC 자정으로 파싱돼 시간대에 따라 날짜가 밀릴 수 있음)
  const d = new Date(`${dateStr}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toDateStr(d);
};

export const daysUntil = (dateStr: string) => {
  const today = new Date(`${todayStr()}T00:00:00`);
  const target = new Date(`${dateStr}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

export const difficultyWeight = (d: Difficulty) =>
  d === "어려움" ? 3 : d === "보통" ? 2 : 1;

// Higher score => higher priority
export const priorityScore = (item: StudyItem) => {
  const days = Math.max(daysUntil(item.deadline), -2);
  const deadlineScore = Math.max(0, 30 - days * 4);
  const diffScore = difficultyWeight(item.difficulty) * 4;
  const postponeScore = item.postponeCount * 5;
  const overdueBoost = days < 0 ? 40 : 0;
  const reviewBoost = item.kind === "review" ? (item.reviewStage || 1) * 2 : 0;
  return deadlineScore + diffScore + postponeScore + overdueBoost + reviewBoost;
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

// ===== 에빙하우스 망각곡선 기반 복습 일정 =====
// 1차: 당일(원학습), 2차: +1일, 3차: +3일, 4차: +7일, 5차: +14일, 6차: +30일
export const REVIEW_OFFSETS = [1, 3, 7, 14, 30];

export interface GenerateReviewOptions {
  baseDate: string;     // 원학습 예정일
  examDate?: string;    // 시험일 (있으면 그 이후 일정은 제외/압축)
  difficulty: Difficulty;
}

export const generateReviewDates = ({ baseDate, examDate, difficulty }: GenerateReviewOptions): { stage: number; date: string }[] => {
  let offsets = [...REVIEW_OFFSETS];
  // 어려운 과목은 한 단계 더 (당일 +1 추가)
  if (difficulty === "어려움") offsets = [1, 2, 4, 7, 14, 30];
  // 쉬운 과목은 일부 생략
  if (difficulty === "쉬움") offsets = [1, 7, 21];

  const result: { stage: number; date: string }[] = [];
  for (let i = 0; i < offsets.length; i++) {
    const date = addDays(baseDate, offsets[i]);
    if (examDate && date > examDate) {
      // 시험 임박 → 압축 복습: 시험 전날에 통합 복습 1개만 추가
      if (!result.some((r) => r.date === addDays(examDate, -1))) {
        result.push({ stage: i + 2, date: addDays(examDate, -1) });
      }
      break;
    }
    result.push({ stage: i + 2, date });
  }
  return result;
};

// 원학습 항목으로부터 복습 항목들을 생성
export const buildReviewItems = (parent: StudyItem): StudyItem[] => {
  const dates = generateReviewDates({
    baseDate: parent.scheduledDate,
    examDate: parent.examDate,
    difficulty: parent.difficulty,
  });
  return dates.map((d) => ({
    id: crypto.randomUUID(),
    subject: parent.subject,
    content: `[복습 ${d.stage}차] ${parent.content}`,
    deadline: parent.examDate || parent.deadline,
    estimatedMinutes: Math.max(15, Math.round(parent.estimatedMinutes * 0.5)),
    difficulty: parent.difficulty,
    completed: false,
    createdAt: new Date().toISOString(),
    scheduledDate: d.date,
    postponeCount: 0,
    kind: "review",
    parentId: parent.id,
    reviewStage: d.stage,
    examDate: parent.examDate,
  }));
};

// 복습 완료 결과(이해도/오답)에 따라 후속 복습 일정 적응형 조정
export interface ReviewResult {
  understanding: number; // 1~5
  wrongCount: number;
}

export const adjustReviewsAfterCompletion = (
  items: StudyItem[],
  completedItem: StudyItem,
  result: ReviewResult,
): StudyItem[] => {
  if (!completedItem.parentId && completedItem.kind !== "study") return items;
  const parentId = completedItem.parentId || completedItem.id;
  const today = todayStr();

  // 후속 미완료 복습들
  let next = [...items];
  const upcoming = next.filter(
    (i) => i.parentId === parentId && !i.completed && i.scheduledDate >= today && i.id !== completedItem.id,
  );

  // 이해도 낮음(1~2) 또는 오답 많음 → 당일/익일 재복습 추가, 이후 간격 단축
  if (result.understanding <= 2 || result.wrongCount >= 3) {
    const parent = next.find((i) => i.id === parentId);
    if (parent) {
      const extra: StudyItem = {
        id: crypto.randomUUID(),
        subject: parent.subject,
        content: `[보충 복습] ${parent.content}`,
        deadline: parent.examDate || parent.deadline,
        estimatedMinutes: Math.max(15, Math.round(parent.estimatedMinutes * 0.4)),
        difficulty: parent.difficulty,
        completed: false,
        createdAt: new Date().toISOString(),
        scheduledDate: addDays(today, 1),
        postponeCount: 0,
        kind: "review",
        parentId,
        reviewStage: (completedItem.reviewStage || 1) + 0.5,
        examDate: parent.examDate,
      };
      next = [...next, extra];
    }
    // 후속 복습 하루씩 당기기
    next = next.map((i) =>
      upcoming.some((u) => u.id === i.id)
        ? { ...i, scheduledDate: addDays(i.scheduledDate, -1) > today ? addDays(i.scheduledDate, -1) : addDays(today, 1) }
        : i,
    );
  }
  // 이해도 매우 높음(5) & 오답 0 → 다음 복습 1개 생략
  else if (result.understanding === 5 && result.wrongCount === 0 && upcoming.length > 0) {
    const skipId = upcoming.sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))[0].id;
    next = next.filter((i) => i.id !== skipId);
  }

  return next;
};

// 시험 임박(7일 이내) 시 압축 복습 모드: 매일 1회 복습 보장
export const isExamCramMode = (item: StudyItem): boolean => {
  if (!item.examDate) return false;
  const d = daysUntil(item.examDate);
  return d >= 0 && d <= 7;
};

export interface SubjectStats {
  subject: string;
  total: number;
  completed: number;
  postponeAvg: number;
  hardCount: number;
  avgUnderstanding: number;
  totalWrong: number;
}

export const computeSubjectStats = (items: StudyItem[]): SubjectStats[] => {
  const map = new Map<string, SubjectStats & { _uCount: number; _uSum: number }>();
  for (const it of items) {
    const s = map.get(it.subject) || {
      subject: it.subject,
      total: 0,
      completed: 0,
      postponeAvg: 0,
      hardCount: 0,
      avgUnderstanding: 0,
      totalWrong: 0,
      _uCount: 0,
      _uSum: 0,
    };
    s.total += 1;
    if (it.completed) s.completed += 1;
    s.postponeAvg += it.postponeCount;
    if (it.difficulty === "어려움") s.hardCount += 1;
    if (typeof it.understanding === "number") {
      s._uSum += it.understanding;
      s._uCount += 1;
    }
    if (typeof it.wrongCount === "number") s.totalWrong += it.wrongCount;
    map.set(it.subject, s);
  }
  return Array.from(map.values()).map((s) => ({
    subject: s.subject,
    total: s.total,
    completed: s.completed,
    postponeAvg: s.total ? s.postponeAvg / s.total : 0,
    hardCount: s.hardCount,
    avgUnderstanding: s._uCount ? s._uSum / s._uCount : 0,
    totalWrong: s.totalWrong,
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
    if (s.avgUnderstanding > 0 && s.avgUnderstanding < 3) {
      recs.push({
        subject: s.subject,
        tone: "warn",
        message: `${s.subject} 이해도가 낮아요(평균 ${s.avgUnderstanding.toFixed(1)}/5). 복습 간격을 자동으로 단축했어요.`,
      });
    }
    if (s.totalWrong >= 5) {
      recs.push({
        subject: s.subject,
        tone: "warn",
        message: `${s.subject} 오답이 누적되고 있어요(${s.totalWrong}개). 오답 위주 재복습을 추가했어요.`,
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
  // 시험 임박 과목
  const cramSubjects = new Set(items.filter(isExamCramMode).map((i) => i.subject));
  for (const subj of cramSubjects) {
    recs.push({
      subject: subj,
      tone: "warn",
      message: `${subj} 시험이 임박했어요. 압축 복습 모드로 매일 짧게라도 복습하세요.`,
    });
  }
  return recs.slice(0, 8);
};

export const buildFeedback = (items: StudyItem[]): { tone: "info" | "warn" | "success"; message: string } => {
  const today = todayStr();
  const todays = items.filter((i) => i.scheduledDate === today);
  const done = todays.filter((i) => i.completed).length;
  const total = todays.length;
  const overdue = items.filter((i) => !i.completed && i.deadline < today).length;
  const dueSoon = items.filter((i) => !i.completed && daysUntil(i.deadline) >= 0 && daysUntil(i.deadline) <= 1).length;
  const reviewsToday = todays.filter((i) => i.kind === "review").length;

  if (overdue > 0)
    return { tone: "warn", message: `마감이 지난 항목이 ${overdue}개 있어요. 가장 먼저 처리해 봅시다!` };
  if (total === 0)
    return { tone: "info", message: "오늘 계획이 비어 있어요. 새로운 학습 항목을 추가하면 망각곡선 복습이 자동 생성돼요." };
  if (done === total)
    return { tone: "success", message: "오늘 계획을 모두 완료했어요! 정말 멋져요 🎉" };
  if (dueSoon > 0)
    return { tone: "warn", message: `시험/마감이 임박한 항목이 ${dueSoon}개 있어요. 압축 복습을 권장해요.` };
  if (reviewsToday > 0)
    return { tone: "info", message: `오늘 복습 ${reviewsToday}건이 예정되어 있어요. 짧게라도 훑어보면 기억이 오래 남아요!` };
  if (done / total >= 0.5)
    return { tone: "success", message: `오늘 ${done}/${total} 완료! 좋은 흐름을 유지하고 있어요.` };
  return { tone: "info", message: "차근차근 시작해 봐요. 첫 항목부터 가볍게 진행해보세요." };
};
