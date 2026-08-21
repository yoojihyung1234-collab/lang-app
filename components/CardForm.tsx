"use client";

import { useState } from "react";
import { Word } from "@/lib/types";
import { todayStr } from "@/lib/srs";
import { useI18n } from "@/lib/i18n";

type Props = {
  initial?: Word;
  defaultTopic?: string;
  defaultSubtopic?: string;
  existingTopics?: string[];
  onSubmit: (term: string, meaning: string, topic: string, subtopic: string, cardDate: string, example: string) => void;
  onCancel: () => void;
  onDelete?: () => void;
};

export default function CardForm({
  initial,
  defaultTopic,
  defaultSubtopic,
  existingTopics,
  onSubmit,
  onCancel,
  onDelete,
}: Props) {
  const { t } = useI18n();
  const [term, setTerm] = useState(initial?.term ?? "");
  const [meaning, setMeaning] = useState(initial?.meaning ?? "");
  const [example, setExample] = useState(initial?.example ?? "");
  const [topic, setTopic] = useState(initial?.topic ?? defaultTopic ?? "");
  const [subtopic, setSubtopic] = useState(initial?.subtopic ?? defaultSubtopic ?? "");
  const [cardDate, setCardDate] = useState(initial?.card_date ?? todayStr());

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim() || !meaning.trim()) return;
    onSubmit(
      term.trim(),
      meaning.trim(),
      topic.trim() || "기타",
      subtopic.trim() || "기타",
      cardDate,
      example.trim()
    );
    if (!initial) {
      setTerm("");
      setMeaning("");
      setExample("");
      setTopic(defaultTopic ?? "");
      setSubtopic(defaultSubtopic ?? "");
      setCardDate(todayStr());
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-2 p-3 rounded-lg border border-ink/10 mb-4">
      <div className="flex gap-2">
        <textarea
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t.problemPlaceholder}
          rows={3}
          className="notebook-lines flex-1 min-w-0 text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none"
        />
        <textarea
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder={t.answerPlaceholder}
          rows={3}
          className="notebook-lines flex-1 min-w-0 text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none"
        />
      </div>
      <input
        value={example}
        onChange={(e) => setExample(e.target.value)}
        placeholder={t.memoPlaceholder}
        className="text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
      />
      <div className="flex gap-2">
        <input
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={t.topicPlaceholder}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
        />
        <input
          value={subtopic}
          onChange={(e) => setSubtopic(e.target.value)}
          placeholder={t.subtopicPlaceholder}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
        />
      </div>
      {existingTopics && existingTopics.length > 0 && (
        <div className="flex gap-1 flex-wrap">
          {existingTopics.map((tp) => (
            <button
              key={tp}
              type="button"
              onClick={() => setTopic(tp)}
              className={`text-xs px-2.5 py-1 rounded-full ${
                topic === tp ? "bg-ink text-white" : "bg-locked text-ink/60 hover:bg-ink/10"
              }`}
            >
              {tp}
            </button>
          ))}
        </div>
      )}
      <input
        type="date"
        value={cardDate}
        onChange={(e) => setCardDate(e.target.value)}
        className="text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
      />
      <div className="flex justify-between gap-2">
        {initial && onDelete ? (
          <button type="button" onClick={onDelete} className="text-sm px-4 py-2 rounded-lg text-bad hover:bg-bad/10">
            {t.delete}
          </button>
        ) : (
          <span />
        )}
        <div className="flex gap-2">
          <button type="button" onClick={onCancel} className="text-sm px-4 py-2 rounded-lg text-ink/50 hover:bg-locked">
            {t.cancel}
          </button>
          <button type="submit" className="text-sm px-4 py-2 rounded-lg bg-ink text-white">
            {initial ? t.save : t.add}
          </button>
        </div>
      </div>
    </form>
  );
}
