"use client";

import { Word } from "@/lib/types";
import { todayStr } from "@/lib/srs";
import { createClient } from "@/lib/supabase/client";
import { groupCountLabel, setLabel, useI18n } from "@/lib/i18n";

type GroupBy = "date" | "topic" | "subtopic";

type Props = {
  words: Word[];
  groupBy: GroupBy;
  onEdit: (word: Word) => void;
  onToggleStar: (word: Word) => void;
  onAddToGroup?: (groupKey: string) => void;
};

function groupWords(words: Word[], groupBy: GroupBy): [string, Word[]][] {
  const key = groupBy === "date" ? "card_date" : groupBy;
  const map = new Map<string, Word[]>();
  for (const w of words) {
    const k = w[key];
    map.set(k, [...(map.get(k) ?? []), w]);
  }
  const groups = Array.from(map.entries());
  if (groupBy === "date") groups.sort((a, b) => b[0].localeCompare(a[0]));
  else groups.sort((a, b) => a[0].localeCompare(b[0]));
  return groups;
}

// 녹음 일기에서 이어서 추가한 표현(같은 session_id)들을 한 세트로 묶고, 나머지는 개별로 남김
function clusterBySession(words: Word[]): { standalone: Word[]; sets: Word[][] } {
  const bySession = new Map<string, Word[]>();
  const standalone: Word[] = [];

  for (const w of words) {
    if (w.session_id) {
      bySession.set(w.session_id, [...(bySession.get(w.session_id) ?? []), w]);
    } else {
      standalone.push(w);
    }
  }

  const sets: Word[][] = [];
  for (const ws of Array.from(bySession.values())) {
    if (ws.length >= 2) sets.push(ws);
    else standalone.push(...ws);
  }

  return { standalone, sets };
}

export default function WordGroups({ words, groupBy, onEdit, onToggleStar, onAddToGroup }: Props) {
  const { t, locale } = useI18n();
  const today = todayStr();

  if (words.length === 0) {
    return <p className="text-sm text-ink/40 py-6 text-center">{t.emptyCollection}</p>;
  }

  const groups = groupWords(words, groupBy);

  async function play(audioPath: string) {
    const supabase = createClient();
    const { data } = await supabase.storage.from("recordings").createSignedUrl(audioPath, 60);
    if (data?.signedUrl) new Audio(data.signedUrl).play();
  }

  function renderCard(w: Word) {
    const due = w.next_review_date <= today;
    return (
      <button
        key={w.id}
        onClick={() => onEdit(w)}
        className="relative aspect-square rounded-xl border border-ink/10 p-3 flex items-center justify-center text-center hover:bg-locked bg-bg"
      >
        {due && <span className="absolute top-2 left-2 text-accent text-sm">●</span>}
        <span
          onClick={(e) => {
            e.stopPropagation();
            onToggleStar(w);
          }}
          className={`absolute bottom-1.5 left-2 text-sm ${w.starred ? "text-yellow-400" : "text-ink/15"}`}
          aria-label={t.starAria}
        >
          ★
        </span>
        <p className="text-sm leading-snug line-clamp-6">{w.term}</p>
        {w.audio_path && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              play(w.audio_path!);
            }}
            className="absolute bottom-1.5 right-2 text-ink/30 hover:text-ink text-sm"
            aria-label={t.playAudioAria}
          >
            🔊
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map(([key, groupWords]) => {
        const { standalone, sets } = clusterBySession(groupWords);
        return (
          <div key={key}>
            <p
              className={
                groupBy !== "date"
                  ? "text-lg font-bold text-ink mb-2"
                  : "text-sm font-medium text-ink/40 mb-2"
              }
            >
              {key}{" "}
              <span className={groupBy !== "date" ? "text-sm font-normal text-ink/40" : "text-ink/25"}>
                · {groupCountLabel(locale, groupWords.length)}
              </span>
            </p>

            <div className="flex flex-col gap-2">
              {sets.map((setWords) => (
                <div key={setWords[0].session_id} className="rounded-xl border border-accent/30 bg-accent/5 p-2">
                  <p className="text-[11px] text-accent/70 mb-1.5 px-0.5">{setLabel(locale, setWords.length)}</p>
                  <div className="grid grid-cols-3 gap-2">{setWords.map(renderCard)}</div>
                </div>
              ))}

              {(standalone.length > 0 || onAddToGroup) && (
                <div className="grid grid-cols-3 gap-2">
                  {standalone.map(renderCard)}
                  {onAddToGroup && (
                    <button
                      onClick={() => onAddToGroup(key)}
                      className="aspect-square rounded-xl border border-dashed border-ink/20 flex items-center justify-center text-ink/30 hover:bg-locked text-2xl"
                      aria-label={t.addSentenceAria}
                    >
                      +
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
