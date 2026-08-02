"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Word } from "@/lib/types";
import { useLanguages } from "@/lib/useLanguages";
import { nextBox, nextReviewDate, todayStr } from "@/lib/srs";
import { useI18n } from "@/lib/i18n";
import LanguageTabs from "@/components/LanguageTabs";
import FlashcardReview from "@/components/FlashcardReview";

export default function ReviewPage() {
  return (
    <Suspense fallback={null}>
      <ReviewPageContent />
    </Suspense>
  );
}

function ReviewPageContent() {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const presetLang = searchParams.get("lang");
  const { languages } = useLanguages();
  const [dueWords, setDueWords] = useState<Word[]>([]);
  const [filterLang, setFilterLang] = useState<string | "all">(presetLang ?? "all");
  const [loading, setLoading] = useState(true);

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
          .lte("next_review_date", todayStr());
        setDueWords(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, []);

  const queue = useMemo(
    () => (filterLang === "all" ? dueWords : dueWords.filter((w) => w.language === filterLang)),
    [dueWords, filterLang]
  );

  async function handleAnswer(word: Word, correct: boolean) {
    const box = nextBox(word.box, correct);
    const next_review_date = nextReviewDate(box);

    setDueWords((prev) => prev.filter((w) => w.id !== word.id));

    const supabase = createClient();
    await supabase.from("words").update({ box, next_review_date }).eq("id", word.id);
  }

  async function handleToggleStar(word: Word) {
    const starred = !word.starred;
    setDueWords((prev) => prev.map((w) => (w.id === word.id ? { ...w, starred } : w)));

    const supabase = createClient();
    await supabase.from("words").update({ starred }).eq("id", word.id);
  }

  if (loading) return null;

  return (
    <div className="pt-4">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-lg font-bold">{t.reviewTitle}</h1>
        <Link href="/" className="text-xs text-ink/40 hover:text-ink">
          {t.backToCollection}
        </Link>
      </div>

      <LanguageTabs languages={languages} value={filterLang} onChange={setFilterLang} />

      <FlashcardReview queue={queue} onAnswer={handleAnswer} onToggleStar={handleToggleStar} />
    </div>
  );
}
