-- ============================================================
-- 언어 공부 앱 - Supabase 스키마
-- Supabase 프로젝트의 SQL Editor에 이 파일 전체를 그대로 붙여넣고 실행하세요.
-- 여러 번 실행해도 안전합니다(이미 있는 테이블/정책은 건드리지 않음).
-- ============================================================

create extension if not exists "uuid-ossp";

-- 수집함 (플래시카드) — box/next_review_date는 라이트너 방식 간격 반복에 씀.
-- language는 자유 입력(예: "영어", "프랑스어")이라 값 제한을 두지 않음
-- audio_path는 녹음 일기에서 재녹음한 발음 파일의 storage 경로 (없으면 null)
create table if not exists public.words (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  language text not null,
  term text not null,
  meaning text not null,
  example text,
  topic text not null default '기타',
  card_date date not null default current_date,
  box integer not null default 1,
  next_review_date date not null default current_date,
  audio_path text,
  starred boolean not null default false,
  session_id uuid,
  created_at timestamptz not null default now()
);

-- 사용자가 기본 3개 언어(영어/독일어/일본어) 외에 직접 추가한 언어 목록.
-- 단어를 하나도 안 만들어도 언어 선택 화면에 카드로 계속 보이게 하기 위해 따로 저장함
create table if not exists public.languages (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name)
);

create index if not exists idx_words_user on public.words(user_id);
create index if not exists idx_words_next_review on public.words(user_id, next_review_date);
create index if not exists idx_words_card_date on public.words(user_id, language, card_date);
create index if not exists idx_words_topic on public.words(user_id, language, topic);
create index if not exists idx_words_session on public.words(session_id);
create index if not exists idx_languages_user on public.languages(user_id);

alter table public.words enable row level security;
alter table public.languages enable row level security;

drop policy if exists "본인 단어만 CRUD" on public.words;
create policy "본인 단어만 CRUD" on public.words
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "본인 언어만 CRUD" on public.languages;
create policy "본인 언어만 CRUD" on public.languages
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 녹음 일기(즉석 인출 훈련)에서 재녹음한 발음 파일 저장용 비공개 버킷.
-- 본인 user_id 폴더 안에서만 업로드/조회/삭제 가능 (공개 접근 불가, 재생 시 서명된 URL 사용)
insert into storage.buckets (id, name, public)
values ('recordings', 'recordings', false)
on conflict (id) do nothing;

drop policy if exists "본인 폴더 녹음파일만 조회" on storage.objects;
create policy "본인 폴더 녹음파일만 조회"
  on storage.objects for select
  using (bucket_id = 'recordings' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "본인 폴더에만 녹음파일 업로드" on storage.objects;
create policy "본인 폴더에만 녹음파일 업로드"
  on storage.objects for insert
  with check (bucket_id = 'recordings' and auth.uid()::text = (storage.foldername(name))[1]);

drop policy if exists "본인 녹음파일만 삭제" on storage.objects;
create policy "본인 녹음파일만 삭제"
  on storage.objects for delete
  using (bucket_id = 'recordings' and auth.uid()::text = (storage.foldername(name))[1]);
