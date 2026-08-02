"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Locale = "ko" | "pl";

const STORAGE_KEY = "lang-app-locale";

// 언어 선택 화면의 기본 언어 카드 — 로케일에 따라 자기 모국어 이름으로 보이게 함
export const LOCALE_DEFAULT_LANGUAGES: Record<Locale, string[]> = {
  ko: ["영어", "독일어", "일본어"],
  pl: ["Angielski", "Niemiecki", "Japoński"],
};

type TranslationKey =
  | "appTitle"
  | "logout"
  | "loginSubtitleLogin"
  | "loginSubtitleSignup"
  | "emailPlaceholder"
  | "passwordPlaceholder"
  | "processing"
  | "loginBtn"
  | "signupBtn"
  | "noAccountPrompt"
  | "hasAccountPrompt"
  | "confirmEmailSent"
  | "pickerTitle"
  | "languageNamePlaceholder"
  | "add"
  | "changeLanguage"
  | "tabCollection"
  | "tabDiary"
  | "tabQuiz"
  | "addSentenceAria"
  | "byDate"
  | "byTopic"
  | "problemPlaceholder"
  | "answerPlaceholder"
  | "memoPlaceholder"
  | "topicPlaceholder"
  | "cancel"
  | "save"
  | "delete"
  | "emptyCollection"
  | "playAudioAria"
  | "range"
  | "none"
  | "unit"
  | "date"
  | "questionCount"
  | "categoryTopic"
  | "categoryDate"
  | "categoryStarred"
  | "categoryAllRandom"
  | "granDay"
  | "granWeek"
  | "granMonth"
  | "resultLabel"
  | "retry"
  | "allOption"
  | "emptyRange"
  | "setBadge"
  | "quizAnswerPlaceholder"
  | "checkAnswer"
  | "correctAnswerLabel"
  | "wrong"
  | "correct"
  | "diaryStep1"
  | "diaryStep2"
  | "diaryStep3"
  | "diaryKoreanLabel"
  | "diaryMySentenceLabel"
  | "diaryCorrectLabel"
  | "quickAddPrompt"
  | "savingBtn"
  | "saveToCollectionBtn"
  | "savedToast"
  | "prev"
  | "next"
  | "reRecord"
  | "recordStartAria"
  | "recordStopAria"
  | "micError"
  | "reviewTitle"
  | "backToCollection"
  | "noReviewToday"
  | "tapToReveal"
  | "starAria"
  | "remainingCards"
  | "know"
  | "dontKnow"
  | "allTab";

type Dict = Record<TranslationKey, string>;

