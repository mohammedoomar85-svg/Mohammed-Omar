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
    "🔥 BUY 2 GET 1 FREE — automatically applied at checkout",
    "🚚 FREE US SHIPPING ON ORDERS $75+",
    "⚽ NEW 25/26 KITS JUST DROPPED — USE CODE PITCH10 FOR 10% OFF"
  ],
  email: "support@pitchfits.com",
  instagram: "https://instagram.com/",
  tiktok: "https://tiktok.com/"
};

/* Collections shown in the menu and on the home page.
   `id` is used in links: collection.html?c=<id> */
window.COLLECTIONS = [
  { id: "new",       name: "New Arrivals",   tag: "25/26 Season",    colors: ["#0b0b0b", "#c6ff3d"] },
  { id: "england",   name: "England",        tag: "Top Flight Clubs", colors: ["#3d0a5b", "#ffffff"] },
  { id: "spain",     name: "Spain",          tag: "La Liga Clubs",    colors: ["#ffffff", "#e10600"] },
  { id: "italy",     name: "Italy",          tag: "Serie A Clubs",    colors: ["#0a2a8a", "#ffffff"] },
  { id: "germany",   name: "Germany",        tag: "Bundesliga Clubs", colors: ["#d1001f", "#ffffff"] },
  { id: "france",    name: "France",         tag: "Ligue 1 Clubs",    colors: ["#0a1f44", "#e10600"] },
  { id: "national",  name: "National Teams", tag: "Road to 2026",     colors: ["#0a7d3b", "#ffffff"] },
  { id: "retro",     name: "Retro",          tag: "Classic Kits",     colors: ["#f2e8d5", "#1a1a1a"] },
  { id: "kids",      name: "Kids",           tag: "Youth Sizes",      colors: ["#ffcc00", "#0b0b0b"] }
];

/* PRODUCTS
   - price: selling price. compareAt: old price (shows as crossed out + SALE badge). Leave null for no sale.
   - image: path or URL to a photo (e.g. "assets/img/club-home.jpg"). Leave "" to show a drawn jersey in `kit` colors.
   - kit.pattern: solid | stripes | hoops | half | sash | pinstripe
   - collections: list of collection ids the product appears in
   - badge: optional small label ("Best Seller", "New", "Low Stock")
   The products below are SAMPLES — replace them with your real ones. */
