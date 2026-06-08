import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StudyItem } from "@/types/study";
import { Brain, Clock } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: StudyItem | null;
  /** 타이머로 측정된 실제 학습 시간(분). 입력란에 자동 채워진다. */
  defaultMinutes?: number;
  onSubmit: (understanding: number, wrongCount: number, actualMinutes: number) => void;
}

export const ReviewCompleteDialog = ({ open, onOpenChange, item, defaultMinutes, onSubmit }: Props) => {
  const [understanding, setUnderstanding] = useState(3);
  const [wrongCount, setWrongCount] = useState(0);
  const [actualMinutes, setActualMinutes] = useState(0);

  useEffect(() => {
    if (open) {
      setUnderstanding(3);
      setWrongCount(0);
      // 타이머로 측정된 시간이 있으면 그 값을, 없으면 예상 시간을 기본값으로
      setActualMinutes(defaultMinutes ?? item?.estimatedMinutes ?? 0);
    }
  }, [open, defaultMinutes, item]);

  if (!item) return null;

  const isReview = item.kind === "review";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" /> {isReview ? "복습 결과 입력" : "학습 결과 입력"}
          </DialogTitle>
          <DialogDescription>
            {isReview
              ? "오늘의 복습은 어땠나요? 결과에 따라 다음 복습 일정이 자동으로 조정돼요."
              : "오늘의 학습은 어땠나요? 실제 학습 시간과 이해도를 기록해요."}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <div className="font-semibold">{item.subject}</div>
            <div className="text-muted-foreground text-xs mt-0.5">{item.content}</div>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-muted-foreground" /> 실제 학습 시간(분)
            </Label>
            <Input
              type="number"
              min={0}
              value={actualMinutes}
              onChange={(e) => setActualMinutes(Math.max(0, Number(e.target.value)))}
            />
            {defaultMinutes != null && (
              <p className="text-xs text-muted-foreground">⏱️ 타이머로 측정된 시간이 자동 입력됐어요. 필요하면 수정하세요.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label>이해도 (1: 전혀 모름 😵 ~ 5: 완벽 이해 ✨)</Label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setUnderstanding(n)}
                  className={`flex-1 py-2.5 rounded-md border font-semibold transition-all ${
                    understanding === n
                      ? "bg-primary text-primary-foreground border-primary shadow-elegant"
                      : "border-border hover:bg-accent"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label>오답 개수</Label>
            <Input
              type="number"
              min={0}
              value={wrongCount}
              onChange={(e) => setWrongCount(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {understanding <= 2 || wrongCount >= 3
              ? "→ 보충 복습이 내일 추가되고, 이후 복습 간격이 단축돼요."
              : understanding === 5 && wrongCount === 0
              ? "→ 이해도가 매우 높아 다음 복습 1회를 생략해요."
              : "→ 기본 복습 일정을 유지해요."}
          </p>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>취소</Button>
          <Button variant="hero" onClick={() => onSubmit(understanding, wrongCount, actualMinutes)}>
            완료
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
