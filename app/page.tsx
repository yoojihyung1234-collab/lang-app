"use client";

import { useState } from "react";
import Link from "next/link";
import { useLanguages } from "@/lib/useLanguages";
import { deleteLanguageAria, useI18n } from "@/lib/i18n";

export default function LanguagePickerPage() {
  const { t, locale } = useI18n();
  const { languages, defaultLanguages, loading, addLanguage, removeLanguage } = useLanguages();
  const [adding, setAdding] = useState(false);
  const [newLang, setNewLang] = useState("");

  function submitNewLanguage(e: React.FormEvent) {
    e.preventDefault();
    if (!newLang.trim()) return;
    addLanguage(newLang);
    setNewLang("");
    setAdding(false);
  }

  if (loading) return null;

  return (
    <div className="pt-4">
      <h1 className="text-lg font-bold mb-4">{t.pickerTitle}</h1>

      <div className="grid grid-cols-2 gap-3">
        {languages.map((lang) => (
          <div key={lang} className="relative">
            <Link
              href={`/lang/${encodeURIComponent(lang)}`}
              className="flex items-center justify-center h-24 rounded-2xl border border-ink/10 text-lg font-bold hover:bg-locked"
            >
              {lang}
            </Link>
            {!defaultLanguages.includes(lang) && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeLanguage(lang);
                }}
                className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded-full text-ink/30 hover:text-bad hover:bg-white text-xs"
                aria-label={deleteLanguageAria(locale, lang)}
              >
                ×
              </button>
            )}
          </div>
        ))}

        {adding ? (
          <form
            onSubmit={submitNewLanguage}
            className="flex flex-col gap-2 h-24 rounded-2xl border border-dashed border-ink/20 p-2 justify-center"
          >
            <input
              autoFocus
              value={newLang}
              onChange={(e) => setNewLang(e.target.value)}
              onBlur={() => !newLang.trim() && setAdding(false)}
              placeholder={t.languageNamePlaceholder}
              className="text-sm px-2 py-1.5 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
            />
            <button type="submit" className="text-xs px-2 py-1 rounded-lg bg-ink text-white">
              {t.add}
            </button>
          </form>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex items-center justify-center h-24 rounded-2xl border border-dashed border-ink/20 text-2xl text-ink/30 hover:bg-locked"
          >
            +
          </button>
        )}
      </div>
    </div>
  );
}
