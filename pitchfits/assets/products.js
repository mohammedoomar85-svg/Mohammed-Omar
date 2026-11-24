/* ============================================================
   PITCHFITS — store settings + product catalog
   Edit this file to change prices, discounts and products.
   ============================================================ */

window.STORE = {
  name: "PitchFits",
  domain: "PitchFits.com",
  currency: "USD",
  freeShippingThreshold: 75,      // free US shipping at or above this subtotal
  shippingFee: 6.99,              // shipping below the threshold
  buyXGetY: { buy: 2, free: 1 },  // "Buy 2 Get 1 Free": cheapest item in every 3 is free. Set to null to turn off.
  customizationPrice: 9.99,       // add name + number
  discountCodes: {                // code: percent off
    PITCH10: 10,
    WELCOME15: 15
  },
  announcements: [
    "🖤 BLACK FRIDAY SALE — ALL JERSEYS $45 (WAS $65)",
    "🔥 BUY 2 GET 1 FREE — automatically applied at checkout",
    "🚚 FREE US SHIPPING ON ORDERS $75+",
    "⚽ WORLD CUP 2026 KITS IN STOCK — USE CODE PITCH10 FOR 10% OFF"
  ],
  deliveryDays: "5–7",            // business days, anywhere in the USA (processing included)
  /* Payment methods shown on the site. They work for real once checkout is connected (Shopify Payments / Stripe / PayPal). */
  paymentMethods: ["visa", "mastercard", "amex", "discover", "paypal", "venmo", "applepay", "googlepay", "shoppay", "klarna", "afterpay", "affirm", "cashapp"],
  installmentProviders: "Klarna, Afterpay or Affirm",
  email: "support@pitchfits.com",
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/"
};

/* Collections shown in the menu and on the home page.
   `id` is used in links: collection.html?c=<id> */
window.COLLECTIONS = [
  { id: "clubs",            name: "Club Kits",             tag: "26/27 Season" },
  { id: "national",         name: "National Teams",        tag: "World Cup 2026" },
  { id: "classic-clubs",    name: "Classic Club Kits",     tag: "Previous Seasons" },
  { id: "classic-national", name: "Classic National Kits", tag: "Past Tournaments" },
  { id: "new",              name: "New Arrivals",          tag: "Just Dropped" }
];

/* PRODUCTS — how to add one:
   - id: short unique name (used in the link)
   - team / season: shown on the card and used for the team filter
   - price: selling price · compareAt: old price (crossed out + SALE badge), or null
   - images: photos in assets/img/products/ (first = main photo, second = shown on hover)
   - print: the name & number in the photos (sold "as pictured" at no extra cost). null = blank jersey
   - collections: clubs | national | classic-clubs | classic-national | new
   - badge: optional label ("Best Seller", "New", "Low Stock")
   - rating / reviews: add ONLY real numbers from real customer reviews (leave out otherwise) */