window.PRODUCTS = [
  { id: "p01", name: "Sample Club Home Jersey 25/26", price: 34.99, compareAt: 59.99, collections: ["new","england"], badge: "Best Seller", rating: 4.9, reviews: 212, image: "", kit: { primary: "#c8102e", secondary: "#ffffff", pattern: "solid" } },
  { id: "p02", name: "Sample Club Away Jersey 25/26", price: 34.99, compareAt: 59.99, collections: ["new","england"], badge: "New", rating: 4.8, reviews: 97, image: "", kit: { primary: "#111111", secondary: "#c6ff3d", pattern: "solid" } },
  { id: "p03", name: "Sample Sky Blue Home 25/26", price: 34.99, compareAt: 54.99, collections: ["new","england"], badge: "", rating: 4.9, reviews: 156, image: "", kit: { primary: "#6cabdd", secondary: "#ffffff", pattern: "solid" } },
  { id: "p04", name: "Sample Blanco Home 25/26", price: 36.99, compareAt: 64.99, collections: ["new","spain"], badge: "Best Seller", rating: 5.0, reviews: 301, image: "", kit: { primary: "#f5f5f5", secondary: "#c9a227", pattern: "solid" } },
  { id: "p05", name: "Sample Blaugrana Home 25/26", price: 36.99, compareAt: 64.99, collections: ["new","spain"], badge: "", rating: 4.8, reviews: 188, image: "", kit: { primary: "#a50044", secondary: "#004d98", pattern: "stripes" } },
  { id: "p06", name: "Sample Nerazzurri Home 25/26", price: 34.99, compareAt: 54.99, collections: ["italy"], badge: "", rating: 4.7, reviews: 64, image: "", kit: { primary: "#0068a8", secondary: "#111111", pattern: "stripes" } },
  { id: "p07", name: "Sample Bianconeri Home 25/26", price: 34.99, compareAt: 54.99, collections: ["italy"], badge: "Low Stock", rating: 4.8, reviews: 120, image: "", kit: { primary: "#ffffff", secondary: "#111111", pattern: "stripes" } },
  { id: "p08", name: "Sample Bavarian Home 25/26", price: 34.99, compareAt: 59.99, collections: ["germany"], badge: "", rating: 4.9, reviews: 143, image: "", kit: { primary: "#dc052d", secondary: "#ffffff", pattern: "solid" } },
  { id: "p09", name: "Sample Parisian Home 25/26", price: 34.99, compareAt: 59.99, collections: ["france"], badge: "", rating: 4.8, reviews: 110, image: "", kit: { primary: "#0a1f44", secondary: "#da291c", pattern: "half" } },
  { id: "p10", name: "Sample USA Home 2026", price: 39.99, compareAt: 69.99, collections: ["new","national"], badge: "Best Seller", rating: 5.0, reviews: 402, image: "", kit: { primary: "#ffffff", secondary: "#0a3161", pattern: "sash" } },
  { id: "p11", name: "Sample Argentina Home 2026", price: 39.99, compareAt: 69.99, collections: ["national"], badge: "", rating: 4.9, reviews: 377, image: "", kit: { primary: "#75aadb", secondary: "#ffffff", pattern: "stripes" } },
  { id: "p12", name: "Sample Brazil Home 2026", price: 39.99, compareAt: 69.99, collections: ["national"], badge: "", rating: 4.9, reviews: 265, image: "", kit: { primary: "#ffdf00", secondary: "#009c3b", pattern: "solid" } },
  { id: "p13", name: "Sample Mexico Home 2026", price: 39.99, compareAt: 64.99, collections: ["national"], badge: "New", rating: 4.8, reviews: 189, image: "", kit: { primary: "#006847", secondary: "#ce1126", pattern: "solid" } },
  { id: "p14", name: "Retro Classic Red 1998/99", price: 44.99, compareAt: 74.99, collections: ["retro","england"], badge: "Best Seller", rating: 5.0, reviews: 233, image: "", kit: { primary: "#d6001c", secondary: "#ffffff", pattern: "solid" } },
  { id: "p15", name: "Retro Milano Stripes 1993/94", price: 44.99, compareAt: 74.99, collections: ["retro","italy"], badge: "", rating: 4.9, reviews: 141, image: "", kit: { primary: "#c8102e", secondary: "#111111", pattern: "stripes" } },
  { id: "p16", name: "Retro Total Football 1974", price: 44.99, compareAt: 69.99, collections: ["retro","national"], badge: "", rating: 4.8, reviews: 88, image: "", kit: { primary: "#f36c21", secondary: "#ffffff", pattern: "solid" } },
  { id: "p17", name: "Retro Celtic Hoops 1987/88", price: 44.99, compareAt: 69.99, collections: ["retro"], badge: "", rating: 4.9, reviews: 76, image: "", kit: { primary: "#018749", secondary: "#ffffff", pattern: "hoops" } },
  { id: "p18", name: "Retro Pinstripe 2000/01", price: 44.99, compareAt: 69.99, collections: ["retro","spain"], badge: "Low Stock", rating: 4.7, reviews: 52, image: "", kit: { primary: "#1a1a1a", secondary: "#c6ff3d", pattern: "pinstripe" } },
  { id: "p19", name: "Kids Sample Club Home Kit (Shirt + Shorts)", price: 29.99, compareAt: 49.99, collections: ["kids"], badge: "", rating: 4.9, reviews: 131, image: "", kit: { primary: "#c8102e", secondary: "#ffffff", pattern: "solid" } },
  { id: "p20", name: "Kids Sample National Home Kit 2026", price: 29.99, compareAt: 49.99, collections: ["kids","national"], badge: "New", rating: 4.8, reviews: 67, image: "", kit: { primary: "#ffffff", secondary: "#0a3161", pattern: "sash" } }
];

window.SIZES = {
  adult: ["S", "M", "L", "XL", "2XL", "3XL"],
  kids:  ["4-5Y", "6-7Y", "8-9Y", "10-11Y", "12-13Y"]
};

window.REVIEWS = [
  { name: "Jake M.",     place: "Austin, TX",     stars: 5, text: "Quality is unreal for the price. Stitching and badge look perfect. Arrived in 9 days." },
  { name: "Daniela R.",  place: "Miami, FL",      stars: 5, text: "Got the Buy 2 Get 1 deal for me and my brothers. Sizing was spot on." },
  { name: "Chris P.",    place: "Columbus, OH",   stars: 5, text: "Ordered a retro kit with my name and number. Looks exactly like the pictures." },
  { name: "Aaliyah K.",  place: "Brooklyn, NY",   stars: 4, text: "Shipping took about two weeks but the jersey is great. Will order again." }
];
