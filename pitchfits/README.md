# PitchFits.com — متجر جيرسيات كرة القدم (Dropshipping — USA)

موقع ثابت (HTML/CSS/JS) جاهز للنشر على أي استضافة (Cloudflare / Netlify / Vercel).

## الصفحات
- `index.html` الرئيسية · `collection.html?c=retro` الأقسام · `product.html?id=p01` صفحة المنتج · `info.html` الشحن والإرجاع والأسئلة

## تعديل المنتجات والأسعار والخصومات
كل شي في ملف واحد: `assets/products.js`
- `STORE` → حد الشحن المجاني، رسوم الشحن، عرض Buy 2 Get 1، سعر الاسم والرقم، أكواد الخصم، نص الشريط العلوي
- `PRODUCTS` → المنتجات (السعر `price`، السعر القديم `compareAt`، الصور `images` في مجلد `assets/img/products/`، اسم ورقم اللاعب `print`، القسم `collections`)
- الأقسام: `clubs` أندية الموسم الحالي · `national` منتخبات · `classic-clubs` أندية مواسم سابقة · `classic-national` منتخبات سابقة
- التقييمات والمراجعات: حط بس الحقيقية (`REVIEWS`)، القسم يختفي إذا كانت فاضية.

## الدفع
زر Checkout يحتاج ربط (Shopify أو Stripe) — حط الرابط في `STORE.checkoutUrl`.

## العروض الحالية
- **Black Friday:** كل الجيرسيات بـ 45$ بدل 65$. لإنهاء العرض غيّر في `assets/products.js`:
  `blackFriday: { price: 45 },` ← `blackFriday: null,`
  وترجع الأسعار 65$ ويرجع كود الترحيب يشتغل تلقائياً.
- **WELCOME10:** خصم 10% على القطع بسعرها الكامل (65$) فقط، وما يشتغل مع أسعار Black Friday.
- **Buy 2 Get 1:** موقوف (`buyXGetY: null`).
- **التوصيل:** 5–7 أيام عمل لكل أمريكا (`deliveryDays`).
- **طرق الدفع المعروضة:** `paymentMethods`. تشتغل فعلياً بعد ربط Shopify Payments / PayPal.

## النشر على Cloudflare
الموقع منشور على: https://pitchfits.mohammedoomar85.workers.dev
لنشر أي تعديل (من مجلد pitchfits):
`CLOUDFLARE_API_TOKEN=... CLOUDFLARE_ACCOUNT_ID=ae018db2123239b93e001c02d2e15cb6 bash _deploy/deploy.sh`
الملفات تنحفظ في KV (`pitchfits-site`) و `_deploy/worker.js` يعرضها.
