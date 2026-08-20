"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Word } from "@/lib/types";
import { useI18n } from "@/lib/i18n";
import CardForm from "@/components/CardForm";
import WordGroups from "@/components/WordGroups";

type Props = { params: { language: string } };

export default function StarredPage({ params }: Props) {
  const { t } = useI18n();
  const language = decodeURIComponent(params.language);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<"date" | "topic">("date");
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase
          .from("words")
          .select("*")
          .eq("user_id", user.id)
          .eq("language", language)
          .eq("starred", true)
          .order("card_date", { ascending: false });
        setWords(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, [language]);

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
    // 별표를 해제하면 이 화면(별표 모아보기)에서는 바로 사라짐
    setWords((prev) => (starred ? prev : prev.filter((w) => w.id !== word.id)));
    const supabase = createClient();
    await supabase.from("words").update({ starred }).eq("id", word.id);
  }

  if (loading) return null;

  return (
    <div>
      <div className="flex items-center gap-1 mb-4">
        <button
          onClick={() => setGroupBy("date")}
          className={`text-xs px-3 py-1.5 rounded-full ${
            groupBy === "date" ? "bg-ink text-white" : "bg-locked text-ink/60"
          }`}
        >
          {t.byDate}
        </button>
        <button
          onClick={() => setGroupBy("topic")}
          className={`text-xs px-3 py-1.5 rounded-full ${
            groupBy === "topic" ? "bg-ink text-white" : "bg-locked text-ink/60"
          }`}
        >
          {t.byTopic}
        </button>
      </div>

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

      {words.length === 0 ? (
        <p className="text-sm text-ink/40 py-6 text-center">{t.emptyStarred}</p>
      ) : (
        <WordGroups words={words} groupBy={groupBy} onEdit={setEditingWord} onToggleStar={toggleStar} />
      )}
    </div>
  );
}
