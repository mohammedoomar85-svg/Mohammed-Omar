# إعداد Supabase لفز و العب

## ١. إنشاء الجداول
1. افتح مشروعك في Supabase.
2. من القائمة اختار **SQL Editor** ← **New query**.
3. انسخ محتوى ملف `schema.sql` كامل والصقه، واضغط **Run**.

هذا يسوي:
- `signups`: حجوزات صفحة الهبوط. الزوار يقدرون يضيفون حجز، بس ما أحد يقدر يقرأ القائمة بالمفتاح العام.
- `box_codes`: أكواد الصناديق. التطبيق ما يقدر يشوف الأكواد، يقدر بس يستخدم كود.
- `profiles`: تقدّم كل طفل. كل جهاز يشوف بياناته هو بس.
- كود تجريبي `FZ-2026` تقدر تستخدمه أكثر من مرة. احذفه قبل الإطلاق.

## ٢. تفعيل الدخول التلقائي
**Authentication** ← **Sign In / Providers** ← فعّل **Anonymous sign-ins**.
كذا كل جهاز ياخذ حساب تلقائي بدون إيميل ولا كلمة سر.

## ٣. المفاتيح
من **Project Settings** ← **API** (أو زر **Connect**) خذ:
- **Project URL**
- **anon / publishable key**: هذا عام، وعادي يكون داخل التطبيق والصفحة.

⚠️ لا ترسل ولا تحط **service_role / secret key** في أي مكان. هذا مفتاح يتحكم بكل شي.

حط المفاتيح في:
- التطبيق: انسخ `app/.env.example` إلى `app/.env.local` وعبّيه.
- صفحة الهبوط: في أعلى السكربت داخل `landing/index.html` (`SUPABASE_URL` و `SUPABASE_ANON_KEY`).

## ٤. أكواد الصناديق
لما تجهز دفعة صناديق، شغّل في SQL Editor:
```sql
select * from public.make_box_codes(1, 50);
```
يطلع لك ٥٠ كود مثل `FZ1-7K3M9Q`. اطبع كل كود على كرت وحطه في صندوق.

## ٥. قراءة الحجوزات
من **Table Editor** ← `signups`، أو في SQL Editor:
```sql
select created_at, parent_name, phone, age_group, app_lang from public.signups order by created_at desc;
```
