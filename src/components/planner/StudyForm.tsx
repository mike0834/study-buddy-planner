import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Difficulty, StudyItem, Subject } from "@/types/study";
import { todayStr } from "@/lib/adaptive";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (item: StudyItem) => void;
  editing?: StudyItem | null;
  /** 등록된 과목 목록. 학습 항목은 이 중에서 과목을 선택한다. */
  subjects: Subject[];
  /** "과목 관리" 바로가기 */
  onManageSubjects: () => void;
}

const empty = (): Omit<StudyItem, "id" | "createdAt" | "postponeCount"> => ({
  subject: "",
  content: "",
  deadline: todayStr(),
  estimatedMinutes: 30,
  difficulty: "보통",
  completed: false,
  scheduledDate: todayStr(),
  kind: "study",
  examDate: "",
});

export const StudyForm = ({ open, onOpenChange, onSave, editing, subjects, onManageSubjects }: Props) => {
  const [form, setForm] = useState(empty());

  useEffect(() => {
    if (editing) {
      const { id, createdAt, postponeCount, ...rest } = editing;
      setForm({ ...empty(), ...rest });
    } else {
      setForm(empty());
    }
  }, [editing, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.content.trim()) return;
    const cleaned = { ...form, examDate: form.examDate || undefined };
    const item: StudyItem = editing
      ? { ...editing, ...cleaned }
      : {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          postponeCount: 0,
          ...cleaned,
          kind: "study",
        };
    onSave(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "학습 항목 수정" : "새 학습 항목"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>과목</Label>
              {subjects.length === 0 ? (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-muted-foreground"
                  onClick={onManageSubjects}
                >
                  먼저 과목을 등록해주세요 →
                </Button>
              ) : (
                <Select
                  value={form.subject || undefined}
                  onValueChange={(v) => setForm({ ...form, subject: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="과목을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((s) => (
                      <SelectItem key={s.id} value={s.name}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>난이도</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => setForm({ ...form, difficulty: v as Difficulty })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="쉬움">🟢 쉬움</SelectItem>
                  <SelectItem value="보통">🟡 보통</SelectItem>
                  <SelectItem value="어려움">🔴 어려움</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>학습 범위 / 내용</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="예) 3장 엔트로피 - 예제 1~10번"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>학습 예정일</Label>
              <Input
                type="date"
                value={form.scheduledDate}
                onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>시험일 (선택)</Label>
              <Input
                type="date"
                value={form.examDate || ""}
                onChange={(e) => setForm({ ...form, examDate: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>예상 시간(분)</Label>
              <Input
                type="number"
                min={5}
                step={5}
                value={form.estimatedMinutes}
                onChange={(e) => setForm({ ...form, estimatedMinutes: Number(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>마감일</Label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              required
            />
          </div>
          {!editing && (
            <p className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2.5 leading-relaxed">
              ✨ 새 학습 항목을 추가하면 <b>에빙하우스 망각곡선</b>에 따라 복습 일정이 자동으로 생성돼요
              (1일·3일·7일·14일·30일 후). 시험일을 입력하면 시험 전 압축 복습으로 조정됩니다.
            </p>
          )}
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>취소</Button>
            <Button type="submit" variant="hero">{editing ? "수정" : "추가"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
