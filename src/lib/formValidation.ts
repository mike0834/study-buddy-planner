import { Difficulty, StudyItem } from "@/types/study";

/**
 * 학습 폼(StudyForm) 입력값 검증 및 정규화 유틸리티
 *
 * 담당: Hyun0325 (학습 계획 입력 기능)
 */

/** 난이도별 추천 학습 시간(분) */
export const DIFFICULTY_RECOMMENDED_MINUTES: Record<Difficulty, number> = {
  쉬움: 20,
  보통: 45,
  어려움: 90,
};

/** 난이도별 강조 색상 토큰 (Tailwind) */
export const DIFFICULTY_COLOR: Record<Difficulty, string> = {
  쉬움: "text-success",
  보통: "text-primary",
  어려움: "text-destructive",
};

export interface FormError {
  field: "subject" | "content" | "scheduledDate" | "deadline" | "estimatedMinutes";
  message: string;
}

/**
 * 학습 항목 입력값 검증.
 * 입력에 문제가 있으면 사용자에게 보여줄 에러 목록을 반환한다.
 */
export const validateStudyForm = (form: Partial<StudyItem>): FormError[] => {
  const errors: FormError[] = [];

  if (!form.subject?.trim()) {
    errors.push({ field: "subject", message: "과목명을 입력해주세요." });
  }
  if (!form.content?.trim()) {
    errors.push({ field: "content", message: "학습 내용을 입력해주세요." });
  }
  if (!form.scheduledDate) {
    errors.push({ field: "scheduledDate", message: "학습 예정일을 선택해주세요." });
  }
  if (!form.deadline) {
    errors.push({ field: "deadline", message: "마감일을 선택해주세요." });
  }
  if ((form.estimatedMinutes ?? 0) < 5) {
    errors.push({
      field: "estimatedMinutes",
      message: "예상 학습 시간은 최소 5분 이상이어야 합니다.",
    });
  }

  return errors;
};

/** 과목명에서 양 끝 공백 제거 및 연속 공백을 단일 공백으로 정리한다. */
export const normalizeSubject = (subject: string): string =>
  subject.trim().replace(/\s+/g, " ");

/**
 * 학습 예정일이 마감일을 넘기는 경우, 학습 예정일을 마감일에 맞춰 보정한다.
 * (마감일 이후에 공부 시작하는 모순을 막기 위함)
 */
export const adjustScheduledDate = (
  scheduledDate: string,
  deadline: string
): string => {
  if (!scheduledDate || !deadline) return scheduledDate;
  return scheduledDate > deadline ? deadline : scheduledDate;
};

/** 난이도가 주어졌을 때 추천 시간을 반환한다 (없으면 기본값 30분). */
export const recommendMinutes = (difficulty?: Difficulty): number =>
  difficulty ? DIFFICULTY_RECOMMENDED_MINUTES[difficulty] : 30;