const IMG = "assets/img/products/";
window.PRODUCTS = [
  /* ---------- Club kits — current season (26/27): add here with collections: ["clubs"] ---------- */

  /* ---------- Classic club kits — previous seasons ---------- */
  { id: "real-madrid-third-2526", team: "Real Madrid", season: "25/26", name: "Real Madrid Third Jersey 25/26", print: { name: "MBAPPÉ", number: "10" },
    price: 45, compareAt: 65, collections: ["classic-clubs"], badge: "Best Seller",
    images: [IMG + "real-madrid-third-2526-front.jpg", IMG + "real-madrid-third-2526-back.jpg"],
    details: ["Champions League sleeve badges", "Club World champions badge"] },

  /* ---------- National teams — World Cup 2026 ---------- */
  { id: "brazil-home-2026-neymar", team: "Brazil", season: "2026", name: "Brazil Home Jersey 2026", print: { name: "NEYMAR JR", number: "10" },
    price: 45, compareAt: 65, collections: ["national", "new"], badge: "Best Seller",
    images: [IMG + "brazil-home-2026-neymar-front.jpg", IMG + "brazil-home-2026-neymar-back.jpg"],
    details: ["World Cup 2026 sleeve badges"] },
  { id: "brazil-home-2026-raphinha", team: "Brazil", season: "2026", name: "Brazil Home Jersey 2026", print: { name: "RAPHINHA", number: "11" },
    price: 45, compareAt: 65, collections: ["national"], badge: "",
    images: [IMG + "brazil-home-2026-raphinha-front.jpg", IMG + "brazil-home-2026-raphinha-back.jpg"],
    details: ["World Cup 2026 sleeve badges"] },
  { id: "brazil-away-2026-neymar", team: "Brazil", season: "2026", name: "Brazil Away Jersey 2026", print: { name: "NEYMAR JR", number: "10" },
    price: 45, compareAt: 65, collections: ["national", "new"], badge: "New",
    images: [IMG + "brazil-away-2026-front.jpg", IMG + "brazil-away-2026-back.jpg"],
    details: ["World Cup 2026 sleeve badges"] },
  { id: "portugal-home-2026-ronaldo", team: "Portugal", season: "2026", name: "Portugal Home Jersey 2026", print: { name: "RONALDO", number: "7" },
    price: 45, compareAt: 65, collections: ["national", "new"], badge: "Best Seller",
    images: [IMG + "portugal-home-2026-back.jpg"],
    details: ["World Cup 2026 sleeve badges"] },
  { id: "england-home-2026", team: "England", season: "2026", name: "England Home Jersey 2026", print: { name: "BELLINGHAM", number: "10" },
    price: 45, compareAt: 65, collections: ["national", "new"], badge: "",
    images: [IMG + "england-home-2026-back.jpg", IMG + "england-home-2026-front.jpg"] },
  { id: "england-away-2026", team: "England", season: "2026", name: "England Away Jersey 2026", print: { name: "KANE", number: "9" },
    price: 45, compareAt: 65, collections: ["national", "new"], badge: "",
    images: [IMG + "england-away-2026-back.jpg", IMG + "england-away-2026-front.jpg"] },

  { id: "psg-home-2425-ucl-final", team: "Paris Saint-Germain", season: "24/25", name: "PSG Home Jersey 24/25 — Champions League Final", print: { name: "O.DEMBÉLÉ", number: "10" },
    price: 45, compareAt: 65, collections: ["classic-clubs"], badge: "Best Seller",
    images: [IMG + "psg-home-2425-front.jpg", IMG + "psg-home-2425-back.jpg"],
    details: ["Final Munich 2025 match details", "Champions League sleeve badges"] },
  { id: "santos-home-2012", team: "Santos", season: "2012", name: "Santos Home Jersey 2012 — Centenary", print: { name: "NEYMAR JR", number: "11" },
    price: 45, compareAt: 65, collections: ["classic-clubs"], badge: "",
    images: [IMG + "santos-home-2012-front.jpg", IMG + "santos-home-2012-back.jpg"],
    details: ["1912–2012 centenary crest"] },
  { id: "barcelona-away-0405", team: "Barcelona", season: "04/05", name: "Barcelona Away Jersey 04/05", print: { name: "RONALDINHO", number: "10" },
    price: 45, compareAt: 65, collections: ["classic-clubs"], badge: "",
    images: [IMG + "barcelona-away-0405-back.jpg"],
    details: ["LFP sleeve and number badges"] },

  /* ---------- Classic national kits — past tournaments ---------- */
  { id: "france-away-2024", team: "France", season: "2024", name: "France Away Jersey 2024", print: { name: "MBAPPE", number: "10" },
    price: 45, compareAt: 65, collections: ["classic-national"], badge: "",
    images: [IMG + "france-away-2024-front.jpg", IMG + "france-away-2024-back.jpg"] },
  { id: "brazil-home-2022", team: "Brazil", season: "2022", name: "Brazil Home Jersey 2022", print: { name: "NEYMAR JR", number: "10" },
    price: 45, compareAt: 65, collections: ["classic-national"], badge: "",
    images: [IMG + "brazil-home-2022-front.jpg", IMG + "brazil-home-2022-back.jpg"] }
];

window.SIZES = {
  adult: ["S", "M", "L", "XL", "2XL", "3XL"],
  kids:  ["4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"]
};

/* Real customer reviews only. The reviews section stays hidden while this list is empty. Example:
   { name: "Jake M.", place: "Austin, TX", stars: 5, text: "Great quality, fast shipping." } */
window.REVIEWS = [];
