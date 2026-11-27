-- Fizz & Play for adults (فز و العب للكبار) store database: products, orders, digital game codes, admin access.
-- Run this whole file once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Safe to run again: it only creates what is missing and replaces the functions.
-- Every table starts with fzk_ so it can share a Supabase project with other sites.

create extension if not exists pgcrypto;

-- 1) Products ------------------------------------------------------------------
-- The price here is the real one: orders are priced from this table, never from the page.
create table if not exists public.fzk_products (
  id         text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  kind       text not null check (kind in ('digital', 'physical')),
  name_ar    text not null,
  price_kwd  numeric(7,3) not null check (price_kwd >= 0),
  old_price_kwd numeric(7,3) check (old_price_kwd is null or old_price_kwd > price_kwd),
  active     boolean not null default true,
  stock      int check (stock is null or stock >= 0),   -- null = not tracked (digital)
  sort       int not null default 100,
  updated_at timestamptz not null default now()
);
alter table public.fzk_products enable row level security;
drop policy if exists "anyone reads active products" on public.fzk_products;
create policy "anyone reads active products" on public.fzk_products
  for select to anon, authenticated using (active);

-- 2) Orders --------------------------------------------------------------------
create sequence if not exists public.fzk_order_no start 1001;
create table if not exists public.fzk_orders (
  id          bigint generated always as identity primary key,
  number      text not null unique default ('G-' || nextval('public.fzk_order_no')),
  token       uuid not null unique default gen_random_uuid(), -- secret part of the order link
  created_at  timestamptz not null default now(),
  name        text not null check (char_length(name) between 2 and 80),
  phone       text not null check (phone ~ '^[569][0-9]{7}$'),
  governorate text,
  area        text,
  address     text,   -- block, street, house
  notes       text check (notes is null or char_length(notes) <= 400),
  pay_method  text not null check (pay_method in ('knet', 'cash')),
  status      text not null default 'new' check (status in ('new', 'paid', 'shipped', 'done', 'cancelled')),
  has_physical boolean not null default false,
  subtotal    numeric(8,3) not null,
  delivery    numeric(8,3) not null default 0,
  total       numeric(8,3) not null,
  paid_at     timestamptz,
  admin_notes text
);
alter table public.fzk_orders enable row level security;

create table if not exists public.fzk_order_items (
  order_id   bigint not null references public.fzk_orders (id) on delete cascade,
  product_id text   not null references public.fzk_products (id),
  name_ar    text   not null,
  kind       text   not null,
  qty        int    not null check (qty between 1 and 20),
  unit_price numeric(7,3) not null,
  primary key (order_id, product_id)
);
alter table public.fzk_order_items enable row level security;

-- 3) Game codes: one per digital game bought, made when the order is marked paid --
create table if not exists public.fzk_codes (
  code          text primary key,
  product_id    text not null references public.fzk_products (id),
  order_id      bigint references public.fzk_orders (id) on delete set null,
  created_at    timestamptz not null default now(),
  first_used_at timestamptz,
  last_used_at  timestamptz,
  uses          int not null default 0,
  max_devices   int not null default 3,
  devices       text[] not null default '{}',
  revoked       boolean not null default false
);
alter table public.fzk_codes enable row level security;
-- No public policies on orders, items or codes: visitors reach them only through the functions below.

-- 4) Admins ----------------------------------------------------------------------
create table if not exists public.fzk_admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.fzk_admins enable row level security;
drop policy if exists "admins see themselves" on public.fzk_admins;
create policy "admins see themselves" on public.fzk_admins
  for select to authenticated using (user_id = auth.uid());

create or replace function public.fzk_is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.fzk_admins where user_id = auth.uid());
$$;
revoke all on function public.fzk_is_admin() from public, anon;
grant execute on function public.fzk_is_admin() to authenticated;

drop policy if exists "admins all products" on public.fzk_products;
create policy "admins all products" on public.fzk_products
  for all to authenticated using (public.fzk_is_admin()) with check (public.fzk_is_admin());
drop policy if exists "admins read orders" on public.fzk_orders;
create policy "admins read orders" on public.fzk_orders
  for select to authenticated using (public.fzk_is_admin());
drop policy if exists "admins update orders" on public.fzk_orders;
create policy "admins update orders" on public.fzk_orders
  for update to authenticated using (public.fzk_is_admin()) with check (public.fzk_is_admin());
drop policy if exists "admins read items" on public.fzk_order_items;
create policy "admins read items" on public.fzk_order_items
  for select to authenticated using (public.fzk_is_admin());
