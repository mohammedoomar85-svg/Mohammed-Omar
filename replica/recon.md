# Recon map: OptimizeApp (iOS + Android + web dashboard)

Scope (proposed, not yet confirmed): the core loop only. A business owner
connects their store and ad accounts, creates one ad (with an in-app editor),
launches it on Snapchat / TikTok / Instagram+Facebook, sets a daily budget and
duration, and watches results in one dashboard and a PDF report.
For: small businesses and online stores in the Gulf (Kuwait, Saudi, UAE),
Arabic + English. Product to sell (TBC with the user).
Date: 2026-11-22

> **Evidence.** The site and store pages could not be opened from this
> session. Sources are web-search summaries of the stores plus six
> screenshots of the marketing site the user sent (W01–W06, kept locally in
> `replica/screens/`, gitignored, never shipped). The screenshots are
> marketing mockups of the app, not the app itself: confirm on a real
> account before building pixel layouts.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | App Store (KW) | https://apps.apple.com/kw/app/optimizeapp/id1462878125 | given by user; free; Business category |
| 2 | App Store (US) | https://apps.apple.com/us/app/optimizeapp/id1462878125 | 2.5★ from 11 ratings (search summary) |
| 3 | App Store (SA) | https://apps.apple.com/sa/app/optimizeapp/id1462878125 | Meta pixel, TikTok link, edit end date/budget/name after launch; OTP complaint |
| 4 | App Store (AE) | https://apps.apple.com/ae/app/optimizeapp/id1462878125 | support complaint, cancelled demo |
| 5 | Google Play | https://play.google.com/store/apps/details?id=com.optimizeapp.optimizeapp | ~3.2★ / 275 reviews; dev reply: min $75 for 3 days, ≥$25/day; fee ≤15% |
| 6 | Features page | https://optimizeapp.com/en/features | create/launch/schedule, unified dashboard, AI visuals |
| 7 | Zid app store | https://apps.zid.sa/en-sa/apps/2812 | Snapchat pixel + CAPI, AI audience, 7-day trial |
| 8 | AppGrooves negatives | https://appgrooves.com/app/optimize-app-by-optimize-advertising-and-marketing-company-wll/negative | complaints aggregate |
| 9 | Site screenshots W01–W06 | optimizeapp.com/en (sent by user) | budget/duration UI, platform picker, ad formats, store connect, marketing hub, editor, reports |
| 10 | Your own account | — | **not done yet** |

## Core loop

Launch a paid social ad on Snap / TikTok / Meta / Google from a phone without
touching each ads manager, then see sales results in one report.
Revenue: service fee on ad spend (developer: "no more than 15%").

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Sign in | first launch | phone OTP login | phone input, OTP input | OTP not arriving (complaint) |
| S02 | Business setup | after first login | business name, category, country | form | empty, filled |
| S03 | Marketing hub | settings / onboarding | connect assets per platform. Meta: Instagram account, Facebook page, Meta Pixel (W04) | platform side list, asset rows with check marks | connected (W04), not connected |
| S04 | Store connect | onboarding / hub | connect Zid, Shopify, ordable store; explains Smart targeting + Customizable templates (W01) | accordion per store, primary "Connect" button | collapsed, expanded |
| S05 | Home / dashboard | tab (mobile + desktop) | all campaigns across platforms | KPI tiles, chart, campaign list | empty, filled |
| S06 | New campaign: platform + format | "+" | pick Snapchat / TikTok / Instagram / Google (horizontal tiles, scrolls), then an ad format card with goals "Sales / Traffic / App installs" and "Create Snap ad" (W02) | platform tile row, format card with phone mock, goal chips, promo banner ("up to 50% back in credit") | platform selected, "New" badge |
| S07 | Creative: template picker | inside create | choose a design template (W05) | template grid | — |
| S08 | Creative: editor | inside create | edit image or video: Transform, Adjust, Sticker, Text, Text design, undo/redo, Save (W05) | canvas, bottom tool bar | editing |
| S09 | Creative from product | store connected | build ad from a store product without uploading (W01) | product picker → template | — |
| S10 | Audience | inside create | location, age, gender, interests, or AI auto targeting | pickers, AI toggle | — |
| S11 | Budget & duration | inside create | daily budget with −/+ stepper and tip ("best campaigns spend ≥$200/day"); Instant campaign N days with computed date range and tip ("3–4 weeks reach more"); or Schedule campaign (W01) | money stepper, day stepper, radio cards, tip boxes | valid, under minimum |
| S12 | Review & pay | last step | summary, fee, local/global payment | summary, payment sheet | processing, paid, failed |
| S13 | Under review | after pay | waiting for platform approval | status badge | pending (long — top complaint), approved, rejected |
| S14 | Campaign detail | tap campaign | results per platform; edit budget, end date, name | KPI tiles, tabs, edit sheet | live, paused, ended |
| S15 | Reports | tab | unified funnel: impressions → product views → add to cart → checkout → purchase, with % of step 1 (W03) | funnel chart, date range | — |
| S16 | Export report | reports | send PDF report to an email (W01 modal) | email input, Send / Cancel | — |
| S17 | PDF report | email | per-platform creative performance, "ads driving most sales" (campaign / ad set / ad), spend, purchases, gender donut, age groups by gender (W06) | report layout, charts | — |
| S18 | Support chat | floating chat button on every screen | human chat, "reply within a few minutes"; support chases platform review (W04) | chat bubble, thread | — |
| S19 | Team & permissions | settings | invite users with roles ("flexible user permissions") | member list, role picker | — |

## Flows

