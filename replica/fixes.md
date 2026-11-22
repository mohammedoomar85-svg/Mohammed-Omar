# Fixes and angle: what OptimizeApp's users hate, and what we do instead

Sample: **110 App Store reviews**, 7 storefronts (SA 55, US 23, KW 16, AE 6,
OM 5, QA 4, BH 1), 2019-10 → 2026-10, read from Apple's public reviews feed.
Ratings: 51 × 5★, 3 × 4★, 3 × 3★, 8 × 2★, 45 × 1★ — the app splits people
into "love it" and "hate it", almost nothing in between.
Only one platform type (App Store). Google Play (~275 reviews) was not
reachable from this session; add it before final decisions.
Full ranked output with every quote and link: `feedback.md`. Raw rows:
`reviews.csv`. Theme rules: `themes-ads.json`.

## The single most important finding

**What people love is a person, not the product.** 15 of the 54 four- and
five-star reviews thank a named staff member (one account manager alone is
named in most of them). The 1★ reviews are almost all about the *product
and the money*: sign-up, crashes, waiting, rejections, refunds.
So: OptimizeApp works as a **managed service** for customers who get a good
account manager, and fails as a **self-serve app** for everyone else.

Caveat: one 2★ review ([KW, 2026](https://itunes.apple.com/kw/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-14161364775))
says "اغلب الكومنتات fake", and a 3★ (SA, 2023) says many positive reviewers
admit they have not tried it yet. Treat the
5★ share with care.

## 1. What they hate

| # | problem | reviews | sources | quote |
| --- | --- | --- | --- | --- |
| 1 | Paid, but no results / numbers in the app don't match real sales | 12 | 5 | "أكثر من ٦ ألاف من دون فائدة تذكر" ([SA 1★](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-10425578858)); "عدد المبيعات من الحملة الاعلانية في التطبيق مختلف عن عدد المبيعات الفعلي" ([SA 4★](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-11772784934)) |
| 2 | Sign-up and OTP fail; Apple sign-in still demands fields | 11 | 4 | "لا يمكن توثيق الحساب بسبب عدم استقبال OTP" ([SA 2022](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-9365464628)); "اما الجوال مسجل مسبقاً او بريد مسجل او اسم  المتجر مستخدم سابقاً" ([SA 2★](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-11371340745)) |
| 3 | Crashes, freezes, video upload errors | 11 | 3 | "التطبيق يعلق على الشاشة الزرقاء ولايعمل" ([US 1★](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-10111558043)); "I can’t upload videos and I get a lot of error with codes that I don’t understand" ([US 2★](https://itunes.apple.com/us/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-9125188160)) |
| 4 | Waiting: account under review for days, ads stuck in review | 10 | 3 | "اكثر من عشر ايام تحت المراجعه" ([SA 1★](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-11259160978)); "your account goes under review for ever" ([QA 1★](https://itunes.apple.com/qa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-8535503287)) |
| 5 | Support: copy-paste answers, nobody on weekends | 10 | 3 | "they keep repeating ur questions and copy pasting their answers" ([AE 1★](https://itunes.apple.com/ae/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-10042460475)) |
| 6 | Money held: prepaid wallet, refunds refused | 8 | 3 | "يدخلها المحفظة الخاصة بالتطبيق وبعدها ٩٩٪ من إعلاناتك يرفضها التطبيق دون توضيح السبب واذا طلبت استرجاع المبلغ فلن يرجع لك هللة" ([SA 1★, 2026](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-14157309308)) |
| 7 | Too expensive: price above the platform, $25/day minimum | 8 | 3 | "سعر الاعلان فيه اعلى من المنصة نفسها" ([SA 1★, 2025](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-13569107725)); "اقل مبلغ للاعلان ما يقارب ٨٠ ريال عماني" ([OM 1★](https://itunes.apple.com/om/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-9716603930)); "ناسين اصحاب المشاريع البسيطة" ([OM 1★](https://itunes.apple.com/om/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-11872674057)) |
| 8 | Ads/accounts rejected with no reason ("low quality", no alternative) | 8 | 4 | "يطلعلي ان حسابي جودة الفديوات ضعيفه" … "ومافي بديل" ([QA 1★](https://itunes.apple.com/qa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-10146589636)); "رفض بعض الاعلانات بعد الدفع" … "لا احد يقوم بمساعدتك و توضيح سبب الرفض" ([SA 1★](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-9450012685)) |
| 9 | Arabic chosen, app stays English — **thin** (1 review) | 1 | 1 | "اختار عربي وستل يحط لي انقلش" ([SA 3★](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-9405456233)) |

## 2. What is missing (asked for by name)

| # | request | reviews | note |
| --- | --- | --- | --- |
| 1 | Lower daily minimum, same as Snapchat's own (~$5) | 3 | "تغيير الحد الادنى للميزانية ويكون غير محدود ب ٢٥ $ يصبح نفس موقع سناب شات" ([SA 5★](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-11941193453)) |
| 2 | Faster ad processing | 2 | "تسريع معالجة الاعلان" (same review) |
| 3 | Reports that match real store sales | 2 | see hate #1 |
| 4 | More campaign options and more AI | 1 — thin | "أتمنى فقط تطوير خيارات الحملات وإضافة مزايا أكثر بالـ AI" ([SA 5★, 2026](https://itunes.apple.com/sa/rss/customerreviews/page=1/id=1462878125/sortBy=mostRecent/json#review-14618485218)) |
| 5 | Facebook ads | 1 — thin | "اين اعلانات الفايسبوك" (US 3★) |
| 6 | Influencer campaigns | 1 — thin | "تطبيق خاص لاستقطاب المؤثرين" (SA 2★) |

## 3. What is unsolved (positioning)

1. **Small projects with small budgets.** Minimums of $25/day, ~80 OMR, $75–175
   per campaign and "fees above the platform" shut out home businesses and
   new stores — "ناسين اصحاب المشاريع البسيطة". (8 price reviews + 3 requests.)
2. **Self-serve users with no account manager.** The happy customers have a
   person; everyone else gets OTP errors, rejections and copy-paste support.
3. **Trust about money.** Prepaid wallet + rejections + no refund = "نصب"
   (scam) appears in 6 reviews. Nobody shows the user where each riyal went.

## 4. Fix plan

| # | fix | size | skill | evidence |
| --- | --- | --- | --- | --- |
| F1 | **No wallet. Money goes straight to the platform** on the user's own card/ad account; we charge a flat, visible subscription. Unspent budget never touches us, so refunds are not an issue. | M | replica-architect, replica-backend | hate #6, #7; unsolved 3 |
| F2 | **Minimum = the platform's own minimum** (e.g. Snap's), with a "small budget" mode and honest advice for it | S | replica-build | hate #7, request #1 |
| F3 | **Pre-check before submit** (AI): policy words, video quality/specs, landing page, then a plain-Arabic reason + one-tap fix if the platform still rejects | M | replica-build | hate #8, #4 |
| F4 | **Review tracker** with push notifications and expected time, so nobody waits blind | S | replica-build | hate #4 |
| F5 | **Sign in with Apple / Google / phone, and nothing else asked up front**; WhatsApp OTP fallback; store name not required to be unique | S | replica-backend | hate #2 |
| F6 | **Sales reconciliation**: pull real orders from Zid / Salla / Shopify and show them next to platform-reported conversions | L | replica-backend | hate #1, request #3 |
| F7 | **"Spend receipt"** per campaign: what you paid, what the platform spent, our fee, every day | S | replica-build | hate #1, #6 |
| F8 | **Support that answers**: in-app chat with real humans in working hours + an AI assistant on weekends that can read the campaign and the rejection reason | M | replica-backend | hate #5 |
| F9 | Reliable video upload: resumable, compress on device, clear error in Arabic | M | replica-build | hate #3 |
| F10 | Full Arabic RTL, follows the phone language | S | replica-design | hate #9 (thin) |

Pricing complaints also go to `/replica-launch`: a flat monthly price and no
percentage fee is itself the answer to "سعر الاعلان فيه اعلى من المنصة".

## 5. The angle

**A.** For small Gulf businesses who are shut out by $25/day minimums and
hidden fees, *[your app]* launches Snap, TikTok and Instagram ads from the
platform's own minimum, for one flat monthly price.
Evidence: price 8 reviews / 3 storefronts + 3 requests.

**B.** For store owners who paid for ads and can't tell if they sold anything,
*[your app]* shows every riyal spent next to the real orders from your store.
Evidence: no-results 12 reviews / 5 storefronts + money-held 8.

**C.** For first-time advertisers who got rejected and left waiting,
*[your app]* checks your ad before you pay, tells you in Arabic exactly why a
platform said no, and fixes it in one tap.
Evidence: rejected 8 + waiting 10 + support 10.

**Recommended: A, with B as the proof.** "Your money goes straight to Snap,
not to us; you start from the platform's minimum; and you see your real sales."
It answers the three biggest emotions in the 1★ reviews (expensive, scam,
no results) at once, and it is the cheapest to build (F1, F2, F7 are S/M).

Do not use OptimizeApp's name in your app name, ads or store listing.
These reviews are research, not testimonials.

Next: `/replica-brand`.
