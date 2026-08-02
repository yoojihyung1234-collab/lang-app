"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import { DEFAULT_LANGUAGES } from "./types";

export function useLanguages() {
  const [languages, setLanguages] = useState<string[]>(DEFAULT_LANGUAGES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase.from("languages").select("name").eq("user_id", user.id);
        const custom = (data ?? []).map((l) => l.name as string);
        setLanguages([...DEFAULT_LANGUAGES, ...custom.filter((n) => !DEFAULT_LANGUAGES.includes(n))]);
      }
      setLoading(false);
    }
    load();
  }, []);

  async function addLanguage(name: string) {
    const trimmed = name.trim();
    if (!trimmed || languages.includes(trimmed)) return;

    setLanguages((prev) => [...prev, trimmed]);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("languages").insert({ id: crypto.randomUUID(), user_id: user.id, name: trimmed });
  }

  // 기본 3개 언어(영어/독일어/일본어)는 DB에 없는 내장 옵션이라 삭제 대상이 아님 — 직접 추가한 언어만 삭제
  async function removeLanguage(name: string) {
    if (DEFAULT_LANGUAGES.includes(name)) return;

    setLanguages((prev) => prev.filter((l) => l !== name));

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("languages").delete().eq("user_id", user.id).eq("name", name);
  }

  return { languages, loading, addLanguage, removeLanguage };
}
