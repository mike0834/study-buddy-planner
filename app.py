import streamlit as st
import pandas as pd

# 앱 전체 제목 및 기본 설정
st.set_page_config(page_title="스터디 플래너 & 복습 앱", page_icon="📚")
st.title("📚 스터디 플래너: 복습 & 레이싱")

# --- [핵심] 수첩 초기화 (텅 빈 상태로 시작) ---
if 'racer_scores' not in st.session_state:
    st.session_state.racer_scores = {} 

# 탭 나누기
tab1, tab2 = st.tabs(["📝 오늘의 복습 퀴즈", "🏇 실시간 레이싱 랭킹"])

# --- [기능 1] 복습 퀴즈 (여기서만 랭킹 진입 가능!) ---
with tab1:
    st.header("오픈소스 SW 기초 복습 퀴즈")
    
    q1 = st.radio("Q1. 파이썬에서 화면에 결과값을 출력할 때 사용하는 함수는?", ["선택하세요", "input()", "print()", "display()"], index=0)
    q2 = st.radio("Q2. 여러 개의 데이터를 순서대로 담을 수 있는 파이썬의 자료형(상자)은?", ["선택하세요", "정수(int)", "문자열(str)", "리스트(list)"], index=0)
    q3 = st.radio("Q3. 조건이 참(True)일 때만 특정 코드를 실행하게 만드는 제어문은?", ["선택하세요", "for", "if", "def"], index=0)
    
    st.divider()
    
    # 랭킹 등록을 위한 이름 입력칸 (필수 코스로 유도!)
    st.subheader("🏁 레이싱 랭킹 등록")
    quiz_name = st.text_input("이름을 적고 정답을 제출하면 실시간 레이싱에 참가됩니다!")
    
    if st.button("정답 제출 및 채점하기"):
        if quiz_name.strip() == "":
            st.warning("앗! 랭킹에 올릴 이름을 먼저 적어주세요!")
        else:
            score = 0
            if q1 == "print()": score += 1
            if q2 == "리스트(list)": score += 1
            if q3 == "if": score += 1
            
            # 맞춘 개수를 100점 만점으로 변환해서 수첩에 저장
            my_percent = int((score / 3) * 100)
            st.session_state.racer_scores[quiz_name] = my_percent
                
            st.write(f"### 🎯 {quiz_name}님의 점수: {score} / 3 점")
            
            if score == 3:
                st.success("🎉 만점입니다! 옆의 [실시간 레이싱 랭킹] 탭을 눌러 내 순위를 확인해보세요!")
                st.balloons()
            else:
                st.error("🥲 틀린 문제가 있습니다. 아래 피드백을 확인하고 다시 복습해 보세요!")
                if q1 != "print()": st.info("💡 **Q1 피드백:** 화면 출력은 `print()` 함수를 사용합니다.")
                if q2 != "리스트(list)": st.info("💡 **Q2 피드백:** 여러 데이터를 담는 상자는 `리스트(list)`입니다.")
                if q3 != "if": st.info("💡 **Q3 피드백:** 특정 조건에서만 실행되게 하려면 `if`를 사용합니다.")

# --- [기능 2] 실시간 레이싱 랭킹 (조회 및 삭제만 가능) ---
with tab2:
    st.header("🔥 실시간 스터디 레이싱")
    
    # 수동 추가 폼은 완전히 삭제됨!
    
    # 등록된 사람이 아무도 없을 때 안내문
    if len(st.session_state.racer_scores) == 0:
        st.info("아직 랭킹에 등록된 사람이 없습니다. [오늘의 복습 퀴즈] 탭에서 문제를 풀고 1등으로 진입해보세요!")
    else:
        df = pd.DataFrame({
            "이름": list(st.session_state.racer_scores.keys()),
            "정답률(%)": list(st.session_state.racer_scores.values())
        })
        df = df.sort_values(by="정답률(%)", ascending=False).reset_index(drop=True)
        
        # 1등부터 차례대로 레이싱 트랙 그리기
        for index, row in df.iterrows():
            name = row['이름']
            score = row['정답률(%)']
            
            col_text, col_btn = st.columns([4, 1])
            with col_text:
                st.markdown(f"**{index + 1}등: {name}** (달성률 {score}%)")
            with col_btn:
                # 삭제 기능은 유지
                if st.button("❌ 삭제", key=f"del_{name}"):
                    del st.session_state.racer_scores[name]
                    st.rerun()
            
            horse_position = score * 0.85 
            st.markdown(
                f"""
                <div style="width: 100%; background-color: #f0f2f6; border-radius: 10px; margin-bottom: 20px; padding: 5px; position: relative; height: 50px;">
                    <div style="position: absolute; right: 15px; top: 5px; font-size: 25px;">🏁</div>
                    <div style="position: absolute; left: {horse_position}%; top: 5px; font-size: 25px; transition: left 1s ease-in-out;">🏇</div>
                </div>
                """,
                unsafe_allow_html=True
            )