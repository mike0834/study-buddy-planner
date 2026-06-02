import React, { useState } from 'react';

const QuizRacing = () => {
  // 앱의 '수첩(기억력)' 역할 (파이썬의 session_state와 같음)
  const [activeTab, setActiveTab] = useState('quiz');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [myScore, setMyScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 정답 제출 및 채점 로직
  const handleSubmit = () => {
    let score = 0;
    if (answers.q1 === 'print()') score += 1;
    if (answers.q2 === '리스트(list)') score += 1;
    if (answers.q3 === 'if') score += 1;

    setMyScore(Math.floor((score / 3) * 100));
    setIsSubmitted(true);
  };

  // 랭킹 데이터 정렬
  const racers = [
    { name: '한승재', score: 100 },
    { name: '최민기', score: 80 },
    { name: '이상원', score: 60 },
    { name: '이동현', score: myScore }
  ].sort((a, b) => b.score - a.score);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>📚 스터디 플래너: 복습 & 레이싱</h1>
      
      {/* 탭 버튼 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('quiz')} style={{ padding: '10px', fontWeight: activeTab === 'quiz' ? 'bold' : 'normal' }}>
          📝 오늘의 복습 퀴즈
        </button>
        <button onClick={() => setActiveTab('racing')} style={{ padding: '10px', fontWeight: activeTab === 'racing' ? 'bold' : 'normal' }}>
          🏇 실시간 레이싱 랭킹
        </button>
      </div>

      {/* 복습 퀴즈 탭 */}
      {activeTab === 'quiz' && (
        <div>
          <h2>오픈소스 SW 기초 복습 퀴즈</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <p><strong>Q1. 파이썬에서 화면에 결과값을 출력할 때 사용하는 함수는?</strong></p>
            <select onChange={(e) => setAnswers({...answers, q1: e.target.value})}>
              <option>선택하세요</option>
              <option>input()</option>
              <option>print()</option>
              <option>display()</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p><strong>Q2. 여러 개의 데이터를 순서대로 담을 수 있는 파이썬의 자료형(상자)은?</strong></p>
            <select onChange={(e) => setAnswers({...answers, q2: e.target.value})}>
              <option>선택하세요</option>
              <option>정수(int)</option>
              <option>문자열(str)</option>
              <option>리스트(list)</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p><strong>Q3. 조건이 참(True)일 때만 특정 코드를 실행하게 만드는 제어문은?</strong></p>
            <select onChange={(e) => setAnswers({...answers, q3: e.target.value})}>
              <option>선택하세요</option>
              <option>for</option>
              <option>if</option>
              <option>def</option>
            </select>
          </div>

          <button onClick={handleSubmit} style={{ padding: '10px 20px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            정답 제출 및 채점하기
          </button>

          {isSubmitted && (
            <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
              <p>🎯 달성률: {myScore}%</p>
              {myScore === 100 ? (
                <p style={{ color: 'green' }}>🎉 만점입니다! 랭킹 탭에서 순위를 확인하세요!</p>
              ) : (
                <p style={{ color: 'red' }}>🥲 틀린 문제가 있습니다. 다시 복습해 보세요!</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 레이싱 랭킹 탭 */}
      {activeTab === 'racing' && (
        <div>
          <h2>🔥 실시간 스터디 레이싱</h2>
          {racers.map((racer, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <p><strong>{index + 1}등: {racer.name}</strong> (달성률 {racer.score}%)</p>
              <div style={{ width: '100%', backgroundColor: '#f0f2f6', borderRadius: '10px', height: '50px', position: 'relative' }}>
                <div style={{ position: 'absolute', right: '15px', top: '5px', fontSize: '25px' }}>🏁</div>
                <div style={{ 
                  position: 'absolute', 
                  left: `${racer.score * 0.85}%`, 
                  top: '5px', 
                  fontSize: '25px',
                  transition: 'left 1s ease-in-out'
                }}>🏇</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizRacing;