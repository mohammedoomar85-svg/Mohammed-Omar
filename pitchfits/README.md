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
