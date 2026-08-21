"use client";

import { useLayoutEffect, useRef, useState } from "react";
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

// 내용이 길어도 잘리지 않고 한 번에 다 보이도록 입력한 만큼 세로로 늘어나는 텍스트칸
function AutoGrowTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [props.value]);

  return <textarea ref={ref} {...props} />;
}

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

  const NEW_TOPIC = "__new_topic__";
  const hasTopicOptions = !!existingTopics && existingTopics.length > 0;
  const showTopicInput = !hasTopicOptions || !existingTopics!.includes(topic);

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
      <div className="flex gap-2 items-start">
        <AutoGrowTextarea
          autoFocus
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder={t.problemPlaceholder}
          rows={3}
          className="notebook-lines flex-1 min-w-0 text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none overflow-hidden"
        />
        <AutoGrowTextarea
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder={t.answerPlaceholder}
          rows={3}
          className="notebook-lines flex-1 min-w-0 text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none overflow-hidden"
        />
      </div>
      <input
        value={example}
        onChange={(e) => setExample(e.target.value)}
        placeholder={t.memoPlaceholder}
        className="text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
      />
      <div className="flex gap-2">
        {hasTopicOptions && !showTopicInput ? (
          <select
            value={topic}
            onChange={(e) => {
              if (e.target.value === NEW_TOPIC) setTopic("");
              else setTopic(e.target.value);
            }}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
          >
            {existingTopics!.map((tp) => (
              <option key={tp} value={tp}>
                {tp}
              </option>
            ))}
            <option value={NEW_TOPIC}>{t.newTopicOption}</option>
          </select>
        ) : (
          <input
            autoFocus={hasTopicOptions}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder={t.topicPlaceholder}
            className="flex-1 text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
          />
        )}
        <input
          value={subtopic}
          onChange={(e) => setSubtopic(e.target.value)}
          placeholder={t.subtopicPlaceholder}
          className="flex-1 text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
        />
      </div>
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
