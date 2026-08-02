-- ============================================================
-- 녹음 일기에서 이어서 추가한 표현들을 한 세트로 묶어 보여주는 기능 마이그레이션
-- SQL Editor에 그대로 붙여넣고 실행하세요. 여러 번 실행해도 안전합니다.
-- ============================================================

alter table public.words add column if not exists session_id uuid;
create index if not exists idx_words_session on public.words(session_id);
