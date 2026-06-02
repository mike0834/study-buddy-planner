# RevoStudy — 적응형 학습 플래너

내게 맞춰 진화하는 한국어 적응형 학습 플래너. 오늘의 공부 계획, 마감일, 진도율과 맞춤 추천을 한 곳에서 관리할 수 있습니다.

## 주요 기능

- **학습 계획 입력** — 과목, 목표 시간, 마감일을 한 번에 등록
- **할 일 목록(Task List)** — 오늘 해야 할 일을 체크리스트로 관리
- **과목별 진척도** — 과목마다 현재 진행률을 시각적으로 확인
- **학습 통계** — 누적 학습 시간, 완료율, 연속 출석일 등 요약
- **복습/피드백** — 학습 종료 시 피드백 기록과 복습 다이얼로그 제공

## 팀원 및 역할 분담

| 이름 | GitHub | 담당 |
|------|--------|------|
| 최민기 | [@mike0834](https://github.com/mike0834) | 프로젝트 총괄 · 메인 화면 · 문서화 |
| 현승재 | [@Hyun0325](https://github.com/Hyun0325) | 학습 계획 입력 기능 (StudyForm) |
| 이상원 | [@kalleey030807-dotcom] | 진척도 / 통계 UI (SubjectProgress, StatCard, TaskList) |
| 이동현 | [@wlr6709](https://github.com/wlr6709) | 복습 / 피드백 기능 (FeedbackPanel, ReviewCompleteDialog) |

## 기술 스택

- **프론트엔드**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui, Radix UI
- **상태 관리**: React Query, React Hook Form
- **테스트**: Vitest, Testing Library
- **그 외**: date-fns, Zod, Recharts

## 실행 방법 (아직 아님.)

```bash
# 1. 저장소 클론
git clone https://github.com/mike0834/study-buddy-planner.git
cd study-buddy-planner

# 2. 의존성 설치
npm install

# 3. 개발 서버 실행
npm run dev

# 4. 브라우저에서 열기
# http://localhost:8080
```

## 브랜치 전략

- `main` — 배포 가능한 안정 버전
- `feature/*` — 각 기능별 작업 브랜치 (예: `feature/setup-readme`, `feature/study-form`)

각 팀원은 본인 담당 기능의 브랜치를 만들어 작업한 뒤, Pull Request를 통해 `main`에 병합합니다.

## 라이선스

학습 목적의 팀 프로젝트입니다. (RevoStudy Team)
