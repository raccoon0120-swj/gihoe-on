-- Run once in the Supabase SQL editor.
create table public.user_data (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_data enable row level security;
create policy "Users read their own data" on public.user_data for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users create their own data" on public.user_data for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update their own data" on public.user_data for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
