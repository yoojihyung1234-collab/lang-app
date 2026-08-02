"use client";

import { useI18n } from "@/lib/i18n";

type Props = {
  languages: string[];
  value: string | "all";
  onChange: (value: string | "all") => void;
};

export default function LanguageTabs({ languages, value, onChange }: Props) {
  const { t } = useI18n();
  const options: (string | "all")[] = ["all", ...languages];

  return (
    <div className="flex gap-1 mb-4 flex-wrap">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onChange(opt)}
          className={`text-xs px-3 py-1.5 rounded-full ${
            value === opt ? "bg-ink text-white" : "bg-locked text-ink/60 hover:bg-ink/10"
          }`}
        >
          {opt === "all" ? t.allTab : opt}
        </button>
      ))}
    </div>
  );
}
