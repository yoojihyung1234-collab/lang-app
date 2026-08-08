"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Word } from "@/lib/types";
import { buildQuiz, QuizQuestion } from "@/lib/quiz";
import { questionCountOptionLabel, startQuizLabel, useI18n, weekLabel } from "@/lib/i18n";
import QuizSession from "@/components/QuizSession";

type Props = { params: { language: string } };

type Phase = "setup" | "session" | "result";
type Category = "topic" | "date" | "starred" | "all";
type DateGranularity = "day" | "week" | "month";

// 그 날짜가 속한 주의 월요일 (예: "2026-07-27") — 주 단위로 묶을 때 씀
function weekKey(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diffToMonday);
  return d.toISOString().slice(0, 10);
}

function monthKey(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function dateBucketKey(dateStr: string, granularity: DateGranularity): string {
  if (granularity === "week") return weekKey(dateStr);
  if (granularity === "month") return monthKey(dateStr);
  return dateStr;
}

export default function LanguageQuizPage({ params }: Props) {
  const { t, locale } = useI18n();
  const language = decodeURIComponent(params.language);
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(true);
  const [phase, setPhase] = useState<Phase>("setup");
  const [category, setCategory] = useState<Category>("all");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [dateGranularity, setDateGranularity] = useState<DateGranularity>("day");
  const [selectedDateBucket, setSelectedDateBucket] = useState("");
  const [count, setCount] = useState<number | "all">(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  function dateBucketLabel(key: string, granularity: DateGranularity): string {
    if (granularity === "week") return weekLabel(locale, key);
    return key;
  }

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
          .eq("language", language);
        setWords(data ?? []);
      }
      setLoading(false);
    }
    load();
  }, [language]);

  const topics = useMemo(() => Array.from(new Set(words.map((w) => w.topic))).sort(), [words]);
  const dateBuckets = useMemo(
    () =>
      Array.from(new Set(words.map((w) => dateBucketKey(w.card_date, dateGranularity)))).sort((a, b) =>
        b.localeCompare(a)
      ),
    [words, dateGranularity]
  );

  const pool = useMemo(() => {
    if (category === "topic") return selectedTopic ? words.filter((w) => w.topic === selectedTopic) : [];
    if (category === "date")
      return selectedDateBucket
        ? words.filter((w) => dateBucketKey(w.card_date, dateGranularity) === selectedDateBucket)
        : [];
    if (category === "starred") return words.filter((w) => w.starred);
    return words;
  }, [category, selectedTopic, selectedDateBucket, dateGranularity, words]);

  function selectCategory(next: Category) {
    setCategory(next);
    if (next === "topic" && !selectedTopic && topics.length > 0) setSelectedTopic(topics[0]);
    if (next === "date" && !selectedDateBucket && dateBuckets.length > 0) setSelectedDateBucket(dateBuckets[0]);
  }

  function selectGranularity(next: DateGranularity) {
    setDateGranularity(next);
    const buckets = Array.from(new Set(words.map((w) => dateBucketKey(w.card_date, next)))).sort((a, b) =>
      b.localeCompare(a)
    );
    setSelectedDateBucket(buckets[0] ?? "");
  }

  const questionCount = count === "all" ? pool.length : Math.min(count, pool.length);

  function start() {
    const qs = buildQuiz(pool, questionCount);
    setQuestions(qs);
    setPhase("session");
  }

  function finish(score: number) {
    setResult({ score, total: questions.length });
    setPhase("result");
  }

  async function toggleStar(wordId: string, starred: boolean) {
    setWords((prev) => prev.map((w) => (w.id === wordId ? { ...w, starred } : w)));
    const supabase = createClient();
    await supabase.from("words").update({ starred }).eq("id", wordId);
  }

  if (loading) return null;

  if (phase === "session") {
    return <QuizSession questions={questions} onFinish={finish} onToggleStar={toggleStar} />;
  }

  if (phase === "result" && result) {
    return (
      <div className="pt-8 flex flex-col items-center gap-4">
        <p className="text-sm text-ink/40">{t.resultLabel}</p>
        <p className="text-4xl font-bold">
          {result.score} / {result.total}
        </p>
        <button
          onClick={() => setPhase("setup")}
          className="mt-4 text-sm px-4 py-2.5 rounded-lg bg-ink text-white"
        >
          {t.retry}
        </button>
      </div>
    );
  }

  const CATEGORY_LABEL: Record<Category, string> = {
    topic: t.categoryTopic,
    date: t.categoryDate,
    starred: t.categoryStarred,
    all: t.categoryAllRandom,
  };

  const GRANULARITY_LABEL: Record<DateGranularity, string> = {
    day: t.granDay,
    week: t.granWeek,
    month: t.granMonth,
  };

  const selectClass = "text-sm font-medium text-ink bg-transparent text-right focus:outline-none";

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-ink/10 divide-y divide-ink/10">
        <SettingRow label={t.range}>
          <select
            value={category}
            onChange={(e) => selectCategory(e.target.value as Category)}
            className={selectClass}
          >
            {(["all", "topic", "date", "starred"] as Category[]).map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </SettingRow>

        {category === "topic" && (
          <SettingRow label={t.topicPlaceholder}>
            {topics.length === 0 ? (
              <span className="text-sm text-ink/30">{t.none}</span>
            ) : (
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className={selectClass}
              >
                {topics.map((tp) => (
                  <option key={tp} value={tp}>
                    {tp}
                  </option>
                ))}
              </select>
            )}
          </SettingRow>
        )}

        {category === "date" && (
          <>
            <SettingRow label={t.unit}>
              <select
                value={dateGranularity}
                onChange={(e) => selectGranularity(e.target.value as DateGranularity)}
                className={selectClass}
              >
                {(["day", "week", "month"] as DateGranularity[]).map((g) => (
                  <option key={g} value={g}>
                    {GRANULARITY_LABEL[g]}
                  </option>
                ))}
              </select>
            </SettingRow>

            <SettingRow label={t.date}>
              {dateBuckets.length === 0 ? (
                <span className="text-sm text-ink/30">{t.none}</span>
              ) : (
                <select
                  value={selectedDateBucket}
                  onChange={(e) => setSelectedDateBucket(e.target.value)}
                  className={selectClass}
                >
                  {dateBuckets.map((d) => (
                    <option key={d} value={d}>
                      {dateBucketLabel(d, dateGranularity)}
                    </option>
                  ))}
                </select>
              )}
            </SettingRow>
          </>
        )}

        <SettingRow label={t.questionCount}>
          <select
            value={String(count)}
            onChange={(e) => setCount(e.target.value === "all" ? "all" : Number(e.target.value))}
            className={selectClass}
          >
            {(["5", "10", "20", "50", "all"] as const).map((n) => (
              <option key={n} value={n}>
                {questionCountOptionLabel(locale, n === "all" ? "all" : Number(n))}
              </option>
            ))}
          </select>
        </SettingRow>
      </div>

      {pool.length === 0 ? (
        <p className="text-sm text-ink/40 text-center">{t.emptyRange}</p>
      ) : (
        <button onClick={start} className="text-sm px-4 py-2.5 rounded-lg bg-ink text-white">
          {startQuizLabel(locale, questionCount)}
        </button>
      )}
    </div>
  );
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-sm text-ink/50">{label}</span>
      {children}
    </div>
  );
}
