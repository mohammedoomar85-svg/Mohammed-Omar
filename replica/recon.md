# Recon map: OptimizeApp (iOS + Android, also web)

Scope (proposed, not yet confirmed): the core loop only. A business owner
creates one ad, launches it on Snapchat / TikTok / Instagram+Facebook from one
app, pays one budget, and watches results in one dashboard.
For: small businesses and online stores in the Gulf (Kuwait, Saudi, UAE),
Arabic + English. Product to sell (TBC with the user).
Date: 2026-11-22

> **Evidence caveat.** The site and store pages could not be opened directly
> from this session (network/DNS). Everything below comes from web-search
> summaries of the App Store, Google Play, Zid app store and the official
> features page. Treat every "medium" row as something to confirm by
> opening the app on your own phone and adding screenshots to
> `replica/screens/`.

## Sources

| # | source | URL | notes |
| --- | --- | --- | --- |
| 1 | App Store (KW) | https://apps.apple.com/kw/app/optimizeapp/id1462878125 | given by user; free; Business category |
| 2 | App Store (US) | https://apps.apple.com/us/app/optimizeapp/id1462878125 | 2.5★ from 11 ratings (search summary) |
| 3 | App Store (SA) | https://apps.apple.com/sa/app/optimizeapp/id1462878125 | Meta pixel, TikTok account link, edit end date/budget after launch; OTP login complaint |
| 4 | App Store (AE) | https://apps.apple.com/ae/app/optimizeapp/id1462878125 | support complaint, cancelled demo |
| 5 | Google Play | https://play.google.com/store/apps/details?id=com.optimizeapp.optimizeapp | ~3.2★ / 275 reviews; tagline "Seriously simple ads"; dev reply: min $75 for 3 days, ≥$25/day; claims 35,000+ businesses |
| 6 | Features page | https://optimizeapp.com/en/features | create/launch/schedule ads from one place, unified dashboard, AI visuals, platform-specific targeting, auto scheduling |
| 7 | Zid app store | https://apps.zid.sa/en-sa/apps/2812 | Zid store integration, Snapchat pixel + CAPI, AI audience targeting, 7-day free trial |
| 8 | AppGrooves negatives | https://appgrooves.com/app/optimize-app-by-optimize-advertising-and-marketing-company-wll/negative | 198 reviews aggregated; complaints list |
| 9 | Your own account | — | **not done yet** — the most valuable source |

## Core loop

Launch one paid social ad across Snap, TikTok, Meta and Google from a phone,
without touching each platform's ads manager, and see the results in one place.
Revenue: a service fee on top of ad spend (developer reply: "no more than 15%").

## Screens

| ID | screen | route / how to reach | purpose | key components | states seen |
| --- | --- | --- | --- | --- | --- |
| S01 | Welcome / sign in | first launch | phone OTP login (per SA review) | phone input, OTP code input | error (OTP not arriving — complaint) |
| S02 | Business profile setup | after first login | business name, category, country, website/store | form, category picker | empty, filled |
| S03 | Connect accounts | onboarding + settings | link Meta, TikTok, Snap, Google; Meta pixel; Snap pixel/CAPI | account cards with connect buttons | not connected, connected, error |
| S04 | Home / dashboard | tab | all campaigns' totals across platforms | KPI tiles, chart, campaign list | empty (no campaigns), filled |
| S05 | Create ad: goal | "+" / new ad | pick objective (visits, sales, messages, awareness — guess) | option cards | — |
| S06 | Create ad: platforms | step 2 | choose Snap / TikTok / Instagram / Facebook / Google | multi-select platform chips | — |
| S07 | Create ad: creative | step 3 | upload image/video, write text, CTA, link; AI visuals | media picker, text fields, preview per platform | uploading, upload failed (complaint) |
| S08 | Create ad: audience | step 4 | location, age, gender, interests; "AI audience" | map/area picker, sliders, chips | — |
| S09 | Create ad: budget & schedule | step 5 | total/daily budget, start/end dates | budget input with minimum, date pickers | below-minimum error |
| S10 | Review & pay | step 6 | summary, fee, pay | summary card, payment sheet | processing, paid, failed |
| S11 | Under review | after pay | platform/app review before going live | status badge | pending (long delay — complaint), approved, rejected |
| S12 | Campaign detail | tap campaign | per-platform results, edit end date/budget/name | KPI tiles, per-platform tabs, chart, edit sheet | live, paused, ended |
| S13 | Reports | tab or campaign | spend, impressions, clicks, conversions/revenue | charts, date range | — |
| S14 | Account / settings | tab | profile, linked accounts, payment methods, language, support | list | — |
| S15 | Support / demo booking | settings | chat or book a demo | chat or form | — |

## Flows

