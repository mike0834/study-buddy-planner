import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, BookOpen, BookMarked, Trophy, Swords, ArrowLeft, CheckCircle2, ListTodo, TrendingUp, Calendar, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { StudyItem, Subject } from "@/types/study";
import { loadItems, loadMeta, loadSubjects, saveItems, saveMeta, saveSubjects } from "@/lib/storage";
import { adjustReviewsAfterCompletion, buildReviewItems, rolloverItems, todayStr } from "@/lib/adaptive";
import { StatCard } from "@/components/planner/StatCard";
import { TaskList } from "@/components/planner/TaskList";
import { StudyForm } from "@/components/planner/StudyForm";
import { SubjectProgress } from "@/components/planner/SubjectProgress";
import { FeedbackPanel } from "@/components/planner/FeedbackPanel";
import { ReviewCompleteDialog } from "@/components/planner/ReviewCompleteDialog";
import { SubjectManager, subjectColorClass } from "@/components/planner/SubjectManager";
import { SubjectCard } from "@/components/planner/SubjectCard";
import { StudyStatisticsDashboard } from "@/components/planner/StudyStatisticsDashboard";
import { LoginForm } from "@/components/auth/LoginForm";
import { AuthUser, clearAuthUser, loadAuthUser, saveAuthUser } from "@/lib/auth";

const Index = () => {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [items, setItems] = useState<StudyItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [subjectManagerOpen, setSubjectManagerOpen] = useState(false);
  const [editing, setEditing] = useState<StudyItem | null>(null);
  const [reviewDialogItem, setReviewDialogItem] = useState<StudyItem | null>(null);
  /** 현재 들어가 있는 과목 (null이면 홈 화면) */
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

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
    setSubjects(loadSubjects());
  }, []);

  useEffect(() => {
    saveItems(items);
  }, [items]);

  const handleSubjectsChange = (next: Subject[]) => {
    setSubjects(next);
    saveSubjects(next);
  };
  useEffect(() => {
    setAuthUser(loadAuthUser());
  }, []);

  /** 과목별 학습 항목 수 (과목 삭제 시 경고에 사용) */
  const itemCountBySubject = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.subject] = (counts[item.subject] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  /** 현재 선택된 과목 객체 */
  const selectedSubject = useMemo(
    () => subjects.find((s) => s.id === selectedSubjectId) ?? null,
    [subjects, selectedSubjectId],
  );

  /** 선택된 과목의 학습 항목들 */
  const subjectItems = useMemo(
    () => (selectedSubject ? items.filter((i) => i.subject === selectedSubject.name) : []),
    [items, selectedSubject],
  );

  const today = todayStr();
  const todays = useMemo(() => items.filter((i) => i.scheduledDate === today), [items, today]);
  const todayReviews = useMemo(() => todays.filter((i) => i.kind === "review"), [todays]);
  const todayDone = todays.filter((i) => i.completed).length;
  const todayRemaining = todays.length - todayDone;
  const totalDone = items.filter((i) => i.completed).length;
  const overallPct = items.length ? Math.round((totalDone / items.length) * 100) : 0;
  const todayPct = todays.length ? Math.round((todayDone / todays.length) * 100) : 0;

  const handleToggle = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (!target) return;
    // 완료로 토글 시: 학습/복습 모두 결과 입력 다이얼로그
    if (!target.completed) {
      setReviewDialogItem(target);
      return;
    }
    // 완료 해제
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, completed: false, completedAt: undefined } : it)),
    );
  };

  const handleReviewSubmit = (understanding: number, wrongCount: number) => {
    if (!reviewDialogItem) return;
    const completed: StudyItem = {
      ...reviewDialogItem,
      completed: true,
      completedAt: new Date().toISOString(),
      understanding,
      wrongCount,
    };
    setItems((prev) => {
      let next = prev.map((it) => (it.id === completed.id ? completed : it));
      next = adjustReviewsAfterCompletion(next, completed, { understanding, wrongCount });
      return next;
    });
    if (understanding <= 2 || wrongCount >= 3) {
      toast.warning("이해도가 낮아요. 보충 복습을 추가했어요.");
    } else if (understanding === 5 && wrongCount === 0) {
      toast.success("완벽해요! 다음 복습 1회를 생략했어요.");
    } else {
      toast.success("복습 완료! 잘하고 있어요.");
    }
    setReviewDialogItem(null);
  };

  const handleSave = (item: StudyItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      if (exists) return prev.map((p) => (p.id === item.id ? item : p));
      // 새 학습 항목 → 망각곡선 복습 자동 생성
      const reviews = item.kind === "study" || !item.kind ? buildReviewItems(item) : [];
      return [...prev, item, ...reviews];
    });
    if (!editing && (item.kind === "study" || !item.kind)) {
      toast.success("학습 항목과 망각곡선 복습 일정이 자동 생성됐어요.");
    } else {
      toast.success("항목이 수정되었어요.");
    }
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    setItems((prev) => {
      // 원학습 삭제 시 자식 복습도 함께 제거
      const target = prev.find((p) => p.id === id);
      if (target && (target.kind === "study" || !target.kind)) {
        return prev.filter((p) => p.id !== id && p.parentId !== id);
      }
      return prev.filter((p) => p.id !== id);
    });
    toast.success("항목이 삭제되었어요.");
  };

  const openNew = () => {
    // 과목이 하나도 없으면 과목 등록부터 안내
    if (subjects.length === 0) {
      toast.info("먼저 공부할 과목을 등록해주세요!");
      setSubjectManagerOpen(true);
      return;
    }
    setEditing(null);
    setFormOpen(true);
  };
  const openEdit = (item: StudyItem) => {
    setEditing(item);
    setFormOpen(true);
  };
