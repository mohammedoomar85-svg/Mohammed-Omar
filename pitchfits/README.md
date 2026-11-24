# PitchFits.com — متجر جيرسيات كرة القدم (Dropshipping — USA)

موقع ثابت (HTML/CSS/JS) جاهز للنشر على أي استضافة (Cloudflare / Netlify / Vercel).

## الصفحات
- `index.html` الرئيسية · `collection.html?c=retro` الأقسام · `product.html?id=p01` صفحة المنتج · `info.html` الشحن والإرجاع والأسئلة

## تعديل المنتجات والأسعار والخصومات
كل شي في ملف واحد: `assets/products.js`
- `STORE` → حد الشحن المجاني، رسوم الشحن، عرض Buy 2 Get 1، سعر الاسم والرقم، أكواد الخصم، نص الشريط العلوي
- `PRODUCTS` → المنتجات (السعر `price`، السعر القديم `compareAt`، الصورة `image`، الأقسام `collections`)
- المنتجات الحالية **نماذج** وتُستبدل بمنتجاتك.

## الدفع
زر Checkout يحتاج ربط (Shopify أو Stripe) — حط الرابط في `STORE.checkoutUrl`.
