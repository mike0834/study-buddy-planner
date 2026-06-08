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
    if (ms < 30000) {
      toast.info("아직 측정된 시간이 거의 없어요. 타이머를 시작해 주세요.");
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
    <Card className="mt-4 p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3">
        <div className={`p-2 rounded-lg ${running ? "bg-primary/15 text-primary" : "bg-muted text-muted-foreground"}`}>
          <Timer className="h-4 w-4" />
        </div>
        <span className="text-sm font-semibold">학습 타이머</span>
        {running && (
          <span className="flex items-center gap-1 text-xs text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> 측정 중
          </span>
        )}
      </div>

      <div className="grid sm:grid-cols-[1fr_auto] gap-4 items-center">
        <div className="space-y-3">
          <Select value={timer.itemId ?? FREE} onValueChange={handleSelect} disabled={running}>
            <SelectTrigger>
              <SelectValue placeholder="무엇을 공부할까요?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={FREE}>⏱️ 자유 학습 (항목 없이 시간만 측정)</SelectItem>
              {items.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.subject} · {i.content}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selected && (
            <p className="text-xs text-muted-foreground">
              예상 시간 {selected.estimatedMinutes}분 · 완료하면 실제 시간이 기록돼요
            </p>
          )}
        </div>

        <div className="text-center">
          <div className={`font-mono font-bold tabular-nums leading-none ${running ? "text-primary" : ""} text-4xl`}>
            {fmt(elapsed)}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {running ? (
          <Button variant="outline" className="flex-1" onClick={handlePause}>
            <Pause className="h-4 w-4" /> 일시정지
          </Button>
        ) : (
          <Button variant="hero" className="flex-1" onClick={handleStart}>
            <Play className="h-4 w-4" /> {elapsed > 0 ? "이어서 시작" : "시작"}
          </Button>
        )}
        <Button variant="ghost" onClick={handleReset} disabled={elapsed === 0}>
          <RotateCcw className="h-4 w-4" /> 초기화
        </Button>
        <Button variant="default" onClick={handleComplete} disabled={elapsed < 30000}>
          <CheckCircle2 className="h-4 w-4" /> 학습 완료
        </Button>
      </div>
    </Card>
  );
};
