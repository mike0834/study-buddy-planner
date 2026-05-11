import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Difficulty, StudyItem } from "@/types/study";
import { todayStr } from "@/lib/adaptive";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onSave: (item: StudyItem) => void;
  editing?: StudyItem | null;
}

const empty = (): Omit<StudyItem, "id" | "createdAt" | "postponeCount"> => ({
  subject: "",
  content: "",
  deadline: todayStr(),
  estimatedMinutes: 30,
  difficulty: "보통",
  completed: false,
  scheduledDate: todayStr(),
});

export const StudyForm = ({ open, onOpenChange, onSave, editing }: Props) => {
  const [form, setForm] = useState(empty());

  useEffect(() => {
    if (editing) {
      const { id, createdAt, postponeCount, ...rest } = editing;
      setForm(rest);
    } else {
      setForm(empty());
    }
  }, [editing, open]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.content.trim()) return;
    const item: StudyItem = editing
      ? { ...editing, ...form }
      : {
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
          postponeCount: 0,
          ...form,
        };
    onSave(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{editing ? "학습 항목 수정" : "새 학습 항목"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>과목명</Label>
              <Input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="예) 수학"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label>난이도</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => setForm({ ...form, difficulty: v as Difficulty })}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="쉬움">쉬움</SelectItem>
                  <SelectItem value="보통">보통</SelectItem>
                  <SelectItem value="어려움">어려움</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>학습 내용</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              placeholder="예) 미적분 3단원 예제 풀기"
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
              <Label>마감일</Label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                required
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
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>취소</Button>
            <Button type="submit" variant="hero">{editing ? "수정" : "추가"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
