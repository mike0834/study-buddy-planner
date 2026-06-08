import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StudyItem } from "@/types/study";
import { loadTimer, saveTimer, clearTimer, TimerState } from "@/lib/storage";
import { Timer, Play, Pause, RotateCcw, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  /** 오늘 할 미완료 학습 항목 (타이머로 측정할 대상 후보) */
  items: StudyItem[];
  /** 학습 완료 시: 선택한 항목 id(자유 학습이면 null)와 측정된 분 단위 시간 */
  onComplete: (itemId: string | null, minutes: number) => void;
}

const FREE = "__free__";

const fmt = (ms: number) => {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
};

const elapsedOf = (t: TimerState) => t.baseMs + (t.startTs ? Date.now() - t.startTs : 0);

export const StudyTimer = ({ items, onComplete }: Props) => {
  const [timer, setTimer] = useState<TimerState>(
    () => loadTimer() ?? { itemId: null, baseMs: 0, startTs: null },
  );
  // 1초마다 다시 그리기 위한 더미 상태
  const [, setTick] = useState(0);
  const tickRef = useRef<ReturnType<typeof setInterval>>();

  const running = timer.startTs !== null;
  const elapsed = elapsedOf(timer);

  // 상태 변경 시 localStorage 동기화 (새로고침해도 이어짐)
  useEffect(() => {
    saveTimer(timer);
  }, [timer]);

  // 측정 중일 때만 1초 단위로 화면 갱신
  useEffect(() => {
    if (running) {
      tickRef.current = setInterval(() => setTick((n) => n + 1), 1000);
      return () => clearInterval(tickRef.current);
    }
  }, [running]);

  // 선택된 항목이 삭제/완료되어 더 이상 후보에 없으면 자유 학습으로 되돌림
  useEffect(() => {
    if (timer.itemId && !items.some((i) => i.id === timer.itemId)) {
      setTimer((t) => ({ ...t, itemId: null }));
    }
  }, [items, timer.itemId]);

  const selected = items.find((i) => i.id === timer.itemId) ?? null;

  const handleStart = () =>
    setTimer((t) => (t.startTs ? t : { ...t, startTs: Date.now() }));

  const handlePause = () =>
    setTimer((t) =>
      t.startTs ? { ...t, baseMs: t.baseMs + (Date.now() - t.startTs), startTs: null } : t,
    );

  const handleReset = () => {
    setTimer((t) => ({ ...t, baseMs: 0, startTs: null }));
    clearTimer();
  };

  const handleSelect = (v: string) =>
    setTimer((t) => ({ ...t, itemId: v === FREE ? null : v }));

  const handleComplete = () => {
    const ms = elapsedOf(timer);
    const minutes = Math.max(1, Math.round(ms / 60000));
    if (ms <= 0) {
      toast.info("아직 측정된 시간이 없어요. 타이머를 시작해 주세요.");
      return;
    }
    if (timer.itemId) {
      onComplete(timer.itemId, minutes);
    } else {
      onComplete(null, minutes);
      toast.success(`${minutes}분 집중했어요! 잘했어요 👏`);
    }
    handleReset();
  };

  return (
    <Card
      className={`relative overflow-hidden border-2 shadow-elegant transition-colors ${
        running ? "border-primary/50" : "border-primary/15"
      }`}
    >
      {/* 배경 그라데이션 */}
      <div className={`absolute inset-0 -z-10 ${running ? "gradient-primary opacity-[0.08]" : "gradient-soft"}`} />

      <div className="p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-5">
          <div className={`p-2 rounded-xl ${running ? "gradient-primary text-primary-foreground shadow-elegant" : "bg-primary/10 text-primary"}`}>
            <Timer className="h-5 w-5" />
          </div>
          <span className="text-base font-bold">학습 타이머</span>
          {running && (
            <span className="flex items-center gap-1.5 text-xs font-semibold text-primary ml-1">
              <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> 측정 중
            </span>
          )}
        </div>

        <div className="grid md:grid-cols-[1fr_auto] gap-6 md:gap-8 items-center">
          {/* 큰 시간 표시 */}
          <div className="order-1 md:order-2 text-center md:text-right">
            <div
              className={`font-mono font-bold tabular-nums leading-none text-6xl sm:text-7xl ${
                running ? "text-gradient" : "text-foreground/80"
              }`}
            >
              {fmt(elapsed)}
            </div>
            {selected ? (
              <p className="text-xs text-muted-foreground mt-2">
                예상 {selected.estimatedMinutes}분 · 완료 시 실제 시간 자동 기록
              </p>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">자유 학습 · 집중한 시간만 측정해요</p>
            )}
          </div>

          {/* 대상 선택 + 컨트롤 */}
          <div className="order-2 md:order-1 space-y-3 w-full">
            <Select value={timer.itemId ?? FREE} onValueChange={handleSelect} disabled={running}>
              <SelectTrigger className="h-11 text-base">
                <SelectValue placeholder="무엇을 공부할까요?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={FREE}>⏱️ 자유 학습 (항목 없이 시간만 측정)</SelectItem>
                {items.map((i) => (
                  <SelectItem key={i.id} value={i.id}>
                    {i.kind === "review" ? `🔄 복습${i.reviewStage ? ` ${i.reviewStage}차` : ""}` : "📖 학습"} · {i.subject} · {i.content}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex flex-wrap gap-2">
              {running ? (
                <Button size="lg" variant="outline" className="flex-1 min-w-[120px]" onClick={handlePause}>
                  <Pause className="h-5 w-5" /> 일시정지
                </Button>
              ) : (
                <Button size="lg" variant="hero" className="flex-1 min-w-[120px]" onClick={handleStart}>
                  <Play className="h-5 w-5" /> {elapsed > 0 ? "이어서 시작" : "시작"}
                </Button>
              )}
              <Button size="lg" variant="default" className="flex-1 min-w-[120px]" onClick={handleComplete} disabled={elapsed === 0}>
                <CheckCircle2 className="h-5 w-5" /> 학습 완료
              </Button>
              <Button size="lg" variant="ghost" onClick={handleReset} disabled={elapsed === 0}>
                <RotateCcw className="h-5 w-5" /> 초기화
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
