"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = { children: React.ReactNode; params: { language: string } };

export default function LanguageLayout({ children, params }: Props) {
  const language = decodeURIComponent(params.language);
  const pathname = usePathname();
  const base = `/lang/${encodeURIComponent(language)}`;

  const tabs = [
    { href: base, label: "수집함" },
    { href: `${base}/record-diary`, label: "녹음 일기" },
    { href: `${base}/quiz`, label: "퀴즈" },
  ];

  return (
    <div className="pt-4">
      <Link href="/" className="text-xs text-ink/40 hover:text-ink">
        ← 언어 변경
      </Link>
      <h1 className="text-lg font-bold mt-1 mb-3">{language}</h1>

      <div className="flex gap-1 mb-4">
        {tabs.map((tab) => {
          const active = tab.href === base ? pathname === base : pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`text-xs px-3 py-1.5 rounded-full ${
                active ? "bg-ink text-white" : "bg-locked text-ink/60"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {children}
    </div>
  );
}
