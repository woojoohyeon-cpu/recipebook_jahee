-- =============================================
-- 자희네 레시피북 Supabase 스키마
-- Supabase Dashboard > SQL Editor 에서 실행
-- =============================================

-- 1. 레시피 테이블 생성
create table if not exists recipes (
  id          uuid        default gen_random_uuid() primary key,
  user_id     uuid        references auth.users(id) on delete cascade not null,
  title       text        not null,
  category    text        not null check (
    category in ('국·찌개', '메인반찬', '기타반찬', '밥·면', '쌈·샐러드', '한상차림', '기타')
  ),
  photo_url   text,
  side_dishes text[]      default '{}',
  ingredients text[]      default '{}',
  notes       text,
  created_at  timestamptz default now()
);

-- 2. RLS (Row Level Security) 활성화
alter table recipes enable row level security;

-- 3. 정책: 로그인한 사용자는 모든 레시피 조회 가능 (가족 공유)
create policy "authenticated_view_recipes"
  on recipes for select
  to authenticated
  using (true);

-- 4. 정책: 자신의 레시피만 추가
create policy "authenticated_insert_own"
  on recipes for insert
  to authenticated
  with check (auth.uid() = user_id);

-- 5. 정책: 자신의 레시피만 수정
create policy "authenticated_update_own"
  on recipes for update
  to authenticated
  using (auth.uid() = user_id);

-- 6. 정책: 자신의 레시피만 삭제
create policy "authenticated_delete_own"
  on recipes for delete
  to authenticated
  using (auth.uid() = user_id);


-- =============================================
-- Storage 설정 (아래 2가지 방법 중 하나 선택)
-- =============================================

-- [방법 A] Dashboard에서 직접 생성 (권장)
--   Storage > New bucket
--   Name: recipe-photos
--   Public bucket: ON (체크)
--   저장 후 아래 SQL만 실행:

create policy "authenticated_upload_photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'recipe-photos');

create policy "public_view_photos"
  on storage.objects for select
  using (bucket_id = 'recipe-photos');

create policy "authenticated_delete_own_photos"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'recipe-photos'
    and (storage.foldername(name))[1] = auth.uid()::text
  );


-- =============================================
-- 기존 DB에 ingredients 컬럼 추가 (이미 테이블이 있는 경우 실행)
-- =============================================
alter table recipes add column if not exists ingredients text[] default '{}';


-- [방법 B] SQL로 버킷까지 생성
-- insert into storage.buckets (id, name, public)
-- values ('recipe-photos', 'recipe-photos', true)
-- on conflict do nothing;