```
F01 First ad, start to live
    S01 -> S02 -> S03 -> S06 -> S07/S08 -> S10 -> S11 -> S12 -> S13 -> S14
    happy path clicks: ~20 (estimate)
    edge: OTP never arrives, video upload fails, budget under minimum,
          rejected by one platform only, payment fails, review takes days

F02 Store owner: ad from a product
    S04 (connect Zid/Shopify) -> S06 -> S09 -> S10 (AI targeting) -> S11 -> S12
    edge: store has no products, product has no image, trial ends

F03 Connect tracking
    S03 -> OAuth to Meta / Snap / TikTok -> pick IG account, FB page, pixel -> connected
    edge: not admin of the ad account, token expires, no pixel yet

F04 Results and report
    S05 -> S14 -> S15 -> S16 -> PDF (S17) in inbox
    edge: no data in first 24h, platform API delay, mixed currencies

F05 Edit a live campaign
    S14 -> edit (budget, end date, name) -> saved
    edge: platform rejects edit, budget lowered below spent

F06 Ask support
    any screen -> S18 -> message -> reply
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary (filled), secondary (outline) | default, pressed, disabled, loading | all |
| Platform tile | Snap, TikTok, Instagram, Google, Meta | selected (outlined + tint), unselected | S03, S06 |
| Format card | per platform, phone mock + text + goal chips | "New" badge | S06 |
| Goal chip | Sales, Traffic, App installs | selected | S06 |
| Money / number stepper | per day, days | valid, below minimum | S11 |
| Radio card | Instant, Scheduled | selected | S11 |
| Tip box | green, with icon | — | S11 |
| Accordion row | store connect | open, closed | S04 |
| Asset row | with check | connected, missing | S03 |
| Template grid | 2 columns | — | S07 |
| Editor toolbar | transform, adjust, sticker, text, text design | — | S08 |
| KPI tile | spend, purchases, reach, clicks | loading, value, no data | S05, S14, S17 |
| Funnel chart | 5 steps with % | — | S15 |
| Donut / grouped bar | gender, age × gender | — | S17 |
| Modal | export report | — | S16 |
| Floating chat button | — | unread | all |
| Status badge | review, live, paused, ended, rejected | — | S05, S13, S14 |
| OTP input | 4/6 digits | typing, error, resend | S01 |

## Inferred data model

```
User         id, phone, name, email, language
             evidence: S01, S16 — confidence: medium
Business     id, name, category, country, currency
             confidence: medium
Membership   user_id, business_id, role (owner|admin|member)
             evidence: "flexible user permissions" (W04) — confidence: medium
Store        id, business_id, platform (zid|shopify|ordable|salla), external_id, token
             evidence: W01, W04 text — confidence: high
Product      id, store_id, external_id, title, price, image_url, url
             evidence: "create ads using your product details" (W01) — confidence: medium
AdAccount    id, business_id, platform (snap|tiktok|meta|google), external_id, token,
             pixel_id, ig_account, fb_page
             evidence: W04 marketing hub — confidence: high
Campaign     id, business_id, name, platform, format, goal (sales|traffic|app_installs),
             daily_budget, currency, mode (instant|scheduled), days, start_at, end_at,
             status (draft|review|live|paused|ended|rejected), fee_pct
             evidence: W01 budget/duration, W02 goals, SA listing edits — confidence: high
             note: W02 shows one platform per campaign; multi-platform launch is a guess
AdSet        id, campaign_id, external_id, audience (json), ai_targeting
             evidence: "Ad set: Lookalike audience - iOS" (W06) — confidence: high
Ad           id, ad_set_id, external_id, creative_id, status, rejection_reason
             evidence: "Ad: Best sellers video" (W06) — confidence: high
Creative     id, business_id, template_id, media_url, media_type, text, cta, link
             evidence: W05 editor — confidence: high
Template     id, category, preview_url, layout (json)
             evidence: W05 — confidence: high
Payment      id, campaign_id, amount, fee, method, status
             confidence: medium
MetricDaily  ad_id, date, spend, impressions, product_views, add_to_cart,
             checkout, purchases, revenue, by gender, by age
             evidence: W03 funnel, W06 breakdowns — confidence: high
SupportThread id, business_id, messages
             evidence: W04 — confidence: high
```

Relationships: User n-n Business (Membership); Business 1-n Store, AdAccount,
Campaign, Creative; Store 1-n Product; Campaign 1-n AdSet 1-n Ad;
Ad 1-n MetricDaily.

## Pain points (raw material for /replica-entrepreneur)

Search summaries, not yet verbatim:
- Long ad review before going live (even their own marketing shows it: W04)
- Weak support, repeated answers, demo cancelled
- OTP login, sign-in crash, video upload failures
- High minimums ($75–$175) and they push big budgets ($200/day tip)
- Fee feels expensive

## Feature matrix

See `features.csv`. Must: 16, should: 13, could: 9, skip: 3.

## Out of scope

- Their partner status with Meta / Snap / TikTok / Google and the
  "50% back in credit" deal: you need your own.
- Their customer base, testimonials and case studies.
- Their name, logo ("Get set. Grow."), purple brand, copy, template designs
  and photos: replica-brand and replica-design make your own.

## Size

Screens 19, flows 6, entities 14.

Hard parts:
1. **Ad platform API access**: Meta Marketing API app review, Snap and
   TikTok Marketing API approval, Google Ads developer token. Weeks. Apply
   on day 1.
2. **Money flow**: users pay platforms with their own card (subscription
   model, simpler) vs. you collect spend and pay platforms (agency model,
   entity + invoicing + refunds).
3. **In-app image/video editor + templates**: a real editor is a product of
   its own. Use an SDK (e.g. IMG.LY, or a simpler canvas) rather than build.
4. **Unified funnel reporting + PDF**: four APIs, different metrics and
   attribution windows.

Size: **L** for Snap + Meta with a simple editor; **XL** for everything.
