export type Difficulty = "쉬움" | "보통" | "어려움";

export type ItemKind = "study" | "review";

/** 과목 색상 (Tailwind 클래스와 매핑) */
export type SubjectColor = "blue" | "green" | "purple" | "orange" | "pink" | "teal";

/** 등록된 과목. 학습 항목은 등록된 과목 중에서 선택해 추가한다. */
export interface Subject {
  id: string;
  name: string;
  color: SubjectColor;
  createdAt: string;
}

export interface StudyItem {
  id: string;
  subject: string;
  content: string;
  deadline: string; // YYYY-MM-DD (보통 시험일 또는 마감일)
  estimatedMinutes: number;
  difficulty: Difficulty;
  completed: boolean;
  createdAt: string;
  scheduledDate: string; // YYYY-MM-DD - the day the user plans to study/review it
  postponeCount: number;
  completedAt?: string;

  // RePlan 확장 필드
  kind?: ItemKind;          // "study"(원학습) | "review"(복습)
  parentId?: string;        // review의 경우 원학습 id
  reviewStage?: number;     // 1~6 (에빙하우스 단계)
  examDate?: string;        // 시험일 (있으면 마감/복습 한도)
  understanding?: number;   // 1~5 (완료 시 입력)
  wrongCount?: number;      // 오답 수 (완료 시 입력)
  actualMinutes?: number;   // 타이머로 측정한 실제 학습 시간(분) (완료 시 입력)
}
