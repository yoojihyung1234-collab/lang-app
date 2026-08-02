"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NavBar() {
  const pathname = usePathname();
  const router = useRouter();

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
        언어 공부
      </Link>
      <button onClick={logout} className="text-xs text-ink/40 hover:text-ink">
        로그아웃
      </button>
    </header>
  );
}
