"use client";

import { useEffect, useState } from "react";
import { createClient } from "./supabase/client";
import { LOCALE_DEFAULT_LANGUAGES, useI18n } from "./i18n";

export function useLanguages() {
  const { locale } = useI18n();
  const defaultLanguages = LOCALE_DEFAULT_LANGUAGES[locale];
  const [customLanguages, setCustomLanguages] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data } = await supabase.from("languages").select("name").eq("user_id", user.id);
        setCustomLanguages((data ?? []).map((l) => l.name as string));
      }
      setLoading(false);
    }
    load();
  }, []);

  const languages = [...defaultLanguages, ...customLanguages.filter((n) => !defaultLanguages.includes(n))];

  async function addLanguage(name: string) {
    const trimmed = name.trim();
    if (!trimmed || languages.includes(trimmed)) return;

    setCustomLanguages((prev) => [...prev, trimmed]);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("languages").insert({ id: crypto.randomUUID(), user_id: user.id, name: trimmed });
  }

  // 기본 언어 카드는 DB에 없는 내장 옵션이라 삭제 대상이 아님 — 직접 추가한 언어만 삭제
  async function removeLanguage(name: string) {
    if (defaultLanguages.includes(name)) return;

    setCustomLanguages((prev) => prev.filter((l) => l !== name));

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("languages").delete().eq("user_id", user.id).eq("name", name);
  }

  return { languages, defaultLanguages, loading, addLanguage, removeLanguage };
}
