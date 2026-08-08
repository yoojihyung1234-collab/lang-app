"use client";

import { useState } from "react";
import { QuizQuestion } from "@/lib/quiz";
import { useI18n } from "@/lib/i18n";

type Props = {
  questions: QuizQuestion[];
  onFinish: (score: number) => void;
  onToggleStar: (wordId: string, starred: boolean) => void;
};

export default function QuizSession({ questions, onFinish, onToggleStar }: Props) {
  const { t } = useI18n();
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const question = questions[index];

  function reveal() {
    setRevealed(true);
  }

  function advance(scoreDelta: number) {
    const nextScore = score + scoreDelta;
    if (index + 1 >= questions.length) {
      onFinish(nextScore);
      return;
    }
    setScore(nextScore);
    setIndex((i) => i + 1);
    setAnswer("");
    setRevealed(false);
  }

  function markUnsure() {
    onToggleStar(question.word.id, true);
    setRevealed(true);
  }

  function starAndNext() {
    onToggleStar(question.word.id, true);
    advance(0);
  }

  function grade(correct: boolean) {
    advance(correct ? 1 : 0);
  }

  return (
    <div className="pt-6">
      <p className="text-xs text-ink/40 mb-4">
        {index + 1} / {questions.length}
        {question.word.session_id && <span className="ml-2 text-accent">{t.setBadge}</span>}
      </p>
      <p className="text-2xl font-bold text-center mb-8">{question.word.term}</p>

      <textarea
        autoFocus
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={revealed}
        placeholder={t.quizAnswerPlaceholder}
        rows={2}
        className="notebook-lines w-full text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none disabled:opacity-60"
      />

      {!revealed ? (
        <div className="mt-4 flex gap-2">
          <button
            disabled={!answer.trim()}
            onClick={reveal}
            className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-ink text-white disabled:opacity-30"
          >
            {t.checkAnswer}
          </button>
          <button
            onClick={markUnsure}
            className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-locked text-ink/60 hover:bg-ink/10"
          >
            {t.quizUnsure}
          </button>
        </div>
      ) : (
        <>
          <div className="mt-4 rounded-lg bg-locked px-3 py-2">
            <p className="text-xs text-ink/40 mb-0.5">{t.correctAnswerLabel}</p>
            <p className="text-sm font-medium">{question.word.meaning}</p>
          </div>

          <button
            onClick={starAndNext}
            className="mt-3 w-full text-sm px-4 py-2.5 rounded-lg border border-ink/15 text-ink/50 hover:bg-locked"
          >
            ☆ {t.starThisWord}
          </button>

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => grade(false)}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-bad/10 text-bad"
            >
              {t.wrong}
            </button>
            <button
              onClick={() => grade(true)}
              className="flex-1 text-sm px-4 py-2.5 rounded-lg bg-good/10 text-good"
            >
              {t.correct}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
