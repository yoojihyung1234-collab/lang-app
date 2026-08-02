-- ============================================================
-- 이미 schema.sql을 한 번 실행한 프로젝트를 위한 추가 마이그레이션
-- (언어 자유 입력 + 단어 주제/날짜 + 커스텀 언어 목록 지원)
-- SQL Editor에 그대로 붙여넣고 실행하세요. 여러 번 실행해도 안전합니다.
-- ============================================================

-- 언어 값을 영/독/일 3개로 제한하던 체크 제약을 없애서 자유 입력을 허용
alter table public.words drop constraint if exists words_language_check;
alter table public.diary_entries drop constraint if exists diary_entries_language_check;

-- 단어 카드에 주제/날짜를 직접 지정할 수 있도록 컬럼 추가
alter table public.words add column if not exists topic text not null default '기타';
alter table public.words add column if not exists card_date date not null default current_date;

create index if not exists idx_words_card_date on public.words(user_id, language, card_date);
create index if not exists idx_words_topic on public.words(user_id, language, topic);

-- 기본 3개 언어 외에 직접 추가한 언어를 기억해두는 테이블
create table if not exists public.languages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists idx_languages_user on public.languages(user_id);

alter table public.languages enable row level security;

drop policy if exists "본인 언어만 CRUD" on public.languages;
create policy "본인 언어만 CRUD" on public.languages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
