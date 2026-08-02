"use client";

import { useState } from "react";
import { QuizQuestion } from "@/lib/quiz";

type Props = {
  questions: QuizQuestion[];
  onFinish: (score: number) => void;
};

export default function QuizSession({ questions, onFinish }: Props) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[index];

  function reveal() {
    setRevealed(true);
  }

  function grade(correct: boolean) {
    if (correct) setScore((s) => s + 1);
    if (index + 1 >= questions.length) {
      onFinish(correct ? score + 1 : score);
      return;
    }
    setIndex((i) => i + 1);
    setAnswer("");
    setRevealed(false);
  }

  return (
    <div className="pt-6">
      <p className="text-xs text-ink/40 mb-4">
        {index + 1} / {questions.length}
        {question.word.session_id && <span className="ml-2 text-accent">· 세트</span>}
      </p>
      <p className="text-2xl font-bold text-center mb-8">{question.word.term}</p>

      <textarea
        autoFocus
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={revealed}
        placeholder="뜻을 적어보세요"
        rows={2}
        className="notebook-lines w-full text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none disabled:opacity-60"
      />

      {!revealed ? (
        <button
          disabled={!answer.trim()}
          onClick={reveal}
          className="mt-4 w-full text-sm px-4 py-2.5 rounded-lg bg-ink text-white disabled:opacity-30"
        >
          정답 확인
        </button>
      ) : (
        <>
          <div className="mt-4 rounded-lg bg-locked px-3 py-2">
            <p className="text-xs text-ink/40 mb-0.5">정답</p>
            <p className="text-sm font-medium">{question.word.meaning}</p>
          </div>

          <div className="mt-4 flex gap-3">
            <button
              onClick={() => grade(false)}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-bad/10 text-bad"
            >
              틀렸어요
            </button>
            <button
              onClick={() => grade(true)}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-good/10 text-good"
            >
              맞았어요
            </button>
          </div>
        </>
      )}
    </div>
  );
}
