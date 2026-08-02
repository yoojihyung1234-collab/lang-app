"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Word } from "@/lib/types";
import { todayStr } from "@/lib/srs";
import CardForm from "@/components/CardForm";
import WordGroups from "@/components/WordGroups";

type Props = { params: { language: string } };

export default function CollectionPage({ params }: Props) {
  const language = decodeURIComponent(params.language);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<"date" | "topic">("date");
  const [adding, setAdding] = useState(false);
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

  async function addWord(term: string, meaning: string, topic: string, cardDate: string, example: string) {
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
      card_date: cardDate,
      box: 1,
      next_review_date: newWord.next_review_date,
    });
  }

  async function saveEdit(term: string, meaning: string, topic: string, cardDate: string, example: string) {
    if (!editingWord) return;
    const id = editingWord.id;
    setWords((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, term, meaning, topic, card_date: cardDate, example: example || null } : w
      )
    );
    setEditingWord(null);
    const supabase = createClient();
    await supabase
      .from("words")
      .update({ term, meaning, topic, card_date: cardDate, example: example || null })
      .eq("id", id);
  }

  async function deleteWord(id: string) {
    setWords((prev) => prev.filter((w) => w.id !== id));
    const supabase = createClient();
    await supabase.from("words").delete().eq("id", id);
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => {
            setEditingWord(null);
            setAdding(true);
          }}
          className="w-7 h-7 shrink-0 rounded-lg border border-dashed border-ink/20 text-sm leading-none text-ink/40 hover:bg-locked mr-1"
          aria-label="문장 추가"
        >
          +
        </button>
        <button
          onClick={() => setGroupBy("date")}
          className={`text-xs px-3 py-1.5 rounded-full ${
            groupBy === "date" ? "bg-ink text-white" : "bg-locked text-ink/60"
          }`}
        >
          일자별
        </button>
        <button
          onClick={() => setGroupBy("topic")}
          className={`text-xs px-3 py-1.5 rounded-full ${
            groupBy === "topic" ? "bg-ink text-white" : "bg-locked text-ink/60"
          }`}
        >
          주제별
        </button>
      </div>

      {adding && (
        <div className="mb-3">
          <CardForm onSubmit={addWord} onCancel={() => setAdding(false)} />
        </div>
      )}

      {editingWord && (
        <div className="mb-3">
          <CardForm
            initial={editingWord}
            onSubmit={saveEdit}
            onCancel={() => setEditingWord(null)}
            onDelete={() => {
              deleteWord(editingWord.id);
              setEditingWord(null);
            }}
          />
        </div>
      )}

      <WordGroups
        words={words}
        groupBy={groupBy}
        onEdit={(w) => {
          setAdding(false);
          setEditingWord(w);
        }}
      />
    </div>
  );
}
