"use client";

import { useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { todayStr } from "@/lib/srs";
import { recordPrompt, useI18n } from "@/lib/i18n";
import Recorder from "@/components/Recorder";
import CardForm from "@/components/CardForm";

type Props = { params: { language: string } };

type Step = "korean" | "record1" | "compare";

const STEP_ORDER: Step[] = ["korean", "record1", "compare"];

export default function RecordDiaryPage({ params }: Props) {
  const { t, locale } = useI18n();
  const language = decodeURIComponent(params.language);
  const [step, setStep] = useState<Step>("korean");
  const [korean, setKorean] = useState("");
  const [recording1, setRecording1] = useState<Blob | null>(null);
  const [myTranscript, setMyTranscript] = useState("");
  const [corrected, setCorrected] = useState("");
  const [topic, setTopic] = useState("");
  const [cardDate, setCardDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [quickAdding, setQuickAdding] = useState(false);
  const [quickAddedWords, setQuickAddedWords] = useState<{ term: string; meaning: string }[]>([]);
  const quickSessionIdRef = useRef<string | null>(null);

  const STEP_LABEL: Record<Step, string> = {
    korean: t.diaryStep1,
    record1: t.diaryStep2,
    compare: t.diaryStep3,
  };

  const recording1Url = useMemo(() => (recording1 ? URL.createObjectURL(recording1) : null), [recording1]);

  function reset() {
    setKorean("");
    setRecording1(null);
    setMyTranscript("");
    setCorrected("");
    setTopic("");
    setCardDate(todayStr());
    setStep("korean");
    setQuickAdding(false);
    setQuickAddedWords([]);
    quickSessionIdRef.current = null;
  }

  // 녹음본은 따로 저장하지 않고, 완성된 문장만 수집함에 남김
  async function save() {
    if (!corrected.trim()) return;
    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    await supabase.from("words").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      language,
      term: corrected,
      meaning: korean,
      topic: topic.trim() || "기타",
      card_date: cardDate,
      box: 1,
      next_review_date: todayStr(),
    });

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    reset();
  }

  // 비교하다가 눈에 띈 표현(몰랐던 표현, 고쳐야 할 표현)을 그 자리에서 수집함에 따로 추가.
  // 이 스텝에서 이어서 추가한 표현들은 같은 session_id로 묶여서, 나중에 수집함/퀴즈에서 한 세트로 보임
  async function quickAddWord(
    term: string,
    meaning: string,
    quickTopic: string,
    quickDate: string,
    example: string
  ) {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (!quickSessionIdRef.current) quickSessionIdRef.current = crypto.randomUUID();

    await supabase.from("words").insert({
      id: crypto.randomUUID(),
      user_id: user.id,
      language,
      term,
      meaning,
      example: example || null,
      topic: quickTopic,
      card_date: quickDate,
      box: 1,
      next_review_date: todayStr(),
      session_id: quickSessionIdRef.current,
    });

    setQuickAddedWords((prev) => [...prev, { term, meaning }]);
  }

  const stepIndex = STEP_ORDER.indexOf(step);

  return (
    <div>
      <p className="text-xs text-ink/30 mb-1">
        {stepIndex + 1} / {STEP_ORDER.length}
      </p>
      <h2 className="text-sm font-medium text-ink/60 mb-4">{STEP_LABEL[step]}</h2>

      {step === "korean" && (
        <div className="flex flex-col gap-3">
          <textarea
            autoFocus
            value={korean}
            onChange={(e) => setKorean(e.target.value)}
            rows={5}
            className="notebook-lines text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none"
          />
          <button
            disabled={!korean.trim()}
            onClick={() => setStep("record1")}
            className="self-end text-sm px-4 py-2 rounded-lg bg-ink text-white disabled:opacity-30"
          >
            {t.next}
          </button>
        </div>
      )}

      {step === "record1" && (
        <div className="flex flex-col gap-4 items-center">
          <p className="text-sm text-ink/50 text-center whitespace-pre-line">
            {recordPrompt(locale, korean, language)}
          </p>
          <Recorder onRecorded={setRecording1} />
          <div className="w-full flex justify-between">
            <button onClick={() => setStep("korean")} className="text-sm text-ink/40 hover:text-ink">
              {t.prev}
            </button>
            <button
              disabled={!recording1}
              onClick={() => setStep("compare")}
              className="text-sm px-4 py-2 rounded-lg bg-ink text-white disabled:opacity-30"
            >
              {t.next}
            </button>
          </div>
        </div>
      )}

      {step === "compare" && (
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-xs text-ink/40 mb-1">{t.diaryKoreanLabel}</p>
            <p className="text-sm rounded-lg bg-locked px-3 py-2">{korean}</p>
          </div>

          <div>
            <p className="text-xs text-ink/40 mb-1">{t.diaryMySentenceLabel}</p>
            {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
            <audio src={recording1Url ?? undefined} controls className="w-full mb-2" />
            <textarea
              autoFocus
              value={myTranscript}
              onChange={(e) => setMyTranscript(e.target.value)}
              rows={3}
              className="notebook-lines w-full text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none"
            />
          </div>

          <div>
            <p className="text-xs text-ink/40 mb-1">{t.diaryCorrectLabel}</p>
            <textarea
              value={corrected}
              onChange={(e) => setCorrected(e.target.value)}
              rows={3}
              className="notebook-lines w-full text-sm px-3 pt-0 rounded-lg border-0 border-b border-ink/15 focus:outline-none focus:border-ink/40 resize-none"
            />
          </div>

          <div className="pt-2 border-t border-ink/10">
            {quickAddedWords.length > 0 && (
              <ul className="flex flex-col gap-1 mb-2">
                {quickAddedWords.map((w, i) => (
                  <li key={i} className="text-xs text-ink/50">
                    ✓ {w.term} — {w.meaning}
                  </li>
                ))}
              </ul>
            )}
            {quickAdding ? (
              <CardForm onSubmit={quickAddWord} onCancel={() => setQuickAdding(false)} />
            ) : (
              <button
                onClick={() => setQuickAdding(true)}
                className="text-xs px-3 py-1.5 rounded-full bg-locked text-ink/60 hover:bg-ink/10"
              >
                {t.quickAddPrompt}
              </button>
            )}
          </div>

          <div className="pt-2 border-t border-ink/10 flex flex-col gap-3">
            <div className="flex gap-2">
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder={t.topicPlaceholder}
                className="flex-1 text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
              />
              <input
                type="date"
                value={cardDate}
                onChange={(e) => setCardDate(e.target.value)}
                className="text-sm px-3 py-2 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
              />
            </div>

            <div className="flex justify-between items-center">
              <button onClick={() => setStep("record1")} className="text-sm text-ink/40 hover:text-ink">
                {t.prev}
              </button>
              <button
                disabled={!myTranscript.trim() || !corrected.trim() || saving}
                onClick={save}
                className="text-sm px-4 py-2 rounded-lg bg-ink text-white disabled:opacity-30"
              >
                {saving ? t.savingBtn : t.saveToCollectionBtn}
              </button>
            </div>
          </div>
        </div>
      )}

      {saved && <p className="text-xs text-good mt-3 text-center">{t.savedToast}</p>}
    </div>
  );
}
