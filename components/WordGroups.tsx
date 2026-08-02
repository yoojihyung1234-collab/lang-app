"use client";

import { Word } from "@/lib/types";
import { todayStr } from "@/lib/srs";
import { createClient } from "@/lib/supabase/client";

type Props = {
  words: Word[];
  groupBy: "date" | "topic";
  onEdit: (word: Word) => void;
};

function groupWords(words: Word[], groupBy: "date" | "topic"): [string, Word[]][] {
  const key = groupBy === "date" ? "card_date" : "topic";
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

export default function WordGroups({ words, groupBy, onEdit }: Props) {
  const today = todayStr();

  if (words.length === 0) {
    return <p className="text-sm text-ink/40 py-6 text-center">아직 수집한 문장이 없어요.</p>;
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
        className="relative aspect-square rounded-xl border border-ink/10 p-2 flex items-center justify-center text-center hover:bg-locked bg-bg"
      >
        {due && <span className="absolute top-1.5 left-1.5 text-accent text-xs">●</span>}
        <p className="text-xs leading-snug line-clamp-4">{w.term}</p>
        {w.audio_path && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              play(w.audio_path!);
            }}
            className="absolute bottom-1 right-1.5 text-ink/30 hover:text-ink text-xs"
            aria-label="발음 재생"
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
            <p className="text-xs font-medium text-ink/40 mb-2">
              {key} <span className="text-ink/25">· {groupWords.length}개</span>
            </p>

            <div className="flex flex-col gap-2">
              {sets.map((setWords) => (
                <div key={setWords[0].session_id} className="rounded-xl border border-accent/30 bg-accent/5 p-2">
                  <p className="text-[11px] text-accent/70 mb-1.5 px-0.5">세트 · {setWords.length}개</p>
                  <div className="grid grid-cols-5 gap-2">{setWords.map(renderCard)}</div>
                </div>
              ))}

              {standalone.length > 0 && (
                <div className="grid grid-cols-5 gap-2">{standalone.map(renderCard)}</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
