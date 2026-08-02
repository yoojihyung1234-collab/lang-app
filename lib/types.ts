export type Word = {
  id: string;
  user_id: string;
  language: string; // 자유 입력 (예: "영어", "프랑스어")
  term: string; // 외국어 단어
  meaning: string; // 한국어 뜻
  example: string | null;
  topic: string; // 주제 (예: "일상")
  card_date: string; // YYYY-MM-DD, 사용자가 직접 지정한 날짜
  box: number; // 라이트너 박스 1~5 (높을수록 복습 간격이 김)
  next_review_date: string; // YYYY-MM-DD
  audio_path: string | null; // 녹음 일기에서 재녹음한 발음, storage의 "recordings" 버킷 경로
  starred: boolean; // 복습 중 직접 표시한 중요 카드
  session_id: string | null; // 녹음 일기에서 이어서 추가한 표현들을 한 세트로 묶는 값
  created_at: string;
};

export type CustomLanguage = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};
