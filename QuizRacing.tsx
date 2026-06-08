import React, { useState } from 'react';

// 스터디원 데이터 타입 정의
interface Racer {
  name: string;
  score: number;
}

const StudyRacing: React.FC = () => {
  // 1. 상태 관리 (State)
  const [activeTab, setActiveTab] = useState<'quiz' | 'ranking'>('quiz');
  const [racerScores, setRacerScores] = useState<Record<string, number>>({});
  
  // 퀴즈 관련 상태
  const [quizName, setQuizName] = useState('');
  const [q1, setQ1] = useState('');
  const [q2, setQ2] = useState('');
  const [q3, setQ3] = useState('');
  const [submittedResult, setSubmittedResult] = useState<{
    score: number;
    showResult: boolean;
  } | null>(null);

  // 2. 채점 및 점수 저장 로직
  const handleSubmitQuiz = () => {
    if (!quizName.trim()) {
      alert("앗! 랭킹에 올릴 이름을 먼저 적어주세요!");
      return;
    }

    let currentScore = 0;
    if (q1 === "print()") currentScore += 1;
    if (q2 === "리스트(list)") currentScore += 1;
    if (q3 === "if") currentScore += 1;

    const percent = Math.floor((currentScore / 3) * 100);

    // 랭킹 저장 (기존 racerScores 업데이트)
    setRacerScores((prev) => ({
      ...prev,
      [quizName]: percent,
    }));

    setSubmittedResult({ score: currentScore, showResult: true });
  };

  // 3. 삭제 로직
  const handleDelete = (name: string) => {
    setRacerScores((prev) => {
      const newState = { ...prev };
      delete newState[name];
      return newState;
    });
  };

  // 4. 데이터 정렬 (점수 높은 순)
  const sortedRacers = Object.entries(racerScores)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center' }}>📚 스터디 플래너: 복습 & 레이싱</h1>

      {/* 탭 메뉴 */}
      <div style={{ display: 'flex', borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('quiz')}
          style={{
            flex: 1, padding: '15px', cursor: 'pointer', border: 'none',
            backgroundColor: activeTab === 'quiz' ? '#fff' : '#f0f0f0',
            borderBottom: activeTab === 'quiz' ? '3px solid #007bff' : 'none',
            fontWeight: activeTab === 'quiz' ? 'bold' : 'normal'
          }}
        >
          📝 오늘의 복습 퀴즈
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          style={{
            flex: 1, padding: '15px', cursor: 'pointer', border: 'none',
            backgroundColor: activeTab === 'ranking' ? '#fff' : '#f0f0f0',
            borderBottom: activeTab === 'ranking' ? '3px solid #007bff' : 'none',
            fontWeight: activeTab === 'ranking' ? 'bold' : 'normal'
          }}
        >
          🏇 실시간 레이싱 랭킹
        </button>
      </div>

      {/* 기능 1: 오늘의 복습 퀴즈 */}
      {activeTab === 'quiz' && (
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
          <h2>오픈소스 SW 기초 복습 퀴즈</h2>
          
          <QuizItem
            question="Q1. 파이썬에서 화면에 결과값을 출력할 때 사용하는 함수는?"
            options={["선택하세요", "input()", "print()", "display()"]}
            currentValue={q1}
            onChange={setQ1}
          />
          <QuizItem
            question="Q2. 여러 개의 데이터를 순서대로 담을 수 있는 파이썬의 자료형(상자)은?"
            options={["선택하세요", "정수(int)", "문자열(str)", "리스트(list)"]}
            currentValue={q2}
            onChange={setQ2}
          />
          <QuizItem
            question="Q3. 조건이 참(True)일 때만 특정 코드를 실행하게 만드는 제어문은?"
            options={["선택하세요", "for", "if", "def"]}
            currentValue={q3}
            onChange={setQ3}
          />

          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
            <h3>🏁 레이싱 랭킹 등록</h3>
            <p>이름을 적고 정답을 제출하면 실시간 레이싱에 참가됩니다!</p>
            <input
              type="text"
              value={quizName}
              onChange={(e) => setQuizName(e.target.value)}
              placeholder="이름을 입력하세요"
              style={{ width: '100%', padding: '10px', boxSizing: 'border-box', marginBottom: '10px' }}
            />
            <button
              onClick={handleSubmitQuiz}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#007bff',
                color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer'
              }}
            >
              정답 제출 및 채점하기
            </button>
          </div>

          {submittedResult?.showResult && (
            <div style={{ marginTop: '20px', padding: '15px', borderRadius: '8px', backgroundColor: submittedResult.score === 3 ? '#d4edda' : '#f8d7da' }}>
              <h3>🎯 {quizName}님의 점수: {submittedResult.score} / 3 점</h3>
              {submittedResult.score === 3 ? (
                <p>🎉 만점입니다! 옆의 [실시간 레이싱 랭킹] 탭을 눌러 내 순위를 확인해보세요!</p>
              ) : (
                <div>
                  <p>🥲 틀린 문제가 있습니다. 아래 피드백을 확인하고 다시 복습해 보세요!</p>
                  {q1 !== "print()" && <p style={{fontSize: '14px'}}>💡 Q1 피드백: 화면 출력은 print() 함수를 사용합니다.</p>}
                  {q2 !== "리스트(list)" && <p style={{fontSize: '14px'}}>💡 Q2 피드백: 여러 데이터를 담는 상자는 리스트(list)입니다.</p>}
                  {q3 !== "if" && <p style={{fontSize: '14px'}}>💡 Q3 피드백: 특정 조건에서만 실행되게 하려면 if를 사용합니다.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 기능 2: 실시간 레이싱 랭킹 */}
      {activeTab === 'ranking' && (
        <div style={{ padding: '20px' }}>
          <h2>🔥 실시간 스터디 레이싱</h2>
          {sortedRacers.length === 0 ? (
            <div style={{ padding: '20px', backgroundColor: '#e9ecef', borderRadius: '8px', color: '#6c757d' }}>
              아직 랭킹에 등록된 사람이 없습니다. [오늘의 복습 퀴즈] 탭에서 문제를 풀고 1등으로 진입해보세요!
            </div>
          ) : (
            sortedRacers.map((racer, index) => (
              <div key={racer.name} style={{ marginBottom: '25px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold' }}>
                    {index + 1}등: {racer.name} (달성률 {racer.score}%)
                  </span>
                  <button
                    onClick={() => handleDelete(racer.name)}
                    style={{
                      padding: '5px 10px', backgroundColor: '#dc3545', color: '#fff',
                      border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
                    }}
                  >
                    ❌ 삭제
                  </button>
                </div>
                {/* 레이싱 트랙 */}
                <div style={{
                  width: '100%', backgroundColor: '#f0f2f6', borderRadius: '10px',
                  padding: '5px', position: 'relative', height: '50px', boxSizing: 'border-box'
                }}>
                  <div style={{ position: 'absolute', right: '15px', top: '10px', fontSize: '25px' }}>🏁</div>
                  <div style={{
                    position: 'absolute',
                    left: `${racer.score * 0.85}%`,
                    top: '10px', fontSize: '25px',
                    transition: 'left 1s ease-in-out'
                  }}>
                    🏇
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// 퀴즈 아이템 컴포넌트
const QuizItem: React.FC<{
  question: string;
  options: string[];
  currentValue: string;
  onChange: (val: string) => void;
}> = ({ question, options, currentValue, onChange }) => (
  <div style={{ marginBottom: '20px' }}>
    <p style={{ fontWeight: 'bold' }}>{question}</p>
    {options.map((opt) => (
      <label key={opt} style={{ display: 'block', marginBottom: '5px', cursor: 'pointer' }}>
        <input
          type="radio"
          name={question}
          value={opt}
          checked={currentValue === opt}
          onChange={(e) => onChange(e.target.value)}
          style={{ marginRight: '10px' }}
        />
        {opt}
      </label>
    ))}
  </div>
);

export default StudyRacing;