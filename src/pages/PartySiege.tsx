import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Swords,
  School,
  BookOpen,
  Users,
  Plus,
  Shield,
  Flag,
  Crown,
  Flame,
  Trophy,
  Dot,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ====================== 데모 데이터 ====================== */
type Screen = "home" | "community" | "create" | "party" | "war";
type CommTab = "school" | "major";

interface Community {
  name: string;
  emoji: string;
  members: number;
  parties: number;
}

const COMMUNITIES: Record<CommTab, Community[]> = {
  school: [
    { name: "한국대학교", emoji: "🏫", members: 342, parties: 14 },
    { name: "서울공과대학교", emoji: "🏛️", members: 289, parties: 11 },
    { name: "미래과학대학교", emoji: "🔬", members: 201, parties: 8 },
    { name: "한빛여자대학교", emoji: "🌸", members: 176, parties: 6 },
  ],
  major: [
    { name: "컴퓨터공학과", emoji: "💻", members: 512, parties: 21 },
    { name: "경영학과", emoji: "📈", members: 430, parties: 17 },
    { name: "의예과", emoji: "🩺", members: 198, parties: 9 },
    { name: "디자인학과", emoji: "🎨", members: 223, parties: 10 },
  ],
};

interface Party {
  name: string;
  theme: string;
  cur: number;
  max: number;
  power: number;
  full: boolean;
}

const PARTIES: Party[] = [
  { name: "새벽반 정복단", theme: "기말고사 D-14 챌린지", cur: 5, max: 5, power: 1240, full: true },
  { name: "카페인 부스터", theme: "전공 기초 다지기", cur: 3, max: 5, power: 980, full: false },
  { name: "밤샘 길드", theme: "자격증 단기 합격", cur: 4, max: 6, power: 1100, full: false },
  { name: "조용한 도서관러", theme: "하루 4시간 루틴", cur: 2, max: 4, power: 760, full: false },
];

const MY_MEMBERS = [
  { name: "나(리더)", emoji: "👑" },
  { name: "지민", emoji: "🦊" },
  { name: "현우", emoji: "🐻" },
  { name: "수아", emoji: "🐰" },
  { name: "태양", emoji: "🦁" },
];

interface Contribution {
  name: string;
  emoji: string;
  hours: number;
  pct: number;
  tag?: "MVP" | "상승";
}

const CONTRIB: Contribution[] = [
  { name: "지민", emoji: "🦊", hours: 21.3, pct: 100, tag: "MVP" },
  { name: "나(리더)", emoji: "👑", hours: 18.7, pct: 88 },
  { name: "태양", emoji: "🦁", hours: 16.2, pct: 76 },
  { name: "현우", emoji: "🐻", hours: 14.8, pct: 69 },
  { name: "수아", emoji: "🐰", hours: 11.4, pct: 54, tag: "상승" },
];

const WAR_LOG = [
  { t: "방금", m: "🦊 지민님이 2.5시간 학습을 인증했습니다 (+2.5h)", c: "text-success" },
  { t: "3분 전", m: "🔥 상대 파티가 성벽을 5% 회복했습니다", c: "text-destructive" },
  { t: "12분 전", m: "👑 나(리더)님이 집중 모드 1시간 완료", c: "text-primary" },
  { t: "27분 전", m: "⚡ 우리 파티 점령률 60% 돌파!", c: "text-amber-500" },
  { t: "41분 전", m: "🐰 수아님이 연속 출석 7일 보너스 획득", c: "text-success" },
];

const MEDALS = ["🥇", "🥈", "🥉", "4", "5"];