drop policy if exists "admins read codes" on public.fzk_codes;
create policy "admins read codes" on public.fzk_codes
  for select to authenticated using (public.fzk_is_admin());
drop policy if exists "admins update codes" on public.fzk_codes;
create policy "admins update codes" on public.fzk_codes
  for update to authenticated using (public.fzk_is_admin()) with check (public.fzk_is_admin());

-- 5) Code maker: FK-XXXX-XXXX without look-alike characters (no 0/O, 1/I/L) ---------
create or replace function public.fzk_new_code()
returns text language plpgsql set search_path = public as $$
declare
  v_chars text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_code text;
begin
  loop
    v_code := 'FK-';
    for i in 1..8 loop
      if i = 5 then v_code := v_code || '-'; end if;
      v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.fzk_codes where code = v_code);
  end loop;
  return v_code;
end;
$$;
revoke all on function public.fzk_new_code() from public, anon, authenticated;

-- 6) Place an order (called by the store page) ---------------------------------------
-- p: {name, phone, governorate, area, address, notes, pay_method, items:[{id, qty}]}
-- Delivery: 2 KD for orders with physical games, free from 20 KD. Digital-only orders: no delivery.
create or replace function public.fzk_place_order(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_item jsonb;
  v_prod public.fzk_products;
  v_qty int;
  v_sub numeric(8,3) := 0;
  v_phys boolean := false;
  v_del numeric(8,3) := 0;
  v_order public.fzk_orders;
  v_ids text[] := '{}';
begin
  if jsonb_typeof(p->'items') <> 'array' or jsonb_array_length(p->'items') = 0 then
    raise exception 'empty cart';
  end if;
  if jsonb_array_length(p->'items') > 30 then raise exception 'too many items'; end if;

  for v_item in select * from jsonb_array_elements(p->'items') loop
    select * into v_prod from public.fzk_products where id = v_item->>'id' and active;
    if not found then raise exception 'product not available: %', v_item->>'id'; end if;
    if v_prod.id = any(v_ids) then raise exception 'duplicate item'; end if;
    v_ids := v_ids || v_prod.id;
    v_qty := greatest(1, least(20, coalesce((v_item->>'qty')::int, 1)));
    if v_prod.kind = 'physical' then
      v_phys := true;
      if v_prod.stock is not null and v_prod.stock < v_qty then
        raise exception 'out of stock: %', v_prod.name_ar;
      end if;
    end if;
    v_sub := v_sub + v_prod.price_kwd * v_qty;
  end loop;

  if v_phys then
    if coalesce(trim(p->>'area'), '') = '' or coalesce(trim(p->>'address'), '') = '' then
      raise exception 'address required';
    end if;
    v_del := case when v_sub >= 20 then 0 else 2 end;
  elsif p->>'pay_method' = 'cash' then
    raise exception 'cash only for delivered orders';
  end if;

  insert into public.fzk_orders (name, phone, governorate, area, address, notes, pay_method,
                                   has_physical, subtotal, delivery, total)
  values (trim(p->>'name'), regexp_replace(coalesce(p->>'phone', ''), '\D', '', 'g'),
          nullif(trim(p->>'governorate'), ''), nullif(trim(p->>'area'), ''),
          nullif(trim(p->>'address'), ''), nullif(trim(p->>'notes'), ''), p->>'pay_method',
          v_phys, v_sub, v_del, v_sub + v_del)
  returning * into v_order;

  for v_item in select * from jsonb_array_elements(p->'items') loop
    select * into v_prod from public.fzk_products where id = v_item->>'id';
    v_qty := greatest(1, least(20, coalesce((v_item->>'qty')::int, 1)));
    insert into public.fzk_order_items (order_id, product_id, name_ar, kind, qty, unit_price)
    values (v_order.id, v_prod.id, v_prod.name_ar, v_prod.kind, v_qty, v_prod.price_kwd);
    if v_prod.kind = 'physical' and v_prod.stock is not null then
      update public.fzk_products set stock = stock - v_qty where id = v_prod.id;
    end if;
  end loop;

  return jsonb_build_object('number', v_order.number, 'token', v_order.token,
    'subtotal', v_order.subtotal, 'delivery', v_order.delivery, 'total', v_order.total);
end;
$$;
revoke all on function public.fzk_place_order(jsonb) from public;
grant execute on function public.fzk_place_order(jsonb) to anon, authenticated;

-- 7) When an order becomes paid, make one code per digital game bought -----------------
create or replace function public.fzk_on_paid()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  v_it public.fzk_order_items;
begin
  if new.status in ('paid', 'shipped', 'done') and old.status in ('new', 'cancelled') then
    new.paid_at := coalesce(new.paid_at, now());
    if exists (select 1 from public.fzk_codes where order_id = new.id) then
      -- Re-opened after a cancel: switch the same codes back on.
      update public.fzk_codes set revoked = false where order_id = new.id;
    else
      for v_it in select * from public.fzk_order_items where order_id = new.id and kind = 'digital' loop
        for i in 1..v_it.qty loop
          insert into public.fzk_codes (code, product_id, order_id)
          values (public.fzk_new_code(), v_it.product_id, new.id);
        end loop;
      end loop;
    end if;
  end if;
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    update public.fzk_codes set revoked = true where order_id = new.id;
  end if;
  return new;
