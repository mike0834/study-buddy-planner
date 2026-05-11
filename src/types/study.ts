export type Difficulty = "쉬움" | "보통" | "어려움";

export type ItemKind = "study" | "review";

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
}
