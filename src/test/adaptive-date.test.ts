import { describe, it, expect } from "vitest";
import { todayStr, addDays, daysUntil } from "@/lib/adaptive";

describe("날짜 유틸 (시간대 안전)", () => {
  it("todayStr는 로컬 달력 기준 오늘 날짜를 반환한다", () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(
      now.getDate(),
    ).padStart(2, "0")}`;
    expect(todayStr()).toBe(expected);
  });

  it("addDays는 날짜를 밀리지 않고 정확히 더한다", () => {
    expect(addDays("2026-06-08", 1)).toBe("2026-06-09");
    expect(addDays("2026-06-08", 7)).toBe("2026-06-15");
    expect(addDays("2026-06-30", 1)).toBe("2026-07-01"); // 월 경계
    expect(addDays("2026-06-08", 0)).toBe("2026-06-08"); // 오늘 복습(+0)
  });

  it("오늘 날짜로 생성된 복습 항목은 todayStr와 정확히 일치한다", () => {
    // 오늘(+0) 복습은 '오늘 할 일' 필터(scheduledDate === todayStr())에 잡혀야 한다
    expect(addDays(todayStr(), 0)).toBe(todayStr());
  });

  it("daysUntil은 오늘은 0, 내일은 1을 반환한다", () => {
    expect(daysUntil(todayStr())).toBe(0);
    expect(daysUntil(addDays(todayStr(), 1))).toBe(1);
    expect(daysUntil(addDays(todayStr(), -1))).toBe(-1);
  });
});
