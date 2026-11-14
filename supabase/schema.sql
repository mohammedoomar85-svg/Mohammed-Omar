-- Fizz & Play database
-- Run this whole file once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to run again: it only creates what is missing.

-- 1) Pre-launch sign-ups from the landing page ------------------------------
create table if not exists public.signups (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  parent_name text not null check (char_length(parent_name) between 2 and 80),
  phone       text not null check (phone ~ '^[569][0-9]{7}$'),
  age_group   text not null check (age_group in ('3-5', '6-8', 'more')),
  app_lang    text not null default 'ar' check (app_lang in ('ar', 'en')),
  page_lang   text check (page_lang in ('ar', 'en'))
);
alter table public.signups enable row level security;
-- Visitors may add a sign-up, but nobody can read the list through the public key.
drop policy if exists "anyone can sign up" on public.signups;
create policy "anyone can sign up" on public.signups
  for insert to anon, authenticated with check (true);

-- 2) Box codes printed on the card inside each box ---------------------------
create table if not exists public.box_codes (
  code       text primary key,
  box        int  not null default 1,
  created_at timestamptz not null default now(),
  used_by    uuid references auth.users (id) on delete set null,
  used_at    timestamptz,
  multi_use  boolean not null default false  -- true only for demo/test codes
);
alter table public.box_codes add column if not exists multi_use boolean not null default false;
alter table public.box_codes enable row level security;
-- No policies: the app can't read or list codes. It can only redeem one through the function below.

-- 3) Each child's progress (one row per app install / account) ---------------
create table if not exists public.profiles (
  user_id      uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  child_name   text,
  age          text check (age in ('small', 'big')),
  lang         text check (lang in ('ar', 'en')),
  box_unlocked boolean not null default false,
  stamps       text[]  not null default '{}',
  stats        jsonb   not null default '{}'::jsonb,
  sound        boolean not null default true,
  updated_at   timestamptz not null default now()
);
alter table public.profiles enable row level security;
drop policy if exists "read own profile" on public.profiles;
create policy "read own profile" on public.profiles
  for select to authenticated using (user_id = auth.uid());
drop policy if exists "add own profile" on public.profiles;
create policy "add own profile" on public.profiles
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- 4) Redeem a box code. Returns the box number, or raises an error -----------
create or replace function public.redeem_box_code(p_code text)
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  v_row  public.box_codes;
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  select * into v_row from public.box_codes where code = v_code for update;
  if not found then
    raise exception 'invalid code';
  end if;
  if not v_row.multi_use then
    if v_row.used_by is not null and v_row.used_by <> auth.uid() then
      raise exception 'code already used';
    end if;
    update public.box_codes set used_by = auth.uid(), used_at = coalesce(used_at, now()) where code = v_code;
  end if;
  insert into public.profiles (user_id, box_unlocked) values (auth.uid(), true)
    on conflict (user_id) do update set box_unlocked = true, updated_at = now();
  return v_row.box;
end;
$$;
revoke all on function public.redeem_box_code(text) from public, anon;
grant execute on function public.redeem_box_code(text) to authenticated;

-- 5) Make codes for a batch of boxes (run by you in the SQL Editor) ----------
-- Example: select * from public.make_box_codes(1, 50);  → 50 codes for box 1, like FZ1-7K3M9Q
-- Six characters without look-alikes (no 0/O, 1/I/L), so codes are hard to guess and easy to type.
create or replace function public.make_box_codes(p_box int, p_count int)
returns setof text
language plpgsql
as $$
declare
  v_chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
  v_made int := 0;
begin
  while v_made < p_count loop
    v_code := 'FZ' || p_box || '-';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
    end loop;
    begin
      insert into public.box_codes (code, box) values (v_code, p_box);
      v_made := v_made + 1;
      return next v_code;
    exception when unique_violation then
      -- Try another number.
    end;
  end loop;
end;
$$;
revoke all on function public.make_box_codes(int, int) from public, anon, authenticated;

-- A demo code anyone can use to test the app. Delete it before launch:
-- delete from public.box_codes where code = 'FZ-2026';
insert into public.box_codes (code, box, multi_use) values ('FZ-2026', 1, true) on conflict do nothing;
