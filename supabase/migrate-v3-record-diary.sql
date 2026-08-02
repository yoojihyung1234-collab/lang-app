-- ============================================================
-- 녹음 일기(즉석 인출 훈련) 기능 추가 마이그레이션
-- SQL Editor에 그대로 붙여넣고 실행하세요. 여러 번 실행해도 안전합니다.
-- (schema.sql, migrate-v2-languages-topics.sql을 이미 실행한 프로젝트 기준)
-- ============================================================

-- 녹음 일기에서 재녹음한 발음 파일의 storage 경로를 저장할 컬럼
alter table public.words add column if not exists audio_path text;

-- 녹음 파일 저장용 비공개 버킷 (본인만 업로드/조회/삭제 가능)
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