end;
$$;
drop trigger if exists fzk_orders_paid on public.fzk_orders;
create trigger fzk_orders_paid before update of status on public.fzk_orders
  for each row execute function public.fzk_on_paid();

-- 8) Order page: the customer opens their link and sees status, items and codes ---------
create or replace function public.fzk_order_status(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'number', o.number, 'status', o.status, 'created_at', o.created_at, 'pay_method', o.pay_method,
    'name', o.name, 'has_physical', o.has_physical,
    'subtotal', o.subtotal, 'delivery', o.delivery, 'total', o.total,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('id', i.product_id, 'name', i.name_ar,
               'kind', i.kind, 'qty', i.qty, 'price', i.unit_price)), '[]'::jsonb)
              from public.fzk_order_items i where i.order_id = o.id),
    'codes', (select coalesce(jsonb_agg(jsonb_build_object('code', c.code, 'product', c.product_id)
               order by c.created_at), '[]'::jsonb)
              from public.fzk_codes c where c.order_id = o.id and not c.revoked))
  from public.fzk_orders o where o.token = p_token;
$$;
revoke all on function public.fzk_order_status(uuid) from public;
grant execute on function public.fzk_order_status(uuid) to anon, authenticated;

-- 9) Open a game with a code. A code works on up to max_devices devices ----------------
-- p_device is a random id the game page keeps in the browser.
create or replace function public.fzk_redeem(p_code text, p_product text, p_device text)
returns boolean language plpgsql security definer set search_path = public as $$
declare
  v_code text := upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g'));
  v_row public.fzk_codes;
begin
  if char_length(coalesce(p_device, '')) not between 8 and 64 then raise exception 'bad device'; end if;
  select * into v_row from public.fzk_codes where code = v_code for update;
  if not found or v_row.revoked then raise exception 'invalid code'; end if;
  if v_row.product_id <> p_product then raise exception 'code is for another game'; end if;
  if not (p_device = any(v_row.devices)) then
    if array_length(v_row.devices, 1) >= v_row.max_devices then raise exception 'too many devices'; end if;
    update public.fzk_codes set devices = devices || p_device where code = v_code;
  end if;
  update public.fzk_codes set uses = uses + 1, last_used_at = now(),
         first_used_at = coalesce(first_used_at, now()) where code = v_code;
  return true;
end;
$$;
revoke all on function public.fzk_redeem(text, text, text) from public;
grant execute on function public.fzk_redeem(text, text, text) to anon, authenticated;

-- 10) Starting products. Change prices any time in Table Editor → fzk_products. -------
-- The physical games are in 002_physical.sql.
insert into public.fzk_products (id, kind, name_ar, price_kwd, old_price_kwd, active, stock, sort) values
  ('diwaniya', 'digital', 'اضمن',          2.500, 3.500, true, null, 1),
  ('sullam',   'digital', 'سؤال المليون',   2.500, 3.500, true, null, 2),
  ('huroof',   'digital', 'حروف الديرة',    2.500, 3.500, true, null, 3),
  ('theeb',    'digital', 'مافيا',          2.500, 3.500, true, null, 4),
  ('tamtheel', 'digital', 'مثّلها وقولها',  2.500, 3.500, true, null, 5)
on conflict (id) do update set name_ar = excluded.name_ar;  -- names follow this file; prices you set stay

-- A test code for the Diwaniya game that works on 50 devices. Delete it before launch:
-- delete from public.fzk_codes where code = 'FK-TEST-2026';
insert into public.fzk_codes (code, product_id, max_devices) values ('FK-TEST-2026', 'diwaniya', 50)
  on conflict do nothing;

-- Last step: make your account an admin. Create a user in Authentication → Users
-- (email + password), then run this line on its own with that email:
-- insert into public.fzk_admins (user_id) select id from auth.users where email = 'YOUR-EMAIL@example.com' on conflict do nothing;
