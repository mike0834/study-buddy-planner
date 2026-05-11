import { useEffect, useMemo, useState } from "react";
import { Plus, BookOpen, CheckCircle2, ListTodo, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { StudyItem } from "@/types/study";
import { loadItems, loadMeta, saveItems, saveMeta } from "@/lib/storage";
import { rolloverItems, todayStr } from "@/lib/adaptive";
import { StatCard } from "@/components/planner/StatCard";
import { TaskList } from "@/components/planner/TaskList";
import { StudyForm } from "@/components/planner/StudyForm";
import { SubjectProgress } from "@/components/planner/SubjectProgress";
import { FeedbackPanel } from "@/components/planner/FeedbackPanel";

const Index = () => {
  const [items, setItems] = useState<StudyItem[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<StudyItem | null>(null);

  useEffect(() => {
    const loaded = loadItems();
    const meta = loadMeta();
    const { items: rolled, changed } = rolloverItems(loaded, meta.lastRolloverDate);
    if (changed) {
      saveItems(rolled);
      toast.info("미완료 항목을 오늘로 이동했어요.");
    }
    saveMeta({ ...meta, lastRolloverDate: todayStr() });
    setItems(rolled);
  }, []);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const today = todayStr();
  const todays = useMemo(() => items.filter((i) => i.scheduledDate === today), [items, today]);
  const todayDone = todays.filter((i) => i.completed).length;
  const todayRemaining = todays.length - todayDone;
  const totalDone = items.filter((i) => i.completed).length;
  const overallPct = items.length ? Math.round((totalDone / items.length) * 100) : 0;
  const todayPct = todays.length ? Math.round((todayDone / todays.length) * 100) : 0;

  const handleToggle = (id: string) => {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? { ...it, completed: !it.completed, completedAt: !it.completed ? new Date().toISOString() : undefined }
          : it,
      ),
    );
  };

  const handleSave = (item: StudyItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      return exists ? prev.map((p) => (p.id === item.id ? item : p)) : [...prev, item];
    });
    toast.success(editing ? "항목이 수정되었어요." : "새 학습 항목이 추가되었어요.");
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id));
    toast.success("항목이 삭제되었어요.");
  };

  const openNew = () => {
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (item: StudyItem) => {
    setEditing(item);
    setFormOpen(true);
  };

  return (
    <div className="min-h-screen gradient-soft">
      <header className="border-b bg-background/70 backdrop-blur-md sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary shadow-elegant">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">적응형 학습 플래너</h1>
              <p className="text-xs text-muted-foreground">나에게 맞춰 진화하는 공부 계획</p>
            </div>
          </div>
          <Button variant="hero" onClick={openNew}>
            <Plus className="h-4 w-4" /> 학습 항목 추가
          </Button>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        <section>
          <h2 className="text-2xl font-bold mb-1">
            오늘의 <span className="text-gradient">학습 대시보드</span>
          </h2>
          <p className="text-muted-foreground mb-5 text-sm">
            {new Date().toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "long" })}
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="오늘 할 일"
              value={todays.length}
              subtitle={`완료 ${todayDone} · 남음 ${todayRemaining}`}
              icon={Calendar}
              progress={todayPct}
              accent="primary"
            />
            <StatCard
              title="오늘 완료"
              value={todayDone}
              subtitle={`달성률 ${todayPct}%`}
              icon={CheckCircle2}
              accent="success"
            />
            <StatCard
              title="남은 항목"
              value={todayRemaining}
              subtitle="오늘 안에 마무리해요"
              icon={ListTodo}
              accent="warning"
            />
            <StatCard
              title="전체 진도율"
              value={`${overallPct}%`}
              subtitle={`전체 ${items.length}개 중 ${totalDone}개 완료`}
              icon={TrendingUp}
              progress={overallPct}
              accent="accent"
            />
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="today">
              <TabsList className="mb-4">
                <TabsTrigger value="today">오늘의 학습</TabsTrigger>
                <TabsTrigger value="all">전체 학습 목록</TabsTrigger>
              </TabsList>
              <TabsContent value="today" className="mt-0">
                <TaskList
                  items={todays}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  showPriority
                  emptyMessage="오늘 계획된 학습이 없어요. 새로 추가해 보세요!"
                />
              </TabsContent>
              <TabsContent value="all" className="mt-0">
                <TaskList
                  items={items}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  emptyMessage="아직 등록된 학습 항목이 없어요."
                />
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-6">
            <FeedbackPanel items={items} />
            <SubjectProgress items={items} />
          </div>
        </div>
      </main>

      <StudyForm open={formOpen} onOpenChange={setFormOpen} onSave={handleSave} editing={editing} />
    </div>
  );
};

export default Index;
