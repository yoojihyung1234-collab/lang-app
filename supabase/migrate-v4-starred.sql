-- ============================================================
-- 복습 카드 별표 표시 기능 추가 마이그레이션
-- SQL Editor에 그대로 붙여넣고 실행하세요. 여러 번 실행해도 안전합니다.
-- ============================================================

alter table public.words add column if not exists starred boolean not null default false;