/* ====================== 컴포넌트 ====================== */
const PartySiege = () => {
  const [screen, setScreen] = useState<Screen>("home");
  const [commTab, setCommTab] = useState<CommTab>("school");
  const [community, setCommunity] = useState("한국대학교");
  const [matching, setMatching] = useState(false);
  /** 점령 게이지 애니메이션용 (전쟁 화면 진입 시 0 → 57) */
  const [occupy, setOccupy] = useState(0);

  useEffect(() => {
    if (screen === "war") {
      setOccupy(0);
      const t = setTimeout(() => setOccupy(57), 150);
      return () => clearTimeout(t);
    }
  }, [screen]);

  const go = (s: Screen) => {
    setScreen(s);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const startMatching = () => {
    setMatching(true);
    setTimeout(() => {
      setMatching(false);
      go("war");
    }, 2200);
  };

  const breadcrumb: Record<Screen, string[]> = {
    home: ["파티 공성전"],
    community: ["파티 공성전", "커뮤니티"],
    create: ["파티 공성전", "커뮤니티", "파티 생성"],
    party: ["파티 공성전", "커뮤니티", "파티 대기실"],
    war: ["파티 공성전", "공성전 진행중"],
  };

  return (
    <div className="min-h-screen gradient-soft">
      {/* ===== 헤더 ===== */}
      <header className="border-b bg-background/70 backdrop-blur-md sticky top-0 z-10">
        <div className="container py-4 flex items-center gap-3">
          <div className="p-2 rounded-xl gradient-primary shadow-elegant">
            <Swords className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold leading-tight">파티 공성전</h1>
            <p className="text-xs text-muted-foreground">
              파티를 모집하고 공부 시간으로 성을 점령하세요
            </p>
          </div>
        </div>
      </header>

      <main className="container py-6 max-w-4xl">
        <Button asChild variant="ghost" className="mb-3 -ml-2 text-muted-foreground">
          <Link to="/">
            <ArrowLeft className="h-4 w-4" /> 플래너로 돌아가기
          </Link>
        </Button>

        {/* 진행 단계 */}
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
          {breadcrumb[screen].map((c, i) => (
            <span key={c} className="flex items-center gap-1">
              {i > 0 && <ChevronRight className="h-3 w-3" />}
              <span className={i === breadcrumb[screen].length - 1 ? "text-primary font-semibold" : ""}>
                {c}
              </span>
            </span>
          ))}
        </div>

        {/* ============ 화면 1: 홈 (커뮤니티 선택) ============ */}
        {screen === "home" && (
          <div className="space-y-6">
            <Card className="p-7 gradient-primary text-primary-foreground shadow-elegant border-0">
              <p className="text-xs font-bold opacity-80 mb-1">STUDY PARTY · SIEGE WAR</p>
              <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                <Swords className="h-6 w-6" /> 파티 공성전
              </h2>
              <p className="text-sm opacity-90 leading-relaxed">
                커뮤니티에서 파티를 모집하고, 랜덤 매칭된 상대 파티와
                <br />
                공부 시간으로 성을 점령하세요. 팀워크가 곧 전력입니다.
              </p>
              <div className="flex gap-3 mt-5">
                {[
                  { v: "128", l: "진행중 공성전" },
                  { v: "2,431", l: "참전 학습자" },
                  { v: "37", l: "활성 커뮤니티" },
                ].map((s) => (
                  <div key={s.l} className="bg-white/15 rounded-xl px-4 py-2 text-center">
                    <p className="text-2xl font-bold">{s.v}</p>
                    <p className="text-[11px] opacity-80">{s.l}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-lg">커뮤니티 선택</h3>
                <div className="bg-muted rounded-lg p-1 flex text-sm font-semibold">
                  <button
                    onClick={() => setCommTab("school")}
                    className={`px-4 py-1.5 rounded-md flex items-center gap-1 transition-colors ${
                      commTab === "school" ? "bg-background shadow text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <School className="h-4 w-4" /> 학교별
                  </button>
                  <button
                    onClick={() => setCommTab("major")}
                    className={`px-4 py-1.5 rounded-md flex items-center gap-1 transition-colors ${
                      commTab === "major" ? "bg-background shadow text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <BookOpen className="h-4 w-4" /> 학과별
                  </button>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {COMMUNITIES[commTab].map((c) => (
                  <button
                    key={c.name}
                    onClick={() => {
                      setCommunity(c.name);
                      go("community");
                    }}
                    className="text-left"
                  >
                    <Card className="p-5 shadow-card hover:shadow-elegant transition-shadow flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-2xl">
                        {c.emoji}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold">{c.name}</p>
                        <p className="text-xs text-muted-foreground">
                          멤버 {c.members}명 · 파티 {c.parties}개
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </Card>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ 화면 2: 커뮤니티 상세 (파티 모집) ============ */}
        {screen === "community" && (
          <div className="space-y-5">
            <Card className="p-6 shadow-card flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">{community}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  멤버 <b className="text-foreground">342</b>명 · 진행중 파티{" "}
                  <b className="text-foreground">14</b>개
                </p>
              </div>
              <Button variant="hero" onClick={() => go("create")}>
                <Plus className="h-4 w-4" /> 파티 만들기
              </Button>
            </Card>

            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-1">
                <Flame className="h-5 w-5 text-destructive" /> 모집중인 파티
              </h3>
              <div className="space-y-3">
                {PARTIES.map((p) => (
                  <Card key={p.name} className="p-4 shadow-card flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center">
                      {p.full ? (
                        <Shield className="h-5 w-5 text-primary" />
                      ) : (
                        <Flag className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-bold">{p.name}</p>
                        {p.full ? (
                          <Badge variant="secondary">모집완료</Badge>
                        ) : (
                          <Badge className="bg-success text-success-foreground hover:bg-success">모집중</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {p.theme} · 전력 {p.power}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${p.full ? "text-muted-foreground" : "text-primary"}`}>
                        {p.cur}/{p.max}
                      </p>
                      <Button
                        variant="link"
                        size="sm"
                        className="h-auto p-0 text-xs"
                        disabled={p.full}
                        onClick={() => go("party")}
                      >
                        {p.full ? "정원마감" : "참가 →"}
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ============ 화면 3: 파티 생성 ============ */}
        {screen === "create" && (
          <Card className="p-6 shadow-card max-w-xl mx-auto space-y-5">
            <div>
              <h2 className="text-2xl font-bold mb-1">파티 만들기</h2>
              <p className="text-sm text-muted-foreground">
                파티를 만들고 멤버를 모으면 랜덤 매칭 대기열에 등록됩니다.
              </p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>파티 이름</Label>
                <Input defaultValue="새벽반 정복단" />
              </div>
              <div className="space-y-1.5">
                <Label>목표 과목 / 시즌 테마</Label>
                <Input defaultValue="기말고사 D-14 챌린지" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>정원</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4명</SelectItem>
                      <SelectItem value="5">5명</SelectItem>
                      <SelectItem value="6">6명</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>일일 최소 목표</Label>
                  <Select defaultValue="3">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2시간</SelectItem>
                      <SelectItem value="3">3시간</SelectItem>
                      <SelectItem value="4">4시간</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <Button variant="hero" className="w-full" onClick={() => go("party")}>
              파티 생성하기
            </Button>
          </Card>
        )}

        {/* ============ 화면 4: 파티 대기실 + 랜덤 매칭 ============ */}
        {screen === "party" && (
          <Card className="p-6 shadow-card space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="secondary" className="mb-2">
                  {community}
                </Badge>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" /> 새벽반 정복단
                </h2>
                <p className="text-sm text-muted-foreground">기말고사 D-14 챌린지 · 정원 5명</p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary">5/5</p>
                <p className="text-xs text-muted-foreground">모집 완료</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {MY_MEMBERS.map((m) => (
                <div key={m.name} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center text-xl">
                    {m.emoji}
                  </div>
                  <p className="text-[11px] mt-1 font-medium truncate">{m.name}</p>
                </div>
              ))}
            </div>

            {!matching ? (
              <div className="text-center pt-2">
                <Button variant="hero" size="lg" onClick={startMatching}>
                  🎲 랜덤 매칭 시작
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  비슷한 전력의 상대 파티를 자동으로 찾습니다
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="inline-flex items-center gap-2 text-primary font-semibold">
                  <Dot className="h-6 w-6 animate-pulse" />
                  상대 파티 매칭 중...
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  전력 지수 1,200 ± 150 범위에서 탐색 중
                </p>
              </div>
            )}
          </Card>
        )}

        {/* ============ 화면 5: 공성전 진행 (대시보드) ============ */}
        {screen === "war" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive gap-1">
                  <span className="w-2 h-2 rounded-full bg-current animate-pulse" /> LIVE
                </Badge>
                <span className="text-muted-foreground">남은 시간 09:14:32</span>
              </div>
              <Button variant="ghost" size="sm" onClick={() => go("home")}>
                공성전 종료 →
              </Button>
            </div>

            {/* 점령 게이지 */}
            <Card className="p-6 shadow-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted-foreground">우리 파티</p>
                  <p className="font-bold text-primary flex items-center gap-1">
                    <Shield className="h-4 w-4" /> 새벽반 정복단
                  </p>
                </div>
                <p className="font-bold text-muted-foreground">VS</p>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">상대 파티</p>
                  <p className="font-bold text-destructive flex items-center gap-1 justify-end">
                    <Flame className="h-4 w-4" /> 라이브러리 점령군
                  </p>
                </div>
              </div>
              <div className="relative h-9 rounded-full overflow-hidden bg-destructive/20 flex">
                <div
                  className="h-full gradient-primary flex items-center pl-3 transition-all duration-1000 ease-out"
                  style={{ width: `${occupy}%` }}
                >
                  <span className="text-primary-foreground text-xs font-bold">{occupy}%</span>
                </div>
                <div className="flex-1 flex items-center justify-end pr-3">
                  <span className="text-destructive text-xs font-bold">{100 - occupy}%</span>
                </div>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-2">
                누적 공부시간으로 성을 점령합니다 · 현재{" "}
                <b className="text-primary">우리 파티 우세</b>
              </p>
            </Card>

            {/* 현황 카드 */}
            <div className="grid md:grid-cols-3 gap-3">
              <Card className="p-5 shadow-card">
                <p className="text-xs text-muted-foreground mb-1">우리 파티 누적 학습</p>
                <p className="text-3xl font-bold text-primary">
                  82.4<span className="text-base">h</span>
                </p>
                <p className="text-xs text-success font-semibold mt-1">▲ 오늘 +14.2h</p>
              </Card>
              <Card className="p-5 shadow-card">
                <p className="text-xs text-muted-foreground mb-1">상대 파티 누적 학습</p>
                <p className="text-3xl font-bold text-destructive">
                  61.8<span className="text-base">h</span>
                </p>
                <p className="text-xs text-muted-foreground font-semibold mt-1">▲ 오늘 +9.1h</p>
              </Card>
              <Card className="p-5 shadow-card">
                <p className="text-xs text-muted-foreground mb-1">격차 (리드)</p>
                <p className="text-3xl font-bold text-success">
                  +20.6<span className="text-base">h</span>
                </p>
                <p className="text-xs text-muted-foreground font-semibold mt-1">유지 시 승리 예상</p>
              </Card>
            </div>

            {/* 파티원 기여도 */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-1">
                <Trophy className="h-5 w-5 text-amber-500" /> 파티원 기여도 랭킹
              </h3>
              <Card className="shadow-card divide-y">
                {CONTRIB.map((c, i) => (
                  <div key={c.name} className="flex items-center gap-3 p-3">
                    <div className={`w-7 text-center font-bold ${i < 3 ? "text-lg" : "text-muted-foreground"}`}>
                      {MEDALS[i]}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-lg">
                      {c.emoji}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{c.name}</p>
                        {c.tag === "MVP" && (
                          <Badge className="bg-amber-500 text-white hover:bg-amber-500">MVP</Badge>
                        )}
                        {c.tag === "상승" && (
                          <Badge className="bg-destructive text-destructive-foreground hover:bg-destructive">
                            🔥상승
                          </Badge>
                        )}
                      </div>
                      <Progress value={c.pct} className="h-2 mt-1" />
                    </div>
                    <p className="font-bold text-primary text-sm w-14 text-right">{c.hours}h</p>
                  </div>
                ))}
              </Card>
            </div>

            {/* 실시간 전황 */}
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-1">
                <Users className="h-5 w-5" /> 실시간 전황
              </h3>
              <Card className="bg-foreground text-background p-4 shadow-card font-mono text-xs space-y-2">
                {WAR_LOG.map((l, i) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-background/50 w-14 shrink-0">{l.t}</span>
                    <span className={l.c}>{l.m}</span>
                  </div>
                ))}
              </Card>
            </div>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-muted-foreground py-8">
        ⚔️ 파티 공성전 (베타) · 데모 데이터로 동작합니다
      </footer>
    </div>
  );
};

export default PartySiege;
