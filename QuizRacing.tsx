import React, { useState } from 'react';

const QuizRacing = () => {
  // 앱의 '수첩(기억력)' 역할
  const [activeTab, setActiveTab] = useState('quiz');
  const [answers, setAnswers] = useState({ q1: '', q2: '', q3: '' });
  const [myScore, setMyScore] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- [새로 추가된 기능] 자유로운 스터디원 명단 관리 ---
  const [members, setMembers] = useState([
    { name: '한승재', score: 100 },
    { name: '최민기', score: 80 }
  ]); // 기본 예시로 2명만 넣어뒀어! 다 지우고 새로 추가할 수도 있음.
  
  const [newName, setNewName] = useState('');
  const [newScore, setNewScore] = useState('');

  // 스터디원 추가 버튼을 눌렀을 때 실행되는 마법
  const handleAddMember = () => {
    if (newName.trim() === '' || newScore === '') {
      alert('이름과 점수를 모두 입력해주세요!');
      return;
    }
    // 기존 명단(...members)에 새로운 사람을 쏙 끼워넣기
    setMembers([...members, { name: newName, score: Number(newScore) }]);
    setNewName(''); // 입력칸 다시 비워주기
    setNewScore('');
  };

  // 실수로 추가한 사람 삭제하는 기능 (보너스!)
  const handleRemoveMember = (indexToRemove: number) => {
    setMembers(members.filter((_, index) => index !== indexToRemove));
  };

  // 정답 제출 및 채점 로직
  const handleSubmit = () => {
    let score = 0;
    if (answers.q1 === 'print()') score += 1;
    if (answers.q2 === '리스트(list)') score += 1;
    if (answers.q3 === 'if') score += 1;

    setMyScore(Math.floor((score / 3) * 100));
    setIsSubmitted(true);
  };

  // --- [핵심] 기존 스터디원 + 내 점수를 합쳐서 1등부터 줄 세우기 ---
  const allRacers = [
    ...members,
    { name: '이동현 (나)', score: myScore, isMe: true }
  ].sort((a, b) => b.score - a.score);

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>📚 스터디 플래너: 복습 & 레이싱</h1>
      
      {/* 탭 버튼 */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => setActiveTab('quiz')} style={{ padding: '10px', fontWeight: activeTab === 'quiz' ? 'bold' : 'normal', cursor: 'pointer' }}>
          📝 오늘의 복습 퀴즈
        </button>
        <button onClick={() => setActiveTab('racing')} style={{ padding: '10px', fontWeight: activeTab === 'racing' ? 'bold' : 'normal', cursor: 'pointer' }}>
          🏇 실시간 레이싱 랭킹
        </button>
      </div>

      {/* 복습 퀴즈 탭 */}
      {activeTab === 'quiz' && (
        <div>
          <h2>오픈소스 SW 기초 복습 퀴즈</h2>
          
          <div style={{ marginBottom: '15px' }}>
            <p><strong>Q1. 파이썬에서 화면에 결과값을 출력할 때 사용하는 함수는?</strong></p>
            <select onChange={(e) => setAnswers({...answers, q1: e.target.value})} style={{ padding: '5px' }}>
              <option>선택하세요</option>
              <option>input()</option>
              <option>print()</option>
              <option>display()</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p><strong>Q2. 여러 개의 데이터를 순서대로 담을 수 있는 파이썬의 자료형(상자)은?</strong></p>
            <select onChange={(e) => setAnswers({...answers, q2: e.target.value})} style={{ padding: '5px' }}>
              <option>선택하세요</option>
              <option>정수(int)</option>
              <option>문자열(str)</option>
              <option>리스트(list)</option>
            </select>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p><strong>Q3. 조건이 참(True)일 때만 특정 코드를 실행하게 만드는 제어문은?</strong></p>
            <select onChange={(e) => setAnswers({...answers, q3: e.target.value})} style={{ padding: '5px' }}>
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
                <p style={{ color: 'green', fontWeight: 'bold' }}>🎉 만점입니다! 랭킹 탭에서 순위를 확인하세요!</p>
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
          
          {/* 입력 폼: 새로운 사람 추가하기 */}
          <div style={{ padding: '15px', backgroundColor: '#e9ecef', borderRadius: '8px', marginBottom: '25px' }}>
            <h3 style={{ marginTop: 0 }}>👥 스터디원 기록 입력</h3>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="text" 
                placeholder="이름 (예: 김철수)" 
                value={newName} 
                onChange={(e) => setNewName(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', flex: 1 }}
              />
              <input 
                type="number" 
                placeholder="점수 (0~100)" 
                value={newScore} 
                onChange={(e) => setNewScore(e.target.value)}
                style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc', width: '110px' }}
                min="0" max="100"
              />
              <button onClick={handleAddMember} style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                + 추가
              </button>
            </div>
          </div>

          {/* 레이싱 트랙 그리기 */}
          {allRacers.map((racer, index) => (
            <div key={index} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                <p style={{ margin: 0, fontWeight: racer.isMe ? 'bold' : 'normal', color: racer.isMe ? '#007bff' : 'black' }}>
                  <strong>{index + 1}등: {racer.name}</strong> (달성률 {racer.score}%)
                </p>
                {/* 다른 스터디원은 삭제할 수 있는 귀여운 X 버튼 */}
                {!racer.isMe && (
                  <button onClick={() => handleRemoveMember(members.findIndex(m => m.name === racer.name))} style={{ border: 'none', background: 'transparent', color: 'red', cursor: 'pointer', fontSize: '12px' }}>
                    ❌ 삭제
                  </button>
                )}
              </div>
              
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