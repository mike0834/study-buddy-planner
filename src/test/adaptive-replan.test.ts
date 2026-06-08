import { describe, it, expect } from "vitest";
import {
  addDays,
  todayStr,
  replanSchedule,
  computeSubjectRisk,
  splitIntoChunks,
  mergeSplitChunks,
  getExamPhase,
  computeTodayWorkload,
  buildReviewItems,
} from "@/lib/adaptive";
import { StudyItem } from "@/types/study";

const mk = (o: Partial<StudyItem>): StudyItem => ({
  id: o.id ?? crypto.randomUUID(),
  subject: "제어공학",
  content: "내용",
  deadline: todayStr(),
  estimatedMinutes: 60,
  difficulty: "보통",
  completed: false,
  createdAt: new Date().toISOString(),
  scheduledDate: todayStr(),
  postponeCount: 0,
  kind: "study",
  ...o,
});

describe("계획 재구성 엔진 (replanSchedule)", () => {
  it("미완료를 오늘에 쌓아두지 않고 하루 한도(cap) 내로 분산한다", () => {
    const exam = addDays(todayStr(), 5);
    // 50분 × 6 = 300분이 모두 오늘로 몰려 있음, 한도 120분
    const items = Array.from({ length: 6 }, () =>
      mk({ estimatedMinutes: 50, examDate: exam, deadline: exam }),
    );
    const { items: out } = replanSchedule(items, 120);
    const todayLoad = out
      .filter((i) => i.scheduledDate === todayStr())
      .reduce((a, i) => a + i.estimatedMinutes, 0);
    expect(todayLoad).toBeLessThanOrEqual(120);
    expect(out.some((i) => i.scheduledDate > todayStr())).toBe(true);
  });

  it("시험/마감일을 넘겨서 배치하지 않는다", () => {
    const exam = addDays(todayStr(), 1);
    const items = Array.from({ length: 6 }, () =>
      mk({ estimatedMinutes: 50, examDate: exam, deadline: exam }),
    );
    const { items: out } = replanSchedule(items, 120);
    expect(out.every((i) => i.scheduledDate <= exam)).toBe(true);
  });

  it("시험 임박 과목을 먼 시험 과목보다 이른 날짜에 우선 배치한다", () => {
    const near = addDays(todayStr(), 2);
    const far = addDays(todayStr(), 20);
    const items = [
      ...Array.from({ length: 3 }, () => mk({ subject: "임박", estimatedMinutes: 60, examDate: near, deadline: near })),
      ...Array.from({ length: 3 }, () => mk({ subject: "여유", estimatedMinutes: 60, examDate: far, deadline: far })),
    ];
    const { items: out } = replanSchedule(items, 120);
    const nearToday = out.filter((i) => i.subject === "임박" && i.scheduledDate === todayStr()).length;
    const farToday = out.filter((i) => i.subject === "여유" && i.scheduledDate === todayStr()).length;
    expect(nearToday).toBeGreaterThanOrEqual(farToday);
  });

  it("과거 분할된 (n/m) 조각을 하나로 다시 합친다", () => {
    const items = [
      mk({ content: "3장 풀기 (1/3)", estimatedMinutes: 25 }),
      mk({ content: "3장 풀기 (2/3)", estimatedMinutes: 25 }),
      mk({ content: "3장 풀기 (3/3)", estimatedMinutes: 25 }),
      mk({ content: "다른 항목", estimatedMinutes: 30 }),
    ];
    const { items: out, merged } = mergeSplitChunks(items);
    expect(merged).toBe(true);
    const recombined = out.filter((i) => i.content === "3장 풀기");
    expect(recombined.length).toBe(1);
    expect(recombined[0].estimatedMinutes).toBe(75);
    expect(out.length).toBe(2); // 합쳐진 1개 + 다른 항목 1개
    expect(out.some((i) => /\(\d+\/\d+\)/.test(i.content))).toBe(false);
  });

  it("분할 라벨이 없으면 합치기가 동작하지 않는다 (merged=false)", () => {
    const items = [mk({ content: "그냥 항목" })];
    expect(mergeSplitChunks(items).merged).toBe(false);
  });

  it("재구성 시 학습 항목을 작은 단위로 쪼개지 않는다 (자동 분할 비활성화)", () => {
    const exam = addDays(todayStr(), 10);
    const items = [
      mk({ subject: "위험과목", estimatedMinutes: 90, postponeCount: 2, examDate: exam, deadline: exam }),
      mk({ subject: "위험과목", estimatedMinutes: 30, postponeCount: 1, examDate: exam, deadline: exam }),
      mk({ subject: "위험과목", estimatedMinutes: 30, postponeCount: 1, examDate: exam, deadline: exam }),
    ];
    const { items: out, summary } = replanSchedule(items, 120);
    // 쪼개지 않으므로 분할 수는 0, 90분짜리는 그대로 유지, (n/m) 라벨도 없음
    expect(summary.splitCount).toBe(0);
    expect(out.some((i) => i.estimatedMinutes === 90)).toBe(true);
    expect(out.some((i) => /\(\d+\/\d+\)/.test(i.content))).toBe(false);
    expect(out.length).toBe(items.length);
  });

  it("복습(review) 항목의 망각곡선 차수별 날짜는 절대 옮기지 않는다", () => {
    const exam = addDays(todayStr(), 30);
    // 복습 차수별로 다른 날짜(+1/+3/+7)에 배치된 복습 항목들
    const reviews = [1, 3, 7].map((off, i) =>
      mk({
        kind: "review",
        reviewStage: i + 2,
        estimatedMinutes: 30,
        scheduledDate: addDays(todayStr(), off),
        deadline: exam,
        examDate: exam,
      }),
    );
    // 오늘로 몰린 큰 원학습들(재분배 대상)
    const studies = Array.from({ length: 5 }, () =>
      mk({ estimatedMinutes: 60, examDate: exam, deadline: exam }),
    );
    const { items: out } = replanSchedule([...reviews, ...studies], 120);
    for (const r of reviews) {
      expect(out.find((i) => i.id === r.id)!.scheduledDate).toBe(r.scheduledDate);
    }
  });

  it("사용자가 미래로 예정한 원학습은 오늘로 끌어오지 않는다", () => {
    const future = addDays(todayStr(), 10);
    const exam = addDays(todayStr(), 12);
    const study = mk({ scheduledDate: future, examDate: exam, deadline: exam });
    const { items: out } = replanSchedule([study], 120);
    expect(out.find((i) => i.id === study.id)!.scheduledDate).toBe(future);
  });

  it("새로 등록한(완료 0) 과목은 위험 과목으로 오판하지 않는다", () => {
    // 오늘 예정 원학습 1개 + 미래 복습 5개, 아무것도 미루지 않음
    const study = mk({ subject: "신규", scheduledDate: todayStr() });
    const reviews = [1, 3, 7, 14, 30].map((off) =>
      mk({ subject: "신규", kind: "review", scheduledDate: addDays(todayStr(), off), estimatedMinutes: 20 }),
    );
    expect(computeSubjectRisk([study, ...reviews], "신규").level).toBe("safe");
  });

  it("완료된 항목은 재배치하지 않는다", () => {
    const done = mk({ completed: true, scheduledDate: addDays(todayStr(), -3), completedAt: new Date().toISOString() });
    const { items: out } = replanSchedule([done], 120);
    expect(out.find((i) => i.id === done.id)!.scheduledDate).toBe(done.scheduledDate);
  });
});

describe("위험 과목 / 시험 단계 / 학습량", () => {
  it("5개 중 3개를 미루면 위험 과목으로 표시한다", () => {
    const items = [
      mk({ postponeCount: 2 }), mk({ postponeCount: 1 }), mk({ postponeCount: 1 }),
      mk({ postponeCount: 0 }), mk({ postponeCount: 0 }),
    ];
    const risk = computeSubjectRisk(items, "제어공학");
    expect(risk.postponedItems).toBe(3);
    expect(risk.level).toBe("danger");
  });

  it("D-day에 따라 개념→문제풀이→오답암기로 전환한다", () => {
    expect(getExamPhase(addDays(todayStr(), 10)).phase).toBe("concept");
    expect(getExamPhase(addDays(todayStr(), 6)).phase).toBe("practice");
    expect(getExamPhase(addDays(todayStr(), 2)).phase).toBe("memorize");
  });

  it("복습은 망각곡선대로 서로 다른 날짜에 생성된다 (한 날짜로 압축 안 함)", () => {
    const study = mk({ scheduledDate: todayStr(), examDate: addDays(todayStr(), 60), deadline: addDays(todayStr(), 60) });
    const reviews = buildReviewItems(study);
    const dates = reviews.map((r) => r.scheduledDate);
    // 모든 복습 날짜가 서로 달라야 한다
    expect(new Set(dates).size).toBe(dates.length);
    expect(dates.length).toBeGreaterThanOrEqual(3);
  });

  it("시험일을 넘는 복습은 한 날짜로 몰지 않고 제외한다", () => {
    const exam = addDays(todayStr(), 5);
    const study = mk({ scheduledDate: todayStr(), examDate: exam, deadline: exam });
    const reviews = buildReviewItems(study);
    // 시험일 이후 복습 없음 + 중복 날짜 없음
    expect(reviews.every((r) => r.scheduledDate <= exam)).toBe(true);
    const dates = reviews.map((r) => r.scheduledDate);
    expect(new Set(dates).size).toBe(dates.length);
  });

  it("큰 덩어리를 25분 단위로 쪼갠다", () => {
    const chunks = splitIntoChunks(mk({ estimatedMinutes: 90 }), 25);
    expect(chunks.length).toBe(4);
    expect(chunks.every((c) => c.estimatedMinutes <= 25)).toBe(true);
  });

  it("오늘 학습량이 한도를 넘으면 over=true", () => {
    const items = [mk({ estimatedMinutes: 150, scheduledDate: todayStr() })];
    expect(computeTodayWorkload(items, 120).over).toBe(true);
  });
});
