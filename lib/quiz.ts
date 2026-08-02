import { Word } from "./types";

export type QuizQuestion = {
  word: Word;
};

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// pool에서 count개를 무작위로 뽑아 주관식 문제로 만듦 (외국어 문장을 보고 뜻을 직접 적어보는 방식).
// 녹음 일기에서 이어서 추가한 표현(같은 session_id)들은 한 덩어리로 묶어 셔플해서, 퀴즈에서도 연달아 나옴
export function buildQuiz(pool: Word[], count: number): QuizQuestion[] {
  const bySession = new Map<string, Word[]>();
  const blocks: Word[][] = [];

  for (const word of pool) {
    if (word.session_id) {
      const existing = bySession.get(word.session_id);
      if (existing) {
        existing.push(word);
      } else {
        const block = [word];
        bySession.set(word.session_id, block);
        blocks.push(block);
      }
    } else {
      blocks.push([word]);
    }
  }

  return shuffle(blocks)
    .flat()
    .slice(0, count)
    .map((word) => ({ word }));
}
