"use client";

import { useState } from "react";
import { Word } from "@/lib/types";
import { useI18n } from "@/lib/i18n";

type Props = {
  queue: Word[];
  onAnswer: (word: Word, correct: boolean) => void;
  onToggleStar: (word: Word) => void;
};

export default function FlashcardReview({ queue, onAnswer, onToggleStar }: Props) {
  const { t } = useI18n();
  const [flipped, setFlipped] = useState(false);
  const current = queue[0];

  if (!current) {
    return <p className="text-sm text-ink/40 py-10 text-center">{t.noReviewToday}</p>;
  }

  function answer(correct: boolean) {
    setFlipped(false);
    onAnswer(current, correct);
  }

  return (
    <div className="flex flex-col items-center gap-6 pt-8">
      <p className="text-xs text-ink/40">
        {t.remainingCards} {queue.length}
      </p>

      <div
        className={`flip-card relative w-full max-w-xs h-56 ${flipped ? "flipped" : ""}`}
        onClick={() => setFlipped((f) => !f)}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(current);
          }}
          className={`absolute top-2 right-2 z-10 text-xl ${current.starred ? "text-yellow-400" : "text-ink/20"}`}
          aria-label={t.starAria}
        >
          ★
        </button>

        <div className="flip-card-inner relative w-full h-full">
          <div className="flip-card-front absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-ink/10 cursor-pointer">
            <span className="text-xs px-2 py-0.5 rounded-full bg-locked text-ink/60">{current.language}</span>
            <p className="text-2xl font-bold">{current.term}</p>
            <p className="text-xs text-ink/30">{t.tapToReveal}</p>
          </div>
          <div className="flip-card-back absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl border border-ink/10 bg-locked cursor-pointer px-4">
            <p className="text-xl font-bold">{current.meaning}</p>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="flex gap-3">
          <button
            onClick={() => answer(false)}
            className="text-sm px-5 py-2.5 rounded-lg bg-bad/10 text-bad"
          >
            {t.dontKnow}
          </button>
          <button
            onClick={() => answer(true)}
            className="text-sm px-5 py-2.5 rounded-lg bg-good/10 text-good"
          >
            {t.know}
          </button>
        </div>
      )}
    </div>
  );
}
