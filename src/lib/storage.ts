import { StudyItem, Subject } from "@/types/study";

const KEY = "adaptive-study-planner.items";
const META_KEY = "adaptive-study-planner.meta";
const SUBJECTS_KEY = "adaptive-study-planner.subjects";
const TIMER_KEY = "adaptive-study-planner.timer";

export interface PlannerMeta {
  lastRolloverDate?: string; // YYYY-MM-DD
}

export const loadItems = (): StudyItem[] => {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StudyItem[];
  } catch {
    return [];
  }
};

export const saveItems = (items: StudyItem[]) => {
  localStorage.setItem(KEY, JSON.stringify(items));
};

export const loadMeta = (): PlannerMeta => {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || "{}");
  } catch {
    return {};
  }
};

export const saveMeta = (meta: PlannerMeta) => {
  localStorage.setItem(META_KEY, JSON.stringify(meta));
};

export const loadSubjects = (): Subject[] => {
  try {
    const raw = localStorage.getItem(SUBJECTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Subject[];
  } catch {
    return [];
  }
};

export const saveSubjects = (subjects: Subject[]) => {
  localStorage.setItem(SUBJECTS_KEY, JSON.stringify(subjects));
};

/** 학습 타이머(스톱워치) 상태. 절대 시각 기준이라 새로고침해도 이어진다. */
export interface TimerState {
  itemId: string | null; // 측정 중인 학습 항목 (null = 자유 학습)
  baseMs: number;         // 일시정지 동안 누적된 시간(ms)
  startTs: number | null; // 현재 측정 시작 시각(epoch ms). null이면 정지 상태
}

export const loadTimer = (): TimerState | null => {
  try {
    const raw = localStorage.getItem(TIMER_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TimerState;
  } catch {
    return null;
  }
};

export const saveTimer = (timer: TimerState) => {
  localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
};

export const clearTimer = () => {
  localStorage.removeItem(TIMER_KEY);
};