const handleLogin = (user: AuthUser) => {
  saveAuthUser(user);
  setAuthUser(user);
  toast.success(`${user.name}님, 환영합니다!`);
  };

const handleLogout = () => {
  clearAuthUser();
  setAuthUser(null);
  toast.info("로그아웃되었습니다.");
  };

if (!authUser) {
  return <LoginForm onLogin={handleLogin} />;
}
  
  return (
    <div className="min-h-screen gradient-soft">
      <header className="border-b bg-background/70 backdrop-blur-md sticky top-0 z-10">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl gradient-primary shadow-elegant">
              <BookOpen className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">RevoStudy · 적응형 학습 플래너</h1>
              <p className="text-xs text-muted-foreground">에빙하우스 망각곡선 기반 스마트 복습 관리</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link to="/quiz">
                <Trophy className="h-4 w-4" /> 복습 퀴즈
              </Link>
            </Button>
            <Button asChild variant="hero">
              <Link to="/party-siege">
                <Swords className="h-4 w-4" /> 파티 공성전
              </Link>
            </Button>
            <span className="hidden sm:inline text-sm text-muted-foreground">
              {authUser.name}님
            </span>
            <Button variant="outline" onClick={() => setSubjectManagerOpen(true)}>
              <BookMarked className="h-4 w-4" /> 과목 관리
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {selectedSubject ? (
          /* ===== 과목 상세 화면 ===== */
          <section>
            <Button
              variant="ghost"
              className="mb-4 -ml-2 text-muted-foreground"
              onClick={() => setSelectedSubjectId(null)}
            >
              <ArrowLeft className="h-4 w-4" /> 모든 과목 보기
            </Button>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <span className={`h-5 w-5 rounded-full ${subjectColorClass(selectedSubject.color)}`} />
                <div>
                  <h2 className="text-2xl font-bold">{selectedSubject.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    전체 {subjectItems.length}개 · 완료 {subjectItems.filter((i) => i.completed).length}개
                  </p>
                </div>
              </div>
              <Button variant="hero" onClick={openNew}>
                <Plus className="h-4 w-4" /> 학습 항목 추가
              </Button>
            </div>
            <TaskList
              items={subjectItems}
              onToggle={handleToggle}
              onEdit={openEdit}
              onDelete={handleDelete}
              showPriority
              emptyMessage={`'${selectedSubject.name}' 과목에 아직 학습 항목이 없어요. 위의 버튼으로 첫 항목을 추가해 보세요!`}
            />
          </section>
        ) : (
          /* ===== 홈 화면 ===== */
          <>
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
              title="오늘 복습"
              value={todayReviews.length}
              subtitle={`망각곡선 자동 배정`}
              icon={RotateCcw}
              accent="accent"
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
              accent="success"
            />
          </div>
        </section>

        {/* 내 과목 - 과목 카드를 눌러 들어가서 학습 항목을 관리 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">
              내 <span className="text-gradient">과목</span>
            </h2>
            <Button variant="outline" size="sm" onClick={() => setSubjectManagerOpen(true)}>
              <Plus className="h-4 w-4" /> 과목 추가
            </Button>
          </div>
          {subjects.length === 0 ? (
            <Card className="p-10 text-center shadow-card">
              <p className="text-muted-foreground mb-4">
                아직 등록된 과목이 없어요. 먼저 공부할 과목을 등록해 보세요!
              </p>
              <Button variant="hero" onClick={() => setSubjectManagerOpen(true)}>
                <BookMarked className="h-4 w-4" /> 첫 과목 등록하기
              </Button>
            </Card>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((s) => (
                <SubjectCard
                  key={s.id}
                  subject={s}
                  items={items}
                  onClick={() => setSelectedSubjectId(s.id)}
                />
              ))}
            </div>
          )}
        </section>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs defaultValue="today">
              <TabsList className="mb-4">
                <TabsTrigger value="today">오늘의 학습</TabsTrigger>
                <TabsTrigger value="reviews">오늘의 복습</TabsTrigger>
                <TabsTrigger value="all">전체 목록</TabsTrigger>
                <TabsTrigger value="stats">학습 통계</TabsTrigger>
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
              <TabsContent value="reviews" className="mt-0">
                <TaskList
                  items={todayReviews}
                  onToggle={handleToggle}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  showPriority
                  emptyMessage="오늘 예정된 복습이 없어요."
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
              <TabsContent value="stats" className="mt-0">
                <StudyStatisticsDashboard items={items} subjects={subjects} />
              </TabsContent>
            </Tabs>
          </div>
          <div className="space-y-6">
            <FeedbackPanel items={items} />
            <SubjectProgress items={items} />
          </div>
        </div>
          </>
        )}
      </main>

      <StudyForm
        open={formOpen}
        onOpenChange={setFormOpen}
        onSave={handleSave}
        editing={editing}
        subjects={subjects}
        fixedSubject={selectedSubject?.name}
        onManageSubjects={() => {
          setFormOpen(false);
          setSubjectManagerOpen(true);
        }}
      />
      <SubjectManager
        open={subjectManagerOpen}
        onOpenChange={setSubjectManagerOpen}
        subjects={subjects}
        onChange={handleSubjectsChange}
        itemCountBySubject={itemCountBySubject}
      />
      <ReviewCompleteDialog
        open={!!reviewDialogItem}
        onOpenChange={(o) => !o && setReviewDialogItem(null)}
        item={reviewDialogItem}
        onSubmit={handleReviewSubmit}
      />
    </div>
  );
};

export default Index;
