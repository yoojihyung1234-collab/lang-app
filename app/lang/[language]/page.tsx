"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Word } from "@/lib/types";
import { todayStr } from "@/lib/srs";
import { useI18n } from "@/lib/i18n";
import CardForm from "@/components/CardForm";
import WordGroups from "@/components/WordGroups";

type Props = { params: { language: string } };
type View = "topics" | "topic-detail";
type DetailMode = "subtopic" | "date";

function countBy(words: Word[], key: "topic" | "subtopic"): [string, number][] {
  const map = new Map<string, number>();
  for (const w of words) map.set(w[key], (map.get(w[key]) ?? 0) + 1);
  return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
}

export default function CollectionPage({ params }: Props) {
  const { t } = useI18n();
  const language = decodeURIComponent(params.language);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [view, setView] = useState<View>("topics");
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [detailMode, setDetailMode] = useState<DetailMode>("subtopic");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [adding, setAdding] = useState(false);
  const [addTargetSubtopic, setAddTargetSubtopic] = useState<string | null>(null);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUserId(user?.id ?? null);

      if (user) {
        const { data } = await supabase
          .from("words")
          .select("*")
          .eq("user_id", user.id)
          .eq("language", language)
          .order("card_date", { ascending: false });
        setWords(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, [language]);

  const topics = useMemo(() => countBy(words, "topic"), [words]);
  const topicNames = useMemo(() => topics.map(([tp]) => tp), [topics]);
  const wordsInTopic = useMemo(
    () => (selectedTopic ? words.filter((w) => w.topic === selectedTopic) : []),
    [words, selectedTopic]
  );

  const topicDates = wordsInTopic.map((w) => w.card_date);
  const minDate = topicDates.length ? topicDates.reduce((a, b) => (a < b ? a : b)) : todayStr();
  const maxDate = topicDates.length ? topicDates.reduce((a, b) => (a > b ? a : b)) : todayStr();
  const effectiveFrom = dateFrom || minDate;
  const effectiveTo = dateTo || maxDate;
  const wordsInRange = useMemo(
    () => wordsInTopic.filter((w) => w.card_date >= effectiveFrom && w.card_date <= effectiveTo),
    [wordsInTopic, effectiveFrom, effectiveTo]
  );

  async function addWord(
    term: string,
    meaning: string,
    topic: string,
    subtopic: string,
    cardDate: string,
    example: string
  ) {
    if (!userId) return;
    const supabase = createClient();
    const id = crypto.randomUUID();
    const newWord: Word = {
      id,
      user_id: userId,
      language,
      term,
      meaning,
      example: example || null,
      topic,
      subtopic,
      card_date: cardDate,
      box: 1,
      next_review_date: todayStr(),
      audio_path: null,
      starred: false,
      session_id: null,
      created_at: new Date().toISOString(),
    };
    setWords((prev) => [newWord, ...prev]);
    setAdding(false);
    await supabase.from("words").insert({
      id,
      user_id: userId,
      language,
      term,
      meaning,
      example: example || null,
      topic,
      subtopic,
      card_date: cardDate,
      box: 1,
      next_review_date: newWord.next_review_date,
    });
  }

  async function saveEdit(
    term: string,
    meaning: string,
    topic: string,
    subtopic: string,
    cardDate: string,
    example: string
  ) {
    if (!editingWord) return;
    const id = editingWord.id;
    setWords((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, term, meaning, topic, subtopic, card_date: cardDate, example: example || null } : w
      )
    );
    setEditingWord(null);
    const supabase = createClient();
    await supabase
      .from("words")
      .update({ term, meaning, topic, subtopic, card_date: cardDate, example: example || null })
      .eq("id", id);
  }

  async function deleteWord(id: string) {
    setWords((prev) => prev.filter((w) => w.id !== id));
    const supabase = createClient();
    await supabase.from("words").delete().eq("id", id);
  }

  async function toggleStar(word: Word) {
    const starred = !word.starred;
    setWords((prev) => prev.map((w) => (w.id === word.id ? { ...w, starred } : w)));
    const supabase = createClient();
    await supabase.from("words").update({ starred }).eq("id", word.id);
  }

  if (loading) return null;

  const editForm = editingWord && (
    <div className="mb-3">
      <CardForm
        initial={editingWord}
        existingTopics={topicNames}
        onSubmit={saveEdit}
        onCancel={() => setEditingWord(null)}
        onDelete={() => {
          deleteWord(editingWord.id);
          setEditingWord(null);
        }}
      />
    </div>
  );

  const addButton = (
    <button
      onClick={() => {
        setEditingWord(null);
        setAddTargetSubtopic(null);
        setAdding(true);
      }}
      className="w-7 h-7 shrink-0 rounded-lg border border-dashed border-ink/20 text-sm leading-none text-ink/40 hover:bg-locked"
      aria-label={t.addSentenceAria}
    >
      +
    </button>
  );

  if (view === "topics") {
    return (
      <div>
        <div className="mb-4">{addButton}</div>
        {editForm}
        {adding && (
          <div className="mb-3">
            <CardForm existingTopics={topicNames} onSubmit={addWord} onCancel={() => setAdding(false)} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          {topics.map(([topic, count]) => (
            <button
              key={topic}
              onClick={() => {
                setSelectedTopic(topic);
                setDetailMode("subtopic");
                setDateFrom("");
                setDateTo("");
                setView("topic-detail");
              }}
              className="flex flex-col items-center justify-center h-20 rounded-2xl border border-ink/10 hover:bg-locked"
            >
              <span className="text-base font-bold">{topic}</span>
              <span className="text-xs text-ink/40 mt-0.5">{count}</span>
            </button>
          ))}
        </div>
        {topics.length === 0 && !adding && (
          <p className="text-sm text-ink/40 py-6 text-center">{t.emptyCollection}</p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => {
            setView("topics");
            setSelectedTopic(null);
          }}
          className="text-xs text-ink/40 hover:text-ink"
        >
          {t.back}
        </button>
        {addButton}
      </div>
      <h2 className="text-base font-bold mb-3">{selectedTopic}</h2>

      {editForm}
      {adding && (
        <div className="mb-3">
          <CardForm
            defaultTopic={selectedTopic ?? undefined}
            defaultSubtopic={addTargetSubtopic ?? undefined}
            existingTopics={topicNames}
            onSubmit={addWord}
            onCancel={() => setAdding(false)}
          />
        </div>
      )}

      <div className="flex items-center gap-1 mb-3">
        <button
          onClick={() => setDetailMode("subtopic")}
          className={`text-xs px-3 py-1.5 rounded-full ${
            detailMode === "subtopic" ? "bg-ink text-white" : "bg-locked text-ink/60"
          }`}
        >
          {t.subtopicPlaceholder}
        </button>
        <button
          onClick={() => setDetailMode("date")}
          className={`text-xs px-3 py-1.5 rounded-full ${
            detailMode === "date" ? "bg-ink text-white" : "bg-locked text-ink/60"
          }`}
        >
          {t.byDate}
        </button>
      </div>

      {detailMode === "date" && (
        <div className="flex items-center gap-2 mb-3">
          <input
            type="date"
            value={effectiveFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
          />
          <span className="text-ink/30">~</span>
          <input
            type="date"
            value={effectiveTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
          />
        </div>
      )}

      <WordGroups
        words={detailMode === "date" ? wordsInRange : wordsInTopic}
        groupBy={detailMode === "date" ? "date" : "subtopic"}
        onEdit={(w) => {
          setAdding(false);
          setEditingWord(w);
        }}
        onToggleStar={toggleStar}
        onAddToGroup={
          detailMode === "subtopic"
            ? (subtopic) => {
                setEditingWord(null);
                setAddTargetSubtopic(subtopic);
                setAdding(true);
              }
            : undefined
        }
      />
    </div>
  );
}
