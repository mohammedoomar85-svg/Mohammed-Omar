/* PITCHFITS storefront — shared header/footer, cart, and page rendering. */
(function () {
  const S = window.STORE, P = window.PRODUCTS, C = window.COLLECTIONS;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const money = n => "$" + n.toFixed(2);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const byId = id => P.find(p => p.id === id);
  const colById = id => C.find(c => c.id === id);
  const isKids = p => p.collections.includes("kids");
  const imgs = p => p.images || (p.image ? [p.image] : []);
  const printLabel = pr => pr ? `${pr.name} #${pr.number}` : "";
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- Drawn jersey (fallback when a product has no photo) ---------- */
  let uid = 0;
  const BODY = "M62 14 L84 6 Q100 22 116 6 L138 14 L188 42 L170 92 L148 82 L148 212 Q100 220 52 212 L52 82 L30 92 L12 42 Z";
  function jersey(kit, opts = {}) {
    kit = kit || { primary: "#e9e9e6", secondary: "#bdbdbd" };
    const id = "j" + (++uid), a = kit.primary, b = kit.secondary;
    const num = opts.number ? `<text x="100" y="150" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="56" fill="${b}" stroke="${a}" stroke-width="5" paint-order="stroke">${esc(opts.number)}</text>` : "";
    return `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs><clipPath id="${id}c"><path d="${BODY}"/></clipPath>
        <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".25" stop-color="#fff" stop-opacity=".08"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>
      <g clip-path="url(#${id}c)"><rect width="200" height="230" fill="${a}"/>
        <path d="M12 42 L30 92 L40 87 L22 37 Z M188 42 L170 92 L160 87 L178 37 Z" fill="${b}"/>
        <path d="M84 6 Q100 22 116 6 L122 9 Q100 34 78 9 Z" fill="${b}"/>${num}
        <rect width="200" height="230" fill="url(#${id}g)"/></g>
      <path d="${BODY}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/></svg>`;
  }
  const photo = (src, alt, cls = "") => `<img class="photo ${cls}" src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`;
  const media = p => imgs(p).length ? photo(imgs(p)[0], p.name) : jersey(p.kit);

  /* ---------- Icons ---------- */
  const I = {
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>',
    bag: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 8h14l-1 13H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    close: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></svg>',
    gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10h18v4H3zM5 14h14v7H5zM12 10v11M12 10S10 4 7.5 5.5 9 10 12 10Zm0 0s2-6 4.5-4.5S15 10 12 10Z"/></svg>',
    back: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 3v5h5"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></svg>',
    arrow: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    ig: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    tt: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.3 1.7 3.8 4 4v3c-1.5 0-2.9-.4-4-1.2V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3h3Z"/></svg>'
  };
  /* Payment badges (text marks in each brand's colors) */
  const PAY = {
    visa: ["VISA", "#1a1f71", "#fff", "italic 900 13px/1 Arial, sans-serif"],
    mastercard: ['<i style="display:inline-flex"><b style="width:13px;height:13px;border-radius:50%;background:#eb001b;display:inline-block"></b><b style="width:13px;height:13px;border-radius:50%;background:#f79e1b;display:inline-block;margin-left:-5px;mix-blend-mode:multiply"></b></i>', "#fff", "#111"],
    amex: ["AMEX", "#2e77bc", "#fff"],
    discover: ['DISC<b style="display:inline-block;width:9px;height:9px;border-radius:50%;background:#f76f20;margin:0 1px"></b>VER', "#fff", "#111"],
    paypal: ['<b style="color:#003087">Pay</b><b style="color:#009cde">Pal</b>', "#fff", "#003087", "italic 900 13px/1 Arial, sans-serif"],
    venmo: ["venmo", "#008cff", "#fff", "italic 900 13px/1 Arial, sans-serif"],
    applepay: ["Apple Pay", "#000", "#fff"],
    googlepay: ['<b style="color:#4285f4">G</b> Pay', "#fff", "#3c4043"],
    shoppay: ["shop<b style='font-weight:900'>Pay</b>", "#5a31f4", "#fff"],
    klarna: ["Klarna.", "#ffb3c7", "#0b051d"],
    afterpay: ["afterpay", "#b2fce4", "#000"],
    affirm: ["affirm", "#fff", "#4a4af4"],
    cashapp: ["Cash App Pay", "#00d632", "#fff"]
  };
  const payBadges = (cls = "") => `<div class="pay-badges ${cls}">${(S.paymentMethods || []).filter(k => PAY[k]).map(k => { const [t, bg, fg, font] = PAY[k]; return `<span title="${k}" style="background:${bg};color:${fg}${font ? ";font:" + font : ""}">${t}</span>`; }).join("")}</div>`;
  const starStr = r => "★★★★★".slice(0, Math.round(r)) + "☆☆☆☆☆".slice(0, 5 - Math.round(r));
  const stars = p => p.rating ? `<div class="stars">${starStr(p.rating)}<small>(${p.reviews || 0})</small></div>` : "";

  /* ---------- Header / footer ---------- */
  function shell() {
    const navLinks = `
      <a href="collection.html?c=new">New</a>
      ${P.some(p => p.collections.includes("clubs")) ? '<a href="collection.html?c=clubs">Club Kits</a>' : ""}
      <a href="collection.html?c=national">National Teams</a>`;
    const head = `
      <div class="announce">${S.announcements.map((t, i) => `<span class="${i ? "" : "on"}">${esc(t)}</span>`).join("")}</div>
      <header class="header">
        <div class="wrap">
          <button class="icon-btn menu-btn" data-open="mnav" aria-label="Menu">${I.menu}</button>
          <a href="index.html" class="logo">PITCH<b>FITS</b></a>
          <nav class="nav">${navLinks}
            <div class="dd"><a href="collection.html?c=classic">Classic Kits ▾</a>
              <div class="dd-menu"><a href="collection.html?c=classic-clubs">Classic Club Kits</a><a href="collection.html?c=classic-national">Classic National Kits</a></div></div>
            <a href="index.html#custom">Customize</a>
            <a href="collection.html?c=sale" class="sale">Sale</a>
          </nav>
          <div class="icons">
            <button class="icon-btn" data-toggle-search aria-label="Search">${I.search}</button>
            <a class="icon-btn" href="#" aria-label="Account">${I.user}</a>
            <button class="icon-btn" data-open="drawer" aria-label="Cart">${I.bag}<span class="cart-count">0</span></button>
          </div>
        </div>
        <div class="search-bar"><div class="wrap"><form action="collection.html"><input name="q" type="search" placeholder="Search teams, players, seasons..." autocomplete="off"></form></div></div>
      </header>
      <div class="mnav" id="mnav"><div class="shade" data-close></div><div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span class="logo">PITCH<b>FITS</b></span><button class="icon-btn" data-close aria-label="Close">${I.close}</button></div>
        ${navLinks}<a href="collection.html?c=classic-clubs">Classic Club Kits</a><a href="collection.html?c=classic-national">Classic National Kits</a>
        <a href="index.html#custom">Customize</a><a href="collection.html?c=sale" style="color:var(--sale)">Sale</a>
      </div></div>`;
    const foot = `
      <section class="news block"><div class="wrap">
        <h2 class="display">Get <em>10% Off</em> Your First Kit</h2>
        <p>Join the squad for drops, restocks and members-only deals. Code WELCOME10 works on full-price jerseys.</p>
        <form id="newsForm"><input type="email" required placeholder="Enter your email"><button class="btn accent">Join Now</button></form>
      </div></section>
      <footer class="footer"><div class="wrap">
        <div class="cols">
          <div><div class="logo">PITCH<b>FITS</b></div><p>Football jerseys for fans across the USA. Club, national team and classic kits, delivered to your door.</p>
            <div class="social"><a href="${S.instagram}" aria-label="Instagram">${I.ig}</a><a href="${S.tiktok}" aria-label="TikTok">${I.tt}</a></div></div>
          <div><h4>Shop</h4><a href="collection.html?c=new">New Arrivals</a>${P.some(p => p.collections.includes("clubs")) ? `<a href="collection.html?c=clubs">Club Kits</a>` : ""}<a href="collection.html?c=national">National Teams</a><a href="collection.html?c=classic-clubs">Classic Club Kits</a><a href="collection.html?c=classic-national">Classic National Kits</a><a href="collection.html?c=sale">Sale</a></div>
          <div><h4>Help</h4><a href="track.html">Track Your Order</a><a href="shipping.html">Shipping Policy</a><a href="returns.html">Returns &amp; Refunds</a><a href="size-guide.html">Size Guide</a><a href="faq.html">FAQ</a></div>
          <div><h4>Company</h4><a href="about.html">About Us</a><a href="contact.html">Contact Us</a><a href="privacy.html">Privacy Policy</a><a href="terms.html">Terms of Service</a><a href="mailto:${S.email}">${S.email}</a></div>
        </div>
        <div class="bottom"><span>© ${new Date().getFullYear()} ${S.domain} — All rights reserved.</span>
          ${payBadges()}</div>
      </div></footer>
      <div class="drawer" id="drawer"><div class="shade" data-close></div><div class="panel">
        <div class="top"><h3>Your Cart</h3><button class="icon-btn" data-close aria-label="Close">${I.close}</button></div>
        <div class="ship-bar"><div class="msg"></div><div class="track"><div class="fill"></div></div></div>
        <div class="lines"></div>
        <div class="sum"></div>
      </div></div>
      <div class="toast"><i>✓</i><span></span></div>`;
    document.body.insertAdjacentHTML("afterbegin", head);
    document.body.insertAdjacentHTML("beforeend", foot);

    const spans = $$(".announce span"); let ai = 0;
    if (spans.length > 1) setInterval(() => {
      spans[ai].className = "out"; const prev = ai;
      ai = (ai + 1) % spans.length; spans[ai].className = "on";
      setTimeout(() => { if (spans[prev].className === "out") spans[prev].className = ""; }, 500);
    }, 3800);

    document.addEventListener("click", e => {
      const o = e.target.closest("[data-open]"); if (o) { e.preventDefault(); $("#" + o.dataset.open).classList.add("open"); if (o.dataset.open === "drawer") renderCart(); }
      if (e.target.closest("[data-close]")) e.target.closest(".drawer, .mnav").classList.remove("open");
      if (e.target.closest("[data-toggle-search]")) { $(".search-bar").classList.toggle("open"); $(".search-bar input").focus(); }
      const cs = e.target.closest("[data-card-size]");
      if (cs) { const p = byId(cs.dataset.id); addToCart(p.id, cs.dataset.cardSize, 1, p.print ? { name: p.print.name, number: p.print.number, included: true } : null); }
      const add = e.target.closest("[data-quick-add]");
      if (add) { e.preventDefault(); location.href = "product.html?id=" + encodeURIComponent(add.dataset.quickAdd); }
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") $$(".drawer.open, .mnav.open").forEach(x => x.classList.remove("open")); });
    $("#newsForm").addEventListener("submit", e => { e.preventDefault(); e.target.reset(); toast(S.blackFriday ? "You're in! Your WELCOME10 code works after Black Friday" : "You're in! Use code WELCOME10 for 10% off"); });
  }

  let tt;
  function toast(msg) { const t = $(".toast"); $("span", t).textContent = msg; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2600); }

  /* ---------- Cart ---------- */
  let cart = store.get("pf_cart", []).filter(l => byId(l.id));
  let code = store.get("pf_code", "");
  const save = () => { store.set("pf_cart", cart); store.set("pf_code", code); updateCount(); };
  const updateCount = () => { const n = cart.reduce((a, l) => a + l.qty, 0); $$(".cart-count").forEach(x => x.textContent = n); };
  const unitPrice = l => byId(l.id).price + (l.custom && !l.custom.included ? S.customizationPrice : 0);

  function addToCart(id, size, qty, custom) {
    const key = id + "|" + size + "|" + (custom ? custom.name + "#" + custom.number + (custom.included ? "*" : "") : "");
    const ex = cart.find(l => l.key === key);
    if (ex) ex.qty += qty; else cart.push({ key, id, size, qty, custom });
    save(); toast(`Added size ${size} to cart`);
    $("#drawer").classList.add("open"); renderCart();
  }

  function totals() {
    const sub = cart.reduce((a, l) => a + unitPrice(l) * l.qty, 0);
    let bxgy = 0;
    if (S.buyXGetY) {
      const g = S.buyXGetY.buy + S.buyXGetY.free;
      const units = cart.flatMap(l => Array(l.qty).fill(unitPrice(l))).sort((a, b) => b - a);
      units.forEach((u, i) => { if ((i % g) >= S.buyXGetY.buy) bxgy += u; });
    }
    const pct = S.discountCodes[code] || 0;
    const eligible = cart.filter(l => !byId(l.id).compareAt).reduce((a, l) => a + unitPrice(l) * l.qty, 0);
    const codeOff = Math.min(eligible, sub - bxgy) * pct / 100;
    const after = sub - bxgy - codeOff;
    const ship = cart.length === 0 || after >= S.freeShippingThreshold ? 0 : S.shippingFee;
    return { sub, bxgy, codeOff, pct, eligible, ship, total: after + ship, after, units: cart.reduce((a, l) => a + l.qty, 0) };
  }

  function renderCart() {
    const d = $("#drawer"), t = totals();
    const left = S.freeShippingThreshold - t.after;
    $(".ship-bar", d).classList.toggle("done", left <= 0);
    $(".ship-bar .msg", d).innerHTML = left <= 0 ? "🎉 You've unlocked <b>FREE US shipping</b>" : `You're <b>${money(left)}</b> away from <b>FREE shipping</b>`;
    $(".ship-bar .fill", d).style.width = Math.min(100, t.after / S.freeShippingThreshold * 100) + "%";
    if (!cart.length) {
      $(".lines", d).innerHTML = `<div class="empty"><div style="width:90px;margin:0 auto 16px;opacity:.35">${jersey()}</div><b style="color:var(--ink);font-size:18px">Your cart is empty</b><p>Find your next kit.</p><a class="btn" href="collection.html?c=all">Shop All Jerseys</a></div>`;
      $(".sum", d).innerHTML = ""; return;
    }
    $(".lines", d).innerHTML = cart.map((l, i) => {
      const p = byId(l.id);
      const pr = l.custom ? `${esc(l.custom.name)} #${esc(l.custom.number)}${l.custom.included ? "" : ` (+${money(S.customizationPrice)})`}` : "No name / number";
      return `<div class="line"><a class="thumb" href="product.html?id=${p.id}">${media(p)}</a>
        <div><div class="t">${esc(p.name)}</div><div class="meta">Size: ${esc(l.size)} · ${pr}</div>
        <div class="qty"><button data-q="${i}" data-d="-1" aria-label="Less">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="More">+</button></div></div>
        <div><div class="lp">${money(unitPrice(l) * l.qty)}</div><button class="rm" data-rm="${i}">Remove</button></div></div>`;
    }).join("");
    const g = S.buyXGetY ? S.buyXGetY.buy + S.buyXGetY.free : 0;
    $(".sum", d).innerHTML = `
      ${S.buyXGetY && t.units % g === S.buyXGetY.buy ? `<div class="deal-box" style="margin:0 0 6px">${I.gift.replace("<svg", '<svg width="20" height="20"')} Add 1 more jersey — it's FREE!</div>` : S.buyXGetY && t.bxgy === 0 ? `<div style="font-size:13px;color:var(--muted)">Add ${g - (t.units % g)} more for <b>Buy ${S.buyXGetY.buy} Get ${S.buyXGetY.free} Free</b></div>` : ""}
      <div class="code"><input id="codeIn" placeholder="Discount code" value="${esc(code)}"><button id="codeBtn">Apply</button></div>
      <div class="code-msg">${code ? (t.pct && !t.eligible ? `<span style="color:var(--sale)">${esc(code)} can't be combined with Black Friday prices</span>` : t.pct ? `<span style="color:#0a7d3b">Code ${esc(code)} applied: ${t.pct}% off</span>` : `<span style="color:var(--sale)">Code not valid</span>`) : ""}</div>
      <div class="r"><span>Subtotal</span><span>${money(t.sub)}</span></div>
      ${t.bxgy ? `<div class="r disc"><span>Buy ${S.buyXGetY.buy} Get ${S.buyXGetY.free} Free</span><span>−${money(t.bxgy)}</span></div>` : ""}
      ${t.codeOff ? `<div class="r disc"><span>Code ${esc(code)}</span><span>−${money(t.codeOff)}</span></div>` : ""}
      <div class="r"><span>Shipping</span><span>${t.ship ? money(t.ship) : "FREE"}</span></div>
      <div class="r total"><span>Total</span><span>${money(t.total)}</span></div>
      <button class="btn accent block" id="checkoutBtn">${I.lock.replace("<svg", '<svg width="18" height="18"')} Secure Checkout</button>
      ${payBadges("center")}`;
  }

  document.addEventListener("click", e => {
    const q = e.target.closest("[data-q]");
    if (q) { const l = cart[+q.dataset.q]; l.qty += +q.dataset.d; if (l.qty < 1) cart.splice(+q.dataset.q, 1); save(); renderCart(); }
    const rm = e.target.closest("[data-rm]"); if (rm) { cart.splice(+rm.dataset.rm, 1); save(); renderCart(); }
    if (e.target.closest("#codeBtn")) { code = $("#codeIn").value.trim().toUpperCase(); save(); renderCart(); }
    if (e.target.closest("#checkoutBtn")) {
      if (S.checkoutUrl) location.href = S.checkoutUrl;
      else toast("Checkout gets connected (Shopify / Stripe) before launch");
    }
  });

  /* ---------- Product card ---------- */
  function card(p) {
    const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
    const im = imgs(p);
    return `<div class="card">
      <a class="media ${im.length ? "has-photo" : ""}" href="product.html?id=${p.id}">
        <div class="badges">${off ? `<span class="badge sale">-${off}%</span>` : ""}${p.badge ? `<span class="badge ${p.badge === "Best Seller" ? "hot" : ""}">${esc(p.badge)}</span>` : ""}</div>
        ${im.length ? photo(im[0], p.name, "a") + (im[1] ? photo(im[1], p.name + " back", "b") : "") : jersey(p.kit)}
      </a>
      <a class="info" href="product.html?id=${p.id}">
        <div class="meta-line">${esc(p.team || "")}${p.season ? " · " + esc(p.season) : ""}</div>
        <div class="name">${esc(p.name)}</div>
        ${p.print ? `<div class="print-line">${esc(printLabel(p.print))}</div>` : ""}
        ${stars(p)}
        <div class="price"><span class="now ${off ? "on-sale" : ""}">${money(p.price)}</span>${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ""}</div>
      </a>
      <div class="card-sizes" aria-label="Add to cart in size">${(isKids(p) ? SIZES.kids : SIZES.adult).map(s => `<button data-card-size="${s}" data-id="${p.id}" aria-label="Add size ${s} to cart">${s}</button>`).join("")}</div>
    </div>`;
  }
  const inCol = (p, id) => id === "all" ? true : id === "sale" ? !!p.compareAt
    : id === "classic" ? p.collections.some(c => c.startsWith("classic")) : p.collections.includes(id);
  const firstOf = id => P.find(p => inCol(p, id) && imgs(p).length) || P[0];

  /* ---------- Pages ---------- */
  function home() {
    const hk = $(".hero-kits");
    if (hk) {
      const pick = [P.find(p => p.team === "Real Madrid"), P.find(p => p.id.startsWith("brazil-home-2026")), P.find(p => p.team === "Portugal")].filter(Boolean);
      hk.innerHTML = pick.map((p, i) => `<a href="product.html?id=${p.id}" class="k k${i + 1}">${imgs(p).length ? photo(imgs(p)[imgs(p).length > 1 ? 1 : 0], p.name) : jersey(p.kit)}</a>`).join("");
    }

    const tiles = $("#tiles");
    if (tiles) {
      const order = ["national", "clubs", "classic-clubs", "classic-national"].filter(id => P.some(p => inCol(p, id)));
      tiles.innerHTML = order.map((id, i) => {
        const c = colById(id), p = firstOf(id), n = P.filter(x => inCol(x, id)).length;
        return `<a class="tile ${i === 0 ? "big" : ""}" href="collection.html?c=${id}">
          <div class="bg">${imgs(p).length ? photo(imgs(p)[0], c.name) : jersey(p.kit)}</div>
          <small>${esc(c.tag)} · ${n} kit${n === 1 ? "" : "s"}</small><h3>${esc(c.name)}</h3><span class="go">Shop now ${I.arrow}</span></a>`;
      }).join("");
    }

    const best = $("#best"), tabs = $("#bestTabs");
    if (best) {
      const groups = { best: "Best Sellers", new: "New Arrivals", national: "National Teams", clubs: "Club Kits", classic: "Classic" };
      tabs.innerHTML = Object.entries(groups).filter(([k]) => k === "best" || P.some(p => inCol(p, k))).map(([k, v], i) => `<button data-tab="${k}" class="${i ? "" : "on"}">${v}</button>`).join("");
      const show = k => {
        const list = k === "best" ? P.filter(p => p.badge === "Best Seller").concat(P.filter(p => p.badge !== "Best Seller")) : P.filter(p => inCol(p, k));
        best.innerHTML = list.slice(0, 8).map(card).join("");
      };
      tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $$("button", tabs).forEach(x => x.classList.toggle("on", x === b)); show(b.dataset.tab); });
      show("best");
    }
    const classic = $("#classic"); if (classic) classic.innerHTML = P.filter(p => inCol(p, "classic")).slice(0, 4).map(card).join("");

    const art = $("#promoArt");
    if (art) art.innerHTML = P.filter(p => imgs(p).length).slice(0, 3).map(p => photo(imgs(p)[0], p.name)).join("");
    const cnum = $("#customArt"); if (cnum) cnum.innerHTML = jersey({ primary: "#0b0b0b", secondary: "#c6ff3d" }, { number: "10" });

    const rv = $("#reviews");
    if (rv && REVIEWS.length) {
      const avg = REVIEWS.reduce((a, r) => a + r.stars, 0) / REVIEWS.length;
      $("#revScore").textContent = avg.toFixed(1); $("#revCount").textContent = `Based on ${REVIEWS.length} review${REVIEWS.length === 1 ? "" : "s"}`;
      rv.innerHTML = REVIEWS.map(r => `<div class="rev"><div class="stars">${starStr(r.stars)}</div><p>"${esc(r.text)}"</p><div class="who"><span><b>${esc(r.name)}</b> · ${esc(r.place)}</span></div></div>`).join("");
    } else if (rv) rv.closest("section").remove();
  }

  function collection() {
    const qs = new URLSearchParams(location.search);
    const q = (qs.get("q") || "").trim().toLowerCase();
    const cid = q ? "all" : (qs.get("c") || "all");
    const team = qs.get("t") || "";
    const virt = { all: { name: "All Jerseys", tag: "Every kit in the store" }, sale: { name: "Sale", tag: "Deals on every kit" }, classic: { name: "Classic Kits", tag: "Previous seasons & tournaments" } };
    const c = colById(cid) || virt[cid] || virt.all;
    document.title = `${q ? "Search" : c.name} — PitchFits`;
    $("#colTitle").textContent = q ? `"${qs.get("q")}"` : c.name;
    $("#colTag").textContent = q ? "Search results" : c.tag;
    $("#chips").innerHTML = [{ id: "all", name: "All" }, ...C.filter(x => x.id !== "new" && P.some(p => inCol(p, x.id))), { id: "sale", name: "Sale" }]
      .map(x => `<a href="collection.html?c=${x.id}" class="${x.id === cid && !q ? "on" : ""}">${esc(x.name)}</a>`).join("");
    const hay = p => [p.name, p.team, p.season, p.print && p.print.name, ...p.collections.map(id => (colById(id) || {}).name)].join(" ").toLowerCase();
    const inThis = P.filter(p => inCol(p, cid) && (!q || hay(p).includes(q)));
    const teams = [...new Set(inThis.map(p => p.team).filter(Boolean))].sort();
    $("#teams").innerHTML = teams.length > 1 ? [`<a href="collection.html?c=${cid}" class="${team ? "" : "on"}">All teams</a>`, ...teams.map(t => `<a href="collection.html?c=${cid}&t=${encodeURIComponent(t)}" class="${t === team ? "on" : ""}">${esc(t)}</a>`)].join("") : "";
    const base = inThis.filter(p => !team || p.team === team);
    const render = () => {
      const s = $("#sort").value, list = [...base];
      if (s === "low") list.sort((a, b) => a.price - b.price);
      if (s === "high") list.sort((a, b) => b.price - a.price);
      if (s === "team") list.sort((a, b) => (a.team || "").localeCompare(b.team || ""));
      $("#count").textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
      $("#colGrid").innerHTML = list.length ? list.map(card).join("") : `<p class="empty" style="grid-column:1/-1">No products found. <a href="collection.html?c=all" style="text-decoration:underline">See all jerseys</a></p>`;
    };
    $("#sort").addEventListener("change", render); render();
  }

  function product() {
    const p = byId(new URLSearchParams(location.search).get("id")) || P[0];
    document.title = `${p.name}${p.print ? " — " + printLabel(p.print) : ""} | PitchFits`;
    const col = colById(p.collections[0]) || C[0];
    const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
    const sizes = isKids(p) ? SIZES.kids : SIZES.adult;
    let size = null, qty = 1, mode = p.print ? "pictured" : "blank";
    const views = imgs(p).length ? imgs(p) : [null];
    const viewHtml = v => v ? `<img class="photo" src="${esc(v)}" alt="${esc(p.name)}">` : jersey(p.kit);
    const opt = (val, title, sub, price) => `<label class="print-opt"><input type="radio" name="print" value="${val}" ${mode === val ? "checked" : ""}><span><b>${title}</b>${sub ? `<small>${sub}</small>` : ""}</span><em>${price}</em></label>`;
    $("#crumbs").innerHTML = `<a href="index.html">Home</a> / <a href="collection.html?c=${col.id}">${esc(col.name)}</a> / ${esc(p.name)}`;
    $("#pdp").innerHTML = `
      <div class="gallery"><div class="main ${imgs(p).length ? "has-photo" : ""}"><div class="badges">${off ? `<span class="badge sale">-${off}%</span>` : ""}${p.badge ? `<span class="badge hot">${esc(p.badge)}</span>` : ""}</div><div id="mainView" style="display:contents">${viewHtml(views[0])}</div></div>
        ${views.length > 1 ? `<div class="thumbs">${views.map((v, i) => `<button data-view="${i}" class="${i ? "" : "on"}" aria-label="Photo ${i + 1}">${viewHtml(v)}</button>`).join("")}</div>` : ""}</div>
      <div class="pinfo">
        <div class="meta-line">${esc(p.team || "")}${p.season ? " · " + esc(p.season) : ""}</div>
        <h1 class="display">${esc(p.name)}</h1>
        ${stars(p)}
        <div class="price"><span class="now ${off ? "on-sale" : ""}">${money(p.price)}</span>${p.compareAt ? `<s>${money(p.compareAt)}</s> <span class="save-pill">SAVE ${money(p.compareAt - p.price)}</span>` : ""}</div>
        <div class="installments">Or 4 interest-free payments of <b>${money(p.price / 4)}</b> with ${esc(S.installmentProviders || "")}</div>
        <div class="opt"><label class="h"><span>Size: <span id="sizeLbl" style="color:var(--muted)">Select</span></span><a href="#sizeGuide" onclick="document.getElementById('sizeGuide').open=true">Size guide</a></label>
          <div class="sizes">${sizes.map(s => `<button data-size="${s}">${s}</button>`).join("")}</div></div>
        <div class="opt"><label class="h"><span>Name &amp; Number</span></label>
          <div class="print-opts">
            ${p.print ? opt("pictured", `As pictured: ${esc(printLabel(p.print))}`, "Exactly like the photos", "Included") : ""}
            ${opt("blank", "No name / number", "Clean jersey", p.print ? "Same price" : "")}
            ${opt("custom", "Custom name &amp; number", "Your name, your number", "+" + money(S.customizationPrice))}
          </div>
          <div class="custom-fields" id="custFields"><input id="cName" maxlength="12" placeholder="Name"><input id="cNum" maxlength="2" inputmode="numeric" placeholder="No."></div></div>
        <div class="buy-row"><div class="qty"><button data-pq="-1" aria-label="Less">−</button><span id="pq">1</span><button data-pq="1" aria-label="More">+</button></div>
          <button class="btn" id="addBtn">Add to Cart — <span id="btnPrice">${money(p.price)}</span></button></div>
        ${S.buyXGetY ? `<div class="deal-box">${I.gift.replace("<svg", '<svg width="22" height="22"')} BUY ${S.buyXGetY.buy} GET ${S.buyXGetY.free} FREE — mix &amp; match any jerseys</div>` : ""}
        <div class="perks">
          <div>${I.truck} Free US shipping on orders ${money(S.freeShippingThreshold)}+ · Delivered in ${S.deliveryDays} business days anywhere in the USA</div>
          <div>${I.back} 30-day hassle-free returns</div>
          <div>${I.lock} Secure checkout — SSL encrypted</div>
        </div>
        ${payBadges()}
        <div style="margin-top:22px">
          <details class="acc" open><summary>Details</summary><ul>${(p.details || []).map(d => `<li>${esc(d)}</li>`).join("")}<li>Lightweight, breathable performance fabric</li><li>Athletic fit — between sizes? Size up one</li><li>Machine wash cold, inside out — do not iron the print</li></ul></details>
          <details class="acc" id="sizeGuide"><summary>Size Guide</summary><table class="size-table"><tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th><th>Height</th></tr><tr><td>S</td><td>36–38</td><td>27</td><td>5'5"–5'8"</td></tr><tr><td>M</td><td>38–40</td><td>28</td><td>5'8"–5'11"</td></tr><tr><td>L</td><td>40–42</td><td>29</td><td>5'11"–6'1"</td></tr><tr><td>XL</td><td>42–45</td><td>30</td><td>6'1"–6'3"</td></tr><tr><td>2XL</td><td>45–48</td><td>31</td><td>6'3"–6'5"</td></tr><tr><td>3XL</td><td>48–51</td><td>32</td><td>6'5"+</td></tr></table></details>
          <details class="acc"><summary>Shipping &amp; Returns</summary><p>Every order is delivered in ${S.deliveryDays} business days anywhere in the USA, with tracking. Free shipping on orders over ${money(S.freeShippingThreshold)}. Returns accepted within 30 days for unworn items (custom name/number items are final sale). <a href="shipping.html" style="text-decoration:underline">Shipping</a> · <a href="returns.html" style="text-decoration:underline">Returns</a></p></details>
        </div>
      </div>`;
    const upd = () => {
      const each = p.price + (mode === "custom" ? S.customizationPrice : 0);
      $("#btnPrice").textContent = money(each * qty); $("#pq").textContent = qty;
      $("#custFields").classList.toggle("on", mode === "custom");
    };
    $("#pdp").addEventListener("change", e => { if (e.target.name === "print") { mode = e.target.value; upd(); } });
    $("#pdp").addEventListener("click", e => {
      const s = e.target.closest("[data-size]");
      if (s) { size = s.dataset.size; $$("[data-size]").forEach(b => b.classList.toggle("on", b === s)); $("#sizeLbl").textContent = size; $("#sizeLbl").style.color = "var(--ink)"; }
      const v = e.target.closest("[data-view]");
      if (v) { $$("[data-view]").forEach(b => b.classList.toggle("on", b === v)); $("#mainView").innerHTML = viewHtml(views[+v.dataset.view]); }
      const pq = e.target.closest("[data-pq]"); if (pq) { qty = Math.max(1, qty + +pq.dataset.pq); upd(); }
      if (e.target.closest("#addBtn")) {
        if (!size) { toast("Please select a size"); $(".sizes").animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], 300); return; }
        let custom = null;
        if (mode === "pictured") custom = { name: p.print.name, number: p.print.number, included: true };
        if (mode === "custom") {
          const n = $("#cName").value.trim().toUpperCase(), num = $("#cNum").value.trim();
          if (!n || !num) { toast("Enter a name and number"); return; }
          custom = { name: n, number: num };
        }
        addToCart(p.id, size, qty, custom);
      }
    });
    $("#cNum").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, ""); });
    upd();

    const rel = P.filter(x => x.id !== p.id && (x.team === p.team || x.collections.some(c => p.collections.includes(c))))
      .sort((a, b) => (b.team === p.team) - (a.team === p.team)).slice(0, 4);
    $("#related").innerHTML = (rel.length ? rel : P.filter(x => x.id !== p.id).slice(0, 4)).map(card).join("");
  }

  shell(); updateCount();
  const page = document.body.dataset.page;
  if (page === "home") home();
  if (page === "collection") collection();
  if (page === "product") product();
})();
