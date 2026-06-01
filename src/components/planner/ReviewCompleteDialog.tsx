import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { StudyItem } from "@/types/study";
import { Brain } from "lucide-react";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  item: StudyItem | null;
  onSubmit: (understanding: number, wrongCount: number) => void;
}

export const ReviewCompleteDialog = ({ open, onOpenChange, item, onSubmit }: Props) => {
  const [understanding, setUnderstanding] = useState(3);
  const [wrongCount, setWrongCount] = useState(0);

  useEffect(() => {
    if (open) {
      setUnderstanding(3);
      setWrongCount(0);
    }
  }, [open]);

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" /> 복습 결과 입력
          </DialogTitle>
          <DialogDescription>
            오늘의 복습은 어땠나요? 결과에 따라 다음 복습 일정이 자동으로 조정돼요.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-md bg-muted/50 p-3 text-sm">
            <div className="font-semibold">{item.subject}</div>
            <div className="text-muted-foreground text-xs mt-0.5">{item.content}</div>
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
          <Button variant="hero" onClick={() => onSubmit(understanding, wrongCount)}>
            완료
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
