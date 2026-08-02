"use client";

import { useState } from "react";
import { Word } from "@/lib/types";
import { todayStr } from "@/lib/srs";

type Props = {
  initial?: Word;
  onSubmit: (term: string, meaning: string, topic: string, cardDate: string, example: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export default function CardForm({ initial, onSubmit, onCancel, onDelete }: Props) {
  const [term, setTerm] = useState(initial?.term ?? "");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [example, setExample] = useState(initial?.example ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? "");
  const [cardDate, setCardDate] = useState(initial?.card_date ?? todayStr());

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim() || !meaning.trim()) return;
    onSubmit(term.trim(), meaning.trim(), topic.trim() || "기타", cardDate, example.trim());
    if (!initial) {
      setTerm("");
      setMeaning("");
      setExample("");
      setTopic("");
      setCardDate(todayStr());
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 p-3 rounded-lg border border-ink/10 mb-4">
      <textarea
        autoFocus
        value={term}
        onChange={(e) => setTerm(e.target.value)}
        placeholder="문제"
        rows={3}
        className="notebook-lines text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none"
      />
      <textarea
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
        placeholder="답"
        rows={3}
        className="notebook-lines text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none"
      />
      <input
        value={example}
        onChange={(e) => setExample(e.target.value)}
        placeholder="메모 (선택)"
        className="text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
      />
      <div className="flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="주제"
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
        />
        <input
          type="date"
          value={cardDate}
          onChange={(e) => setCardDate(e.target.value)}
          className="text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
        />
      </div>
      <div className="flex justify-between gap-2">
        {initial && onDelete ? (
          <button type="button" onClick={onDelete} className="text-sm px-4 py-2 rounded-lg text-bad hover:bg-bad/10">
            삭제
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="text-sm px-4 py-2 rounded-lg text-ink/50 hover:bg-locked">
            취소
          </button>
          <button type="submit" className="text-sm px-4 py-2 rounded-lg bg-ink text-white">
            {initial ? "저장" : "추가"}
          </button>
        </div>
      </div>
    </form>
  );
}
