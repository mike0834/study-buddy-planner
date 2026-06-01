import { Card } from "@/components/ui/card";
import { Sparkles, AlertTriangle, Lightbulb, CheckCircle2 } from "lucide-react";
import { buildFeedback, buildRecommendations } from "@/lib/adaptive";
import { StudyItem } from "@/types/study";

const toneStyles: Record<string, string> = {
  info: "bg-primary/10 text-primary border-primary/20",
  warn: "bg-warning/10 text-warning border-warning/30",
  success: "bg-success/10 text-success border-success/30",
};

const ToneIcon = ({ tone }: { tone: string }) => {
  if (tone === "warn") return <AlertTriangle className="h-4 w-4" />;
  if (tone === "success") return <CheckCircle2 className="h-4 w-4" />;
  return <Lightbulb className="h-4 w-4" />;
};

export const FeedbackPanel = ({ items }: { items: StudyItem[] }) => {
  const feedback = buildFeedback(items);
  const recs = buildRecommendations(items);
  return (
    <Card className="p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">적응형 피드백</h3>
      </div>
      <div className={`flex items-start gap-2 rounded-lg border p-3 mb-4 ${toneStyles[feedback.tone]}`}>
        <ToneIcon tone={feedback.tone} />
        <p className="text-sm leading-relaxed">{feedback.message}</p>
      </div>
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
          개인 맞춤 추천
        </p>
        {recs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-2">
            💡 학습 데이터가 쌓이면 과목별 맞춤 추천이 여기에 나타나요.
          </p>
        ) : (
          recs.map((r, i) => (
            <div key={i} className={`flex items-start gap-2 rounded-lg border p-3 ${toneStyles[r.tone]}`}>
              <ToneIcon tone={r.tone} />
              <p className="text-sm">{r.message}</p>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
