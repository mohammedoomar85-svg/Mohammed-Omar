-- Second batch of digital games. Safe to run again.
insert into public.fzk_products (id, kind, name_ar, price_kwd, old_price_kwd, active, stock, sort) values
  ('sibaq',   'digital', 'سباق الساعة',     2.500, 3.500, true, null, 6),
  ('ashara',  'digital', 'العشرة الكبار',   2.500, 3.500, true, null, 7),
  ('laeb',    'digital', 'مين اللاعب؟',     2.500, 3.500, true, null, 8),
  ('rattib',  'digital', 'رتّبها صح',       2.500, 3.500, true, null, 9),
  ('maaroof', 'digital', 'لا تقول المعروف', 2.500, 3.500, true, null, 10)
on conflict (id) do update set name_ar = excluded.name_ar;
