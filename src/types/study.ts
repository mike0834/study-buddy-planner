export type Difficulty = "쉬움" | "보통" | "어려움";

export interface StudyItem {
  id: string;
  subject: string;
  content: string;
  deadline: string; // YYYY-MM-DD
  estimatedMinutes: number;
  difficulty: Difficulty;
  completed: boolean;
  createdAt: string;
  scheduledDate: string; // YYYY-MM-DD - the day the user plans to study it
  postponeCount: number;
  completedAt?: string;
}
