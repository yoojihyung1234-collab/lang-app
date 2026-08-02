import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import { I18nProvider } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "언어 공부",
  description: "문장 수집, 퀴즈, 작문 연습을 위한 개인 언어 공부 앱",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <I18nProvider>
          <NavBar />
          <main className="max-w-2xl mx-auto px-4 pb-16">{children}</main>
        </I18nProvider>
      </body>
    </html>
  );
}
