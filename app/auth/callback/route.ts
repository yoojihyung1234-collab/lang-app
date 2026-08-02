import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// 이메일 확인 링크(회원가입 시 발송)를 클릭하면 이 라우트로 돌아와서 세션을 발급받음
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(`${origin}/`);
}