```
F01 First ad, start to live
    S01 -> S02 -> S05 -> S06 -> S07 -> S08 -> S09 -> S10 -> S11 -> S12
    happy path clicks: ~20 (estimate — count on the real app)
    edge: OTP never arrives, video upload fails, budget under minimum,
          ad rejected by one platform but not others, payment fails

F02 Connect tracking (pixel / CAPI)
    S14 -> S03 -> (OAuth to Meta / Snap / TikTok) -> S03 connected
    edge: user is not admin of the ad account, token expires

F03 Check results
    S04 -> S12 -> S13
    edge: no data yet (first 24h), platform API delay, currency differences

F04 Edit a live campaign
    S12 -> edit sheet (end date, budget, name) -> saved
    edge: edit rejected by platform, budget lowered below already-spent

F05 Store owner via Zid
    install from Zid app store -> store linked -> products available as ads
    edge: store has no products, trial ends (7 days)
```

## Components

| component | variants | states | used on |
| --- | --- | --- | --- |
| Button | primary, secondary, ghost, danger | default, pressed, disabled, loading | all |
| Stepper header | 6 steps | current, done, upcoming | S05–S10 |
| Platform chip | Snap, TikTok, IG, FB, Google | selected, unselected, unavailable | S06, S12 |
| KPI tile | spend, reach, clicks, conversions | loading, value, no data | S04, S12, S13 |
| Ad preview | per-platform frame | image, video | S07, S10 |
| Media picker | image, video | empty, uploading, failed | S07 |
| Audience picker | location, age, gender, interests | — | S08 |
| Budget input | total, daily | valid, under minimum | S09 |
| Status badge | review, live, paused, ended, rejected | — | S11, S12, S04 |
| Bottom sheet | edit, payment | — | S10, S12 |
| OTP input | 4/6 digits | typing, error, resend timer | S01 |

## Inferred data model

```
User         id, phone, name, language, created_at
             evidence: S01 OTP login (SA review) — confidence: medium
Business     id, owner_id, name, category, country, website, store_platform (zid|salla|shopify|none)
             evidence: Zid listing, Shopify listing — confidence: medium
AdAccount    id, business_id, platform (snap|tiktok|meta|google), external_id,
             token (encrypted), pixel_id, status
             evidence: "connect your TikTok account", "Meta pixel", Snap CAPI — confidence: high
Campaign     id, business_id, name, objective, total_budget, daily_budget, currency,
             start_at, end_at, status (draft|review|live|paused|ended|rejected), fee_pct
             evidence: edit end date/budget/name (SA listing), $75/3-day minimum — confidence: high
PlatformCampaign  id, campaign_id, platform, external_campaign_id, external_ad_id,
             status, rejection_reason
             evidence: one ad launched on several platforms — confidence: medium (guess on split)
Creative     id, campaign_id, media_url, media_type, headline, body, cta, link
             evidence: S07, upload complaints — confidence: medium
Audience     id, campaign_id, locations, age_min, age_max, genders, interests, ai_generated
             evidence: "smart targeting", "AI audience" — confidence: medium
Payment      id, campaign_id, amount, fee, provider, status
             evidence: fee reply, "expensive" complaints — confidence: medium
MetricDaily  platform_campaign_id, date, spend, impressions, clicks, conversions, revenue
             evidence: unified dashboard, "real-time performance" — confidence: high
```

Relationships: User 1-n Business, Business 1-n AdAccount, Business 1-n
Campaign, Campaign 1-n PlatformCampaign, Campaign 1-1 Creative/Audience,
Campaign 1-n Payment, PlatformCampaign 1-n MetricDaily.

## What users complain about (raw material for /replica-entrepreneur)

From search summaries — **not yet verbatim**, needs real quotes with links:
- Long wait for account / ad review before going live (US/SA App Store)
- Weak customer support, repeated answers, demo cancelled (AE App Store)
- OTP login problems, sign-in crash, video upload failures
- High minimum spend ($75–$175) and the fee feels expensive (Google Play)
- Slow processing

## Feature matrix

See `features.csv`. Must: 14, should: 9, could: 7, skip: 3.

## Out of scope (cannot or should not be cloned)

- Their ad-platform partner status / agency credit lines with Meta, Snap,
  TikTok, Google — you must earn your own (Marketing API app review).
- Their "35,000+ businesses" customer base and any case studies.
- Their name, logo, "Seriously simple ads" tagline, copy and visuals.

## Size

Screens 15, flows 5, entities 9.

Hard parts:
1. **Ad platform API access** — Meta Marketing API (app review + Advanced
   Access), TikTok Marketing API (developer approval), Snap Marketing API
   (partner approval), Google Ads (developer token, basic → standard access).
   Weeks of approvals before the first real ad. Start applying on day 1.
2. **Money flow** — either users pay platforms with their own card (simpler,
   you charge a subscription) or you collect spend and pay platforms
   (agency/reseller model, needs a business entity, invoicing, refunds).
3. **Unified reporting** — four APIs with different metrics, delays, currencies
   and attribution windows, normalised into one dashboard.

Size: **L** (a quarter) for 2 platforms (Snap + Meta, the biggest in the
Gulf), **XL** for all four. Recommend: Snap + Meta first.