const ko: Dict = {
  appTitle: "언어 공부",
  logout: "로그아웃",
  loginSubtitleLogin: "로그인하고 학습을 이어가세요",
  loginSubtitleSignup: "새 계정을 만들어 시작하세요",
  emailPlaceholder: "이메일",
  passwordPlaceholder: "비밀번호 (6자 이상)",
  processing: "처리 중...",
  loginBtn: "로그인",
  signupBtn: "회원가입",
  noAccountPrompt: "계정이 없으신가요? 회원가입",
  hasAccountPrompt: "이미 계정이 있으신가요? 로그인",
  confirmEmailSent: "확인 이메일을 보냈어요. 메일함을 확인해주세요.",
  pickerTitle: "언어 선택",
  languageNamePlaceholder: "언어 이름",
  add: "추가",
  changeLanguage: "← 언어 변경",
  tabCollection: "수집함",
  tabDiary: "녹음 일기",
  tabQuiz: "퀴즈",
  addSentenceAria: "문장 추가",
  byDate: "일자별",
  byTopic: "주제별",
  problemPlaceholder: "문제",
  answerPlaceholder: "답",
  memoPlaceholder: "메모 (선택)",
  topicPlaceholder: "주제",
  cancel: "취소",
  save: "저장",
  delete: "삭제",
  emptyCollection: "아직 수집한 문장이 없어요.",
  playAudioAria: "발음 재생",
  range: "범위",
  none: "없음",
  unit: "단위",
  date: "날짜",
  questionCount: "문제 수",
  categoryTopic: "주제별",
  categoryDate: "일자별",
  categoryStarred: "별표만",
  categoryAllRandom: "전체 랜덤",
  granDay: "일별",
  granWeek: "주별",
  granMonth: "월별",
  resultLabel: "결과",
  retry: "다시 풀기",
  allOption: "전체",
  emptyRange: "이 범위에 수집한 문장이 없어요.",
  setBadge: "· 세트",
  quizAnswerPlaceholder: "뜻을 적어보세요",
  checkAnswer: "정답 확인",
  correctAnswerLabel: "정답",
  wrong: "틀렸어요",
  correct: "맞았어요",
  diaryStep1: "1. 하고 싶은 말을 한국어로 적기",
  diaryStep2: "2. 외국어로 말하며 녹음하기",
  diaryStep3: "3. 내가 만든 문장과 올바른 문장 비교하고 저장",
  diaryKoreanLabel: "1. 하고 싶었던 말 (한국어)",
  diaryMySentenceLabel: "2. 내가 만든 문장",
  diaryCorrectLabel: "3. 올바른 문장",
  quickAddPrompt: "+ 몰랐던 표현 수집함에 추가",
  savingBtn: "저장 중...",
  saveToCollectionBtn: "수집함에 추가",
  savedToast: "수집함에 추가됐어요.",
  prev: "이전",
  next: "다음",
  reRecord: "다시 녹음",
  recordStartAria: "녹음 시작",
  recordStopAria: "녹음 중지",
  micError: "마이크 권한이 필요해요. 브라우저 설정에서 마이크 접근을 허용해주세요.",
  reviewTitle: "복습",
  backToCollection: "수집함으로",
  noReviewToday: "오늘 복습할 문장이 없어요. 잘하고 있어요!",
  tapToReveal: "탭해서 뜻 보기",
  starAria: "중요 표시",
  remainingCards: "남은 카드",
  know: "알아요",
  dontKnow: "몰라요",
  allTab: "전체",
};

const pl: Dict = {
  appTitle: "Nauka języków",
  logout: "Wyloguj",
  loginSubtitleLogin: "Zaloguj się i kontynuuj naukę",
  loginSubtitleSignup: "Załóż nowe konto, aby zacząć",
  emailPlaceholder: "E-mail",
  passwordPlaceholder: "Hasło (min. 6 znaków)",
  processing: "Przetwarzanie...",
  loginBtn: "Zaloguj się",
  signupBtn: "Zarejestruj się",
  noAccountPrompt: "Nie masz konta? Zarejestruj się",
  hasAccountPrompt: "Masz już konto? Zaloguj się",
  confirmEmailSent: "Wysłaliśmy e-mail z potwierdzeniem. Sprawdź swoją skrzynkę.",
  pickerTitle: "Wybierz język",
  languageNamePlaceholder: "Nazwa języka",
  add: "Dodaj",
  changeLanguage: "← Zmień język",
  tabCollection: "Kolekcja",
  tabDiary: "Dziennik nagrań",
  tabQuiz: "Quiz",
  addSentenceAria: "Dodaj zdanie",
  byDate: "Wg daty",
  byTopic: "Wg tematu",
  problemPlaceholder: "Pytanie",
  answerPlaceholder: "Odpowiedź",
  memoPlaceholder: "Notatka (opcjonalnie)",
  topicPlaceholder: "Temat",
  cancel: "Anuluj",
  save: "Zapisz",
  delete: "Usuń",
  emptyCollection: "Nie masz jeszcze żadnych zebranych zdań.",
  playAudioAria: "Odtwórz wymowę",
  range: "Zakres",
  none: "Brak",
  unit: "Jednostka",
  date: "Data",
  questionCount: "Liczba pytań",
  categoryTopic: "Wg tematu",
  categoryDate: "Wg daty",
  categoryStarred: "Tylko oznaczone gwiazdką",
  categoryAllRandom: "Wszystkie losowo",
  granDay: "Dziennie",
  granWeek: "Tygodniowo",
  granMonth: "Miesięcznie",
  resultLabel: "Wynik",
  retry: "Spróbuj ponownie",
  allOption: "Wszystkie",
  emptyRange: "W tym zakresie nie ma zebranych zdań.",
  setBadge: "· zestaw",
  quizAnswerPlaceholder: "Wpisz znaczenie",
  checkAnswer: "Sprawdź odpowiedź",
  correctAnswerLabel: "Poprawna odpowiedź",
  wrong: "Źle",
  correct: "Dobrze",
  diaryStep1: "1. Napisz po polsku, co chcesz powiedzieć",
  diaryStep2: "2. Powiedz to w obcym języku i nagraj",
  diaryStep3: "3. Porównaj swoje zdanie z poprawnym i zapisz",
  diaryKoreanLabel: "1. To, co chciałeś/aś powiedzieć (po polsku)",
  diaryMySentenceLabel: "2. Moje zdanie",
  diaryCorrectLabel: "3. Poprawne zdanie",
  quickAddPrompt: "+ Dodaj nieznany zwrot do kolekcji",
  savingBtn: "Zapisywanie...",
  saveToCollectionBtn: "Dodaj do kolekcji",
  savedToast: "Dodano do kolekcji.",
  prev: "Wstecz",
  next: "Dalej",
  reRecord: "Nagraj ponownie",
  recordStartAria: "Rozpocznij nagrywanie",
  recordStopAria: "Zatrzymaj nagrywanie",
  micError: "Wymagany jest dostęp do mikrofonu. Zezwól na dostęp w ustawieniach przeglądarki.",
  reviewTitle: "Powtórka",
  backToCollection: "Do kolekcji",
  noReviewToday: "Nie masz dziś nic do powtórki. Świetna robota!",
  tapToReveal: "Dotknij, aby zobaczyć znaczenie",
  starAria: "Oznacz jako ważne",
  remainingCards: "Pozostałe karty",
  know: "Znam",
  dontKnow: "Nie znam",
  allTab: "Wszystkie",
};

