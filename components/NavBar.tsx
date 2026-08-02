"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();

  if (pathname.startsWith("/login")) return null;

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="max-w-2xl mx-auto px-4 pt-6 pb-2 flex items-center justify-between">
      <Link href="/" className="text-sm font-bold text-ink">
        {t.appTitle}
      </Link>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLocale(locale === "ko" ? "pl" : "ko")}
          className="text-xs px-2 py-1 rounded-full bg-locked text-ink/60 hover:bg-ink/10"
        >
          {locale === "ko" ? "PL" : "KO"}
        </button>
        <button onClick={logout} className="text-xs text-ink/40 hover:text-ink">
          {t.logout}
        </button>
      </div>
    </header>
  );
}
