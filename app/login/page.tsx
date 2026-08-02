"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
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
    setMessage("확인 이메일을 보냈어요. 메일함을 확인해주세요.");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-lg font-bold text-ink mb-1">언어 공부</h1>
        <p className="text-sm text-ink/50 mb-6">
          {mode === "login" ? "로그인하고 학습을 이어가세요" : "새 계정을 만들어 시작하세요"}
        </p>

        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="text-sm px-3 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
          />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호 (6자 이상)"
            className="text-sm px-3 py-2.5 rounded-lg border border-ink/15 focus:outline-none focus:border-ink/40"
          />

          {message && <p className="text-xs text-bad leading-relaxed">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="text-sm px-3 py-2.5 rounded-lg bg-ink text-white disabled:opacity-40"
          >
            {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode((m) => (m === "login" ? "signup" : "login"));
            setMessage(null);
          }}
          className="mt-4 text-xs text-ink/50 hover:text-ink"
        >
          {mode === "login" ? "계정이 없으신가요? 회원가입" : "이미 계정이 있으신가요? 로그인"}
        </button>
      </div>
    </div>
  );
}