const DICT: Record<Locale, Dict> = { ko, pl };

// 인자가 필요한 문구는 사전 밖의 함수로 따로 만듦 (로케일별로 문법이 달라서)
export function setLabel(locale: Locale, n: number): string {
  return locale === "ko" ? `세트 · ${n}개` : `Zestaw · ${n}`;
}

export function groupCountLabel(locale: Locale, n: number): string {
  return locale === "ko" ? `${n}개` : `${n}`;
}

export function startQuizLabel(locale: Locale, n: number): string {
  return locale === "ko" ? `퀴즈 시작 (${n}문제)` : `Rozpocznij quiz (${n})`;
}

export function questionCountOptionLabel(locale: Locale, n: number | "all"): string {
  if (n === "all") return locale === "ko" ? "전체" : "Wszystkie";
  return locale === "ko" ? `${n}문제` : `${n}`;
}

export function deleteLanguageAria(locale: Locale, lang: string): string {
  return locale === "ko" ? `${lang} 삭제` : `Usuń ${lang}`;
}

export function recordPrompt(locale: Locale, korean: string, language: string): string {
  return locale === "ko" ? `“${korean}”\n를 ${language}로 말해보세요` : `Powiedz „${korean}”\npo ${language}`;
}

const PL_MONTHS_GENITIVE = [
  "stycznia",
  "lutego",
  "marca",
  "kwietnia",
  "maja",
  "czerwca",
  "lipca",
  "sierpnia",
  "września",
  "października",
  "listopada",
  "grudnia",
];
const KO_WEEK_ORDINALS = ["첫째", "둘째", "셋째", "넷째", "다섯째"];
const PL_WEEK_ORDINALS = ["pierwszy", "drugi", "trzeci", "czwarty", "piąty"];

// 그 주의 월요일 날짜를 "7월 첫째 주" / "pierwszy tydzień lipca" 식으로 표기
export function weekLabel(locale: Locale, mondayDateStr: string): string {
  const d = new Date(mondayDateStr + "T00:00:00");
  const monthIndex = d.getMonth();
  const ordinalIndex = Math.ceil(d.getDate() / 7) - 1;

  if (locale === "ko") {
    return `${monthIndex + 1}월 ${KO_WEEK_ORDINALS[ordinalIndex]} 주`;
  }
  return `${PL_WEEK_ORDINALS[ordinalIndex]} tydzień ${PL_MONTHS_GENITIVE[monthIndex]}`;
}

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: Dict;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ko");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ko" || saved === "pl") setLocaleState(saved);
  }, []);

  function setLocale(next: Locale) {
    setLocaleState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale, t: DICT[locale] }}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
