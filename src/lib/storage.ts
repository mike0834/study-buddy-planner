import { StudyItem, Subject } from "@/types/study";

const KEY = "adaptive-study-planner.items";
const META_KEY = "adaptive-study-planner.meta";
const SUBJECTS_KEY = "adaptive-study-planner.subjects";

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
