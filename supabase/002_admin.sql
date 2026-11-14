-- Fizz & Play: admin dashboard access
-- Run once in Supabase → SQL Editor, after schema.sql. Safe to run again.

-- Who may open the dashboard. Only accounts listed here can read customer data.
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admins enable row level security;
drop policy if exists "admins see themselves" on public.admins;
create policy "admins see themselves" on public.admins
  for select to authenticated using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- Follow-up status and notes for each sign-up.
alter table public.signups add column if not exists status text not null default 'new';
alter table public.signups add column if not exists notes text;
alter table public.signups drop constraint if exists signups_status_check;
alter table public.signups add constraint signups_status_check
  check (status in ('new', 'contacted', 'paid', 'not_interested'));

-- Visitors can only add a fresh sign-up; they can't set a status or notes.
drop policy if exists "anyone can sign up" on public.signups;
create policy "anyone can sign up" on public.signups
  for insert to anon, authenticated with check (status = 'new' and notes is null);

-- Admins can read and update sign-ups, and read app progress and box codes.
drop policy if exists "admins read signups" on public.signups;
create policy "admins read signups" on public.signups
  for select to authenticated using (public.is_admin());
drop policy if exists "admins update signups" on public.signups;
create policy "admins update signups" on public.signups
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "admins read profiles" on public.profiles;
create policy "admins read profiles" on public.profiles
  for select to authenticated using (public.is_admin());
drop policy if exists "admins read codes" on public.box_codes;
create policy "admins read codes" on public.box_codes
  for select to authenticated using (public.is_admin());

-- Make box codes from the dashboard (admins only).
create or replace function public.admin_make_codes(p_box int, p_count int)
returns setof text
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  if p_count < 1 or p_count > 500 then
    raise exception 'count must be between 1 and 500';
  end if;
  return query select * from public.make_box_codes(p_box, p_count);
end;
$$;
revoke all on function public.admin_make_codes(int, int) from public, anon;
grant execute on function public.admin_make_codes(int, int) to authenticated;

-- Last step: make your account an admin. Put the email you created in
-- Authentication → Users, then run this line on its own:
-- insert into public.admins (user_id) select id from auth.users where email = 'YOUR-EMAIL@example.com' on conflict do nothing;
