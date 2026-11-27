-- Bundles: the customer pays one price and picks a number of digital games.
-- Run after 001_store.sql. Safe to run again.

create table if not exists public.fzk_bundles (
  id            text primary key check (id ~ '^[a-z0-9-]{2,40}$'),
  name_ar       text not null,
  pick          int  not null check (pick between 2 and 50),  -- how many games the customer chooses
  price_kwd     numeric(7,3) not null check (price_kwd >= 0),
  old_price_kwd numeric(7,3) check (old_price_kwd is null or old_price_kwd > price_kwd),
  active        boolean not null default true,
  sort          int not null default 100
);
alter table public.fzk_bundles enable row level security;
drop policy if exists "anyone reads active bundles" on public.fzk_bundles;
create policy "anyone reads active bundles" on public.fzk_bundles
  for select to anon, authenticated using (active);
drop policy if exists "admins all bundles" on public.fzk_bundles;
create policy "admins all bundles" on public.fzk_bundles
  for all to authenticated using (public.fzk_is_admin()) with check (public.fzk_is_admin());

-- Which bundle a game in an order came from (null = bought on its own).
alter table public.fzk_order_items add column if not exists bundle_id text references public.fzk_bundles (id);

-- Place an order. Items are either {id, qty} for a single product,
-- or {bundle, games:[ids]} for a bundle (exactly `pick` different digital games).
-- A bundle's price is spread over its games so each game gets its own line and its own code.
create or replace function public.fzk_place_order(p jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  v_item jsonb;
  v_prod public.fzk_products;
  v_bund public.fzk_bundles;
  v_qty int;
  v_sub numeric(8,3) := 0;
  v_phys boolean := false;
  v_del numeric(8,3) := 0;
  v_order public.fzk_orders;
  v_ids text[] := '{}';
  v_game text;
  v_n int;
  v_share numeric(7,3);
  v_lines jsonb := '[]'::jsonb;   -- {id, name, kind, qty, price, bundle}
  v_line jsonb;
begin
  if jsonb_typeof(p->'items') <> 'array' or jsonb_array_length(p->'items') = 0 then
    raise exception 'empty cart';
  end if;
  if jsonb_array_length(p->'items') > 30 then raise exception 'too many items'; end if;

  for v_item in select * from jsonb_array_elements(p->'items') loop
    if v_item ? 'bundle' then
      select * into v_bund from public.fzk_bundles where id = v_item->>'bundle' and active;
      if not found then raise exception 'bundle not available'; end if;
      if jsonb_typeof(v_item->'games') <> 'array' or jsonb_array_length(v_item->'games') <> v_bund.pick then
        raise exception 'pick % games', v_bund.pick;
      end if;
      v_share := round(v_bund.price_kwd / v_bund.pick, 3);
      v_n := 0;
      for v_game in select jsonb_array_elements_text(v_item->'games') loop
        v_n := v_n + 1;
        select * into v_prod from public.fzk_products where id = v_game and active and kind = 'digital';
        if not found then raise exception 'product not available: %', v_game; end if;
        if v_prod.id = any(v_ids) then raise exception 'duplicate item'; end if;
        v_ids := v_ids || v_prod.id;
        v_lines := v_lines || jsonb_build_object('id', v_prod.id, 'name', v_prod.name_ar, 'kind', 'digital', 'qty', 1,
          -- the last game takes the rounding difference so the bundle adds up exactly
          'price', case when v_n = v_bund.pick then v_bund.price_kwd - v_share * (v_bund.pick - 1) else v_share end,
          'bundle', v_bund.id);
      end loop;
      v_sub := v_sub + v_bund.price_kwd;
    else
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
      v_lines := v_lines || jsonb_build_object('id', v_prod.id, 'name', v_prod.name_ar, 'kind', v_prod.kind,
        'qty', v_qty, 'price', v_prod.price_kwd, 'bundle', null);
      v_sub := v_sub + v_prod.price_kwd * v_qty;
    end if;
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

  for v_line in select * from jsonb_array_elements(v_lines) loop
    insert into public.fzk_order_items (order_id, product_id, name_ar, kind, qty, unit_price, bundle_id)
    values (v_order.id, v_line->>'id', v_line->>'name', v_line->>'kind', (v_line->>'qty')::int,
            (v_line->>'price')::numeric, v_line->>'bundle');
    if v_line->>'kind' = 'physical' then
      update public.fzk_products set stock = stock - (v_line->>'qty')::int
       where id = v_line->>'id' and stock is not null;
    end if;
  end loop;

  return jsonb_build_object('number', v_order.number, 'token', v_order.token,
    'subtotal', v_order.subtotal, 'delivery', v_order.delivery, 'total', v_order.total);
end;
$$;
revoke all on function public.fzk_place_order(jsonb) from public;
grant execute on function public.fzk_place_order(jsonb) to anon, authenticated;

-- Order page: include which bundle each game came from.
create or replace function public.fzk_order_status(p_token uuid)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'number', o.number, 'status', o.status, 'created_at', o.created_at, 'pay_method', o.pay_method,
    'name', o.name, 'has_physical', o.has_physical,
    'subtotal', o.subtotal, 'delivery', o.delivery, 'total', o.total,
    'items', (select coalesce(jsonb_agg(jsonb_build_object('id', i.product_id, 'name', i.name_ar,
               'kind', i.kind, 'qty', i.qty, 'price', i.unit_price, 'bundle', b.name_ar)), '[]'::jsonb)
              from public.fzk_order_items i left join public.fzk_bundles b on b.id = i.bundle_id
              where i.order_id = o.id),
    'codes', (select coalesce(jsonb_agg(jsonb_build_object('code', c.code, 'product', c.product_id)
               order by c.created_at), '[]'::jsonb)
              from public.fzk_codes c where c.order_id = o.id and not c.revoked))
  from public.fzk_orders o where o.token = p_token;
$$;
revoke all on function public.fzk_order_status(uuid) from public;
grant execute on function public.fzk_order_status(uuid) to anon, authenticated;

-- Starting bundles. Change prices and how many games from /admin/ → المنتجات.
insert into public.fzk_bundles (id, name_ar, pick, price_kwd, old_price_kwd, active, sort) values
  ('b3',  'باقة 3 ألعاب',  3,  6.000,  7.500, true, 1),
  ('b5',  'باقة 5 ألعاب',  5,  9.000, 12.500, true, 2),
  ('all', 'كل الألعاب',   10, 15.000, 25.000, true, 3)
on conflict (id) do nothing;
