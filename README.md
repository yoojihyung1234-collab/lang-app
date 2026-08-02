# 언어 공부 앱 - 실행 가이드

문장 수집(플래시카드) + 녹음 일기(즉석 인출 훈련) + 퀴즈를 위한 개인 언어 공부 앱입니다.
언어는 영어/독일어/일본어가 기본이고, 화면에서 직접 다른 언어도 추가할 수 있습니다.

## 1. 실행하기

```bash
npm install
npm run dev
```

브라우저에서 http://localhost:3000 접속. (Supabase 연결 전에는 로그인이 되지 않으므로, 먼저 2단계를 진행하세요.)

## 2. Supabase 연결하기

plan-app과는 별개의 새 Supabase 프로젝트를 만드는 걸 추천합니다.

1. https://supabase.com 에서 새 프로젝트 생성
2. 프로젝트의 **SQL Editor**에서 `supabase/schema.sql` 내용을 그대로 실행
   → words(수집한 문장), languages(추가한 언어) 테이블 + recordings 스토리지 버킷 + RLS 정책까지
   한 번에 생성됩니다
3. 프로젝트 **Settings > API**에서 `Project URL`과 `anon public key` 복사
4. 루트에 `.env.local` 파일 생성 후 `.env.local.example`을 참고해 값 채우기:

```bash
cp .env.local.example .env.local
```

5. 서버 재시작(`npm run dev`) 후, 회원가입하면 바로 사용할 수 있습니다.

이미 예전 버전의 `schema.sql`을 실행해둔 프로젝트라면 아래 마이그레이션을 순서대로 SQL Editor에서
실행해줘야 합니다 (여러 번 실행해도 안전):
1. `supabase/migrate-v2-languages-topics.sql` — 언어 자유 추가 / 주제·날짜 기능
2. `supabase/migrate-v3-record-diary.sql` — 녹음 일기 기능 (audio_path 컬럼 + recordings 버킷)
3. `supabase/migrate-v4-starred.sql` — 복습 카드 별표 표시 기능 (starred 컬럼)

## 3. 기능

언어를 먼저 고르면(`/`), 그 언어 안에서 3개 탭을 오갑니다.

- **수집함**: 외국어 문장 + 한국어 번역을 카드로 수집. 일자별/주제별로 묶어서 볼 수 있고, 라이트너
  박스 방식 간격 반복으로 복습 대기 상태를 표시. "복습하기"로 오늘 복습할 문장을 플래시카드로 넘기며
  암기(정답/오답에 따라 다음 복습일 자동 조정)
- **녹음 일기**: 즉석 인출 훈련 5단계 — ① 하고 싶은 말을 한국어로 작성 → ② 외국어로 말하며 녹음 →
  ③ 녹음을 들으며 받아적기(전사) → ④ 틀린 부분 직접 고치기 → ⑤ 고친 문장으로 재녹음. 완료하면
  주제/날짜를 골라 수집함에 문장 카드로 저장되고, 재녹음한 발음도 함께 저장되어 카드에서 재생 가능
- **퀴즈**: 수집한 문장으로 4지선다 퀴즈 생성 후 채점 (언어당 문장 4개 이상 필요)

## 4. 폴더 구조

```
lang-app/
├─ app/
│  ├─ page.tsx                        # 언어 선택 화면
│  ├─ lang/[language]/layout.tsx      # 언어별 3탭(수집함/녹음 일기/퀴즈) 네비게이션
│  ├─ lang/[language]/page.tsx        # 수집함 (일자별/주제별)
│  ├─ lang/[language]/record-diary/page.tsx  # 녹음 일기 (5단계 인출 훈련)
│  ├─ lang/[language]/quiz/page.tsx   # 퀴즈
│  ├─ words/review/page.tsx           # 플래시카드 복습
│  └─ login/page.tsx                  # 로그인/회원가입
├─ components/
│  ├─ CardForm.tsx / WordGroups.tsx / FlashcardReview.tsx
│  ├─ Recorder.tsx                    # 마이크 녹음 UI
│  ├─ QuizSession.tsx
│  └─ LanguageTabs.tsx / NavBar.tsx
├─ lib/
│  ├─ types.ts / useLanguages.ts / useAudioRecorder.ts
│  ├─ srs.ts (간격 반복 계산) / quiz.ts (퀴즈 생성)
│  └─ supabase/{client,server,middleware}.ts
└─ supabase/schema.sql, migrate-v2-languages-topics.sql, migrate-v3-record-diary.sql
```
