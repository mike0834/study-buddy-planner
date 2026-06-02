import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Trash2, Plus, BookMarked } from "lucide-react";
import { toast } from "sonner";
import { Subject, SubjectColor } from "@/types/study";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  subjects: Subject[];
  onChange: (subjects: Subject[]) => void;
  /** 해당 과목을 사용 중인 학습 항목 수 (삭제 경고용) */
  itemCountBySubject: Record<string, number>;
}

const COLOR_OPTIONS: Array<{ value: SubjectColor; label: string; swatch: string }> = [
  { value: "blue", label: "파랑", swatch: "bg-blue-500" },
  { value: "green", label: "초록", swatch: "bg-green-500" },
  { value: "purple", label: "보라", swatch: "bg-purple-500" },
  { value: "orange", label: "주황", swatch: "bg-orange-500" },
  { value: "pink", label: "분홍", swatch: "bg-pink-500" },
  { value: "teal", label: "청록", swatch: "bg-teal-500" },
];

export const subjectColorClass = (color: SubjectColor): string =>
  COLOR_OPTIONS.find((c) => c.value === color)?.swatch ?? "bg-blue-500";

export const SubjectManager = ({ open, onOpenChange, subjects, onChange, itemCountBySubject }: Props) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState<SubjectColor>("blue");

  const addSubject = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (!trimmed) return;
    if (subjects.some((s) => s.name === trimmed)) {
      toast.warning("이미 등록된 과목이에요.");
      return;
    }
    const subject: Subject = {
      id: crypto.randomUUID(),
      name: trimmed,
      color,
      createdAt: new Date().toISOString(),
    };
    onChange([...subjects, subject]);
    setName("");
    toast.success(`'${trimmed}' 과목이 등록됐어요.`);
  };

  const removeSubject = (subject: Subject) => {
    const inUse = itemCountBySubject[subject.name] ?? 0;
    if (inUse > 0) {
      toast.warning(`'${subject.name}' 과목에 학습 항목 ${inUse}개가 있어요. 항목을 먼저 정리해주세요.`);
      return;
    }
    onChange(subjects.filter((s) => s.id !== subject.id));
    toast.success(`'${subject.name}' 과목을 삭제했어요.`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookMarked className="h-5 w-5 text-primary" /> 과목 관리
          </DialogTitle>
          <DialogDescription>
            공부할 과목을 먼저 등록하세요. 학습 항목은 등록된 과목 안에서 추가할 수 있어요.
          </DialogDescription>
        </DialogHeader>

        {/* 과목 추가 폼 */}
        <form onSubmit={addSubject} className="space-y-3">
          <div className="space-y-1.5">
            <Label>과목 이름</Label>
            <div className="flex gap-2">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예) 자료구조, 영어 회화, 토익..."
              />
              <Button type="submit" variant="hero" className="shrink-0">
                <Plus className="h-4 w-4" /> 등록
              </Button>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>과목 색상</Label>
            <div className="flex gap-2">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={`h-8 w-8 rounded-full ${c.swatch} transition-transform ${
                    color === c.value ? "ring-2 ring-offset-2 ring-primary scale-110" : "opacity-60 hover:opacity-100"
                  }`}
                />
              ))}
            </div>
          </div>
        </form>

        {/* 등록된 과목 목록 */}
        <div className="space-y-2 mt-2">
          <Label className="text-muted-foreground">등록된 과목 ({subjects.length}개)</Label>
          {subjects.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center bg-muted/40 rounded-lg">
              아직 등록된 과목이 없어요. 위에서 첫 과목을 등록해 보세요!
            </p>
          ) : (
            <ul className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {subjects.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 bg-background"
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`h-3.5 w-3.5 rounded-full ${subjectColorClass(s.color)}`} />
                    <span className="font-medium">{s.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      항목 {itemCountBySubject[s.name] ?? 0}개
                    </Badge>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => removeSubject(s)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
