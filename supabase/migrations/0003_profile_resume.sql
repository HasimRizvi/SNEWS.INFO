-- =============================================================
-- 0003 — Profile & resume support
-- Columns for bio/avatar on profiles, resume on student_profiles,
-- plus private storage buckets (avatars, resumes) with RLS.
-- Run this once in the Supabase SQL editor.
-- =============================================================

alter table public.profiles
  add column if not exists bio       text,
  add column if not exists avatar_url text;

alter table public.student_profiles
  add column if not exists headline    text,
  add column if not exists resume_url  text,
  add column if not exists resume_name text;

-- ---------------------------------------------------------------------
-- Storage buckets
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- avatars bucket: publicly readable, owner-only writes
-- ---------------------------------------------------------------------
create policy avatars_public_read
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy avatars_insert_own
  on storage.objects for insert
  with check (bucket_id = 'avatars' and owner = auth.uid());

create policy avatars_update_own
  on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid());

create policy avatars_delete_own
  on storage.objects for delete
  using (bucket_id = 'avatars' and owner = auth.uid());

-- ---------------------------------------------------------------------
-- resumes bucket: private, owner-only access (signed URLs for download)
-- ---------------------------------------------------------------------
create policy resumes_select_own
  on storage.objects for select
  using (bucket_id = 'resumes' and owner = auth.uid());

create policy resumes_insert_own
  on storage.objects for insert
  with check (bucket_id = 'resumes' and owner = auth.uid());

create policy resumes_update_own
  on storage.objects for update
  using (bucket_id = 'resumes' and owner = auth.uid());

create policy resumes_delete_own
  on storage.objects for delete
  using (bucket_id = 'resumes' and owner = auth.uid());
