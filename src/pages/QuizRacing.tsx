import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Trophy, CheckCircle2, XCircle, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface Question {
  id: string;
  question: string;
  options: string[];
  answer: string;
  hint: string;
}

const QUESTIONS: Question[] = [
  {
    id: "q1",
    question: "파이썬에서 화면에 결과값을 출력할 때 사용하는 함수는?",
    options: ["input()", "print()", "display()"],
    answer: "print()",
    hint: "화면 출력은 print() 함수를 사용합니다.",
  },
  {
    id: "q2",
    question: "여러 개의 데이터를 순서대로 담을 수 있는 파이썬의 자료형은?",
    options: ["정수(int)", "문자열(str)", "리스트(list)"],
    answer: "리스트(list)",
    hint: "여러 데이터를 순서대로 담는 상자는 리스트(list)입니다.",
  },
  {
    id: "q3",
    question: "조건이 참(True)일 때만 특정 코드를 실행하게 만드는 제어문은?",
    options: ["for", "if", "def"],
    answer: "if",
    hint: "특정 조건에서만 실행되게 하려면 if를 사용합니다.",
  },
];

/** 다른 팀원들의 고정 점수 (데모용). 내 점수는 퀴즈 결과로 채워진다. */
const TEAMMATES = [
  { name: "현승재", score: 100 },
  { name: "최민기", score: 80 },
  { name: "이상원", score: 60 },
];

const QuizRacing = () => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const correctCount = QUESTIONS.filter((q) => answers[q.id] === q.answer).length;
  const myScore = Math.round((correctCount / QUESTIONS.length) * 100);

  const racers = [...TEAMMATES, { name: "이동현(나)", score: submitted ? myScore : 0 }].sort(
    (a, b) => b.score - a.score,
  );

  const handleSubmit = () => setSubmitted(true);
  const reset = () => {
    setAnswers({});
    setSubmitted(false);
  };

  return (
    <div className="min-h-screen gradient-soft">
      <header className="border-b bg-background/70 backdrop-blur-md sticky top-0 z-10">
        <div className="container py-4 flex items-center gap-3">
          <div className="p-2 rounded-xl gradient-primary shadow-elegant">
            <Trophy className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">복습 퀴즈 &amp; 레이싱</h1>
            <p className="text-xs text-muted-foreground">퀴즈를 풀고 팀원들과 순위를 겨뤄보세요</p>
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-3xl">
        <Button asChild variant="ghost" className="mb-4 -ml-2 text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> 플래너로 돌아가기
          </Link>
        </Button>

        <Tabs defaultValue="quiz">
          <TabsList className="mb-4">
            <TabsTrigger value="quiz">📝 오늘의 복습 퀴즈</TabsTrigger>
            <TabsTrigger value="racing">🏇 레이싱 랭킹</TabsTrigger>
          </TabsList>

          {/* 퀴즈 탭 */}
          <TabsContent value="quiz" className="mt-0 space-y-4">
            {QUESTIONS.map((q, i) => {
              const picked = answers[q.id];
              const isCorrect = picked === q.answer;
              return (
                <Card key={q.id} className="p-5 shadow-card">
                  <p className="font-semibold mb-3">
                    Q{i + 1}. {q.question}
                  </p>
                  <RadioGroup
                    value={picked ?? ""}
                    onValueChange={(v) => !submitted && setAnswers({ ...answers, [q.id]: v })}
                    className="space-y-1.5"
                  >
                    {q.options.map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <RadioGroupItem value={opt} id={`${q.id}-${opt}`} disabled={submitted} />
                        <Label htmlFor={`${q.id}-${opt}`} className="cursor-pointer font-normal">
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {submitted && (
                    <div
                      className={`mt-3 flex items-start gap-2 rounded-md p-2.5 text-sm ${
                        isCorrect ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"
                      }`}
                    >
                      {isCorrect ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                      )}
                      <span>{isCorrect ? "정답입니다!" : `💡 ${q.hint}`}</span>
                    </div>
                  )}
                </Card>
              );
            })}

            {!submitted ? (
              <Button
                variant="hero"
                className="w-full"
                disabled={Object.keys(answers).length < QUESTIONS.length}
                onClick={handleSubmit}
              >
                정답 제출 및 채점하기
              </Button>
            ) : (
              <Card className="p-6 shadow-card text-center">
                <p className="text-3xl font-bold mb-1">🎯 {myScore}점</p>
                <p className="text-muted-foreground mb-4">
                  {QUESTIONS.length}문제 중 {correctCount}문제 정답
                </p>
                {myScore === 100 ? (
                  <p className="text-success font-semibold mb-4">🎉 만점! 레이싱 랭킹에서 1등을 확인하세요!</p>
                ) : (
                  <p className="text-muted-foreground mb-4">틀린 문제를 복습하고 다시 도전해 보세요!</p>
                )}
                <Button variant="outline" onClick={reset}>
                  다시 풀기
                </Button>
              </Card>
            )}
          </TabsContent>

          {/* 레이싱 탭 */}
          <TabsContent value="racing" className="mt-0">
            <Card className="p-6 shadow-card space-y-5">
              <h2 className="text-lg font-bold">🔥 실시간 스터디 레이싱</h2>
              {!submitted && (
                <p className="text-sm text-muted-foreground bg-muted/50 rounded-md p-2.5">
                  퀴즈를 먼저 풀면 내 말(🏇)이 결승선을 향해 달려요!
                </p>
              )}
              {racers.map((racer, index) => (
                <div key={racer.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-medium">
                      <Badge variant={index === 0 ? "default" : "secondary"} className="mr-2">
                        {index + 1}등
                      </Badge>
                      {racer.name}
                    </span>
                    <span className="text-sm text-muted-foreground">{racer.score}%</span>
                  </div>
                  <div className="relative h-12 rounded-xl bg-muted overflow-hidden">
                    <Flag className="h-5 w-5 absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-1000"
                      style={{ left: `${racer.score * 0.85}%` }}
                    >
                      🏇
                    </div>
                  </div>
                </div>
              ))}
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default QuizRacing;
