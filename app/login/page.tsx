"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "@/lib/i18n";

export default function LoginPage() {
  const router = useRouter();
  const { locale, setLocale, t } = useI18n();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const supabase = createClient();

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setLoading(false);
        return;
      }
      router.push("/");
      router.refresh();
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setLoading(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }
    setMessage(t.confirmEmailSent);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm relative">
        <button
          onClick={() => setLocale(locale === "ko" ? "pl" : "ko")}
          className="absolute -top-10 right-0 text-xs px-3 py-1.5 rounded-full bg-locked text-ink/70 hover:bg-ink/10"
        >
          {locale === "ko" ? "PL" : "KO"}
        </button>

        <h1 className="text-lg font-bold text-ink mb-1">{t.appTitle}</h1>
        <p className="text-sm text-ink/50 mb-6">
          {mode === "login" ? t.loginSubtitleLogin : t.loginSubtitleSignup}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t.emailPlaceholder}
            className="text-sm px-3 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t.passwordPlaceholder}
            className="text-sm px-3 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
          />

          {message && <p className="text-xs text-bad leading-relaxed">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="text-sm px-3 py-2.5 rounded-lg bg-ink text-white disabled:opacity-40"
          >
            {loading ? t.processing : mode === "login" ? t.loginBtn : t.signupBtn}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === "login" ? "signup" : "login"));
            setMessage(null);
          }}
          className="mt-4 text-xs text-ink/50 hover:text-ink"
        >
          {mode === "login" ? t.noAccountPrompt : t.hasAccountPrompt}
        </button>
      </div>
    </div>
  );
}
