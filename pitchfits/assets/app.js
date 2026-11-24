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
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };

  /* ---------- Jersey drawing (used when a product has no photo) ---------- */
  let uid = 0;
  const BODY = "M62 14 L84 6 Q100 22 116 6 L138 14 L188 42 L170 92 L148 82 L148 212 Q100 220 52 212 L52 82 L30 92 L12 42 Z";
  function jersey(kit, opts = {}) {
    const id = "j" + (++uid), a = kit.primary, b = kit.secondary;
    let pat = "";
    if (kit.pattern === "stripes") for (let x = 40; x < 200; x += 36) pat += `<rect x="${x}" y="0" width="16" height="230" fill="${b}"/>`;
    if (kit.pattern === "pinstripe") for (let x = 20; x < 200; x += 14) pat += `<rect x="${x}" y="0" width="2.5" height="230" fill="${b}" opacity=".85"/>`;
    if (kit.pattern === "hoops") for (let y = 40; y < 230; y += 34) pat += `<rect x="0" y="${y}" width="200" height="17" fill="${b}"/>`;
    if (kit.pattern === "half") pat = `<rect x="100" y="0" width="100" height="230" fill="${b}"/>`;
    if (kit.pattern === "sash") pat = `<path d="M30 40 L60 40 L190 200 L160 230 Z" fill="${b}"/>`;
    const trim = kit.pattern === "half" ? a : b;
    const num = opts.number ? `<text x="100" y="150" text-anchor="middle" font-family="Anton, Impact, sans-serif" font-size="56" fill="${trim}" stroke="${a}" stroke-width="5" paint-order="stroke">${esc(opts.number)}</text>` : "";
    return `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <defs>
        <clipPath id="${id}c"><path d="${BODY}"/></clipPath>
        <linearGradient id="${id}g" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".25" stop-color="#fff" stop-opacity=".08"/><stop offset=".6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient>
      </defs>
      <g clip-path="url(#${id}c)">
        <rect width="200" height="230" fill="${a}"/>${pat}
        <path d="M12 42 L30 92 L40 87 L22 37 Z M188 42 L170 92 L160 87 L178 37 Z" fill="${trim}"/>
        <path d="M84 6 Q100 22 116 6 L122 9 Q100 34 78 9 Z" fill="${trim}"/>
        <circle cx="124" cy="62" r="9" fill="${trim}" opacity=".9"/><circle cx="124" cy="62" r="5" fill="${a}" opacity=".9"/>
        <path d="M70 58 l6 8 l6 -8" stroke="${trim}" stroke-width="3" fill="none" opacity=".8"/>
        ${num}
        <rect width="200" height="230" fill="url(#${id}g)"/>
      </g>
      <path d="${BODY}" fill="none" stroke="rgba(0,0,0,.18)" stroke-width="1.5"/>
    </svg>`;
  }
  const media = (p, cls = "") => p.image ? `<img class="photo ${cls}" src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">` : jersey(p.kit);

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
    shirt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3 4 5 2 10l3 1v10h14V11l3-1-2-5-4-2a4 4 0 0 1-8 0Z"/></svg>',
    ig: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/></svg>',
    tt: '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 3c.3 2.3 1.7 3.8 4 4v3c-1.5 0-2.9-.4-4-1.2V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3h3Z"/></svg>'
  };
  const starStr = r => "★★★★★".slice(0, Math.round(r)) + "☆☆☆☆☆".slice(0, 5 - Math.round(r));

  /* ---------- Header / footer ---------- */
  function shell() {
    const top = C.filter(c => ["england", "spain", "italy", "germany", "france"].includes(c.id));
    const head = `
      <div class="announce">${S.announcements.map((t, i) => `<span class="${i ? "" : "on"}">${esc(t)}</span>`).join("")}</div>
      <header class="header">
        <div class="wrap">
          <button class="icon-btn menu-btn" data-open="mnav" aria-label="Menu">${I.menu}</button>
          <a href="index.html" class="logo">PITCH<b>FITS</b></a>
          <nav class="nav">
            <a href="collection.html?c=new">New</a>
            <div class="dd"><a href="collection.html?c=all">Clubs ▾</a>
              <div class="dd-menu">${top.map(c => `<a href="collection.html?c=${c.id}">${c.name}</a>`).join("")}</div></div>
            <a href="collection.html?c=national">National Teams</a>
            <a href="collection.html?c=retro">Retro</a>
            <a href="collection.html?c=kids">Kids</a>
            <a href="index.html#custom">Customize</a>
            <a href="collection.html?c=sale" class="sale">Sale</a>
          </nav>
          <div class="icons">
            <button class="icon-btn" data-toggle-search aria-label="Search">${I.search}</button>
            <a class="icon-btn" href="#" aria-label="Account">${I.user}</a>
            <button class="icon-btn" data-open="drawer" aria-label="Cart">${I.bag}<span class="cart-count">0</span></button>
          </div>
        </div>
        <div class="search-bar"><div class="wrap"><form action="collection.html"><input name="q" type="search" placeholder="Search teams, kits, retro..." autocomplete="off"></form></div></div>
      </header>
      <div class="mnav" id="mnav"><div class="shade" data-close></div><div class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><span class="logo">PITCH<b>FITS</b></span><button class="icon-btn" data-close aria-label="Close">${I.close}</button></div>
        <a href="collection.html?c=new">New Arrivals</a>${top.map(c => `<a href="collection.html?c=${c.id}">${c.name}</a>`).join("")}
        <a href="collection.html?c=national">National Teams</a><a href="collection.html?c=retro">Retro</a><a href="collection.html?c=kids">Kids</a>
        <a href="index.html#custom">Customize</a><a href="collection.html?c=sale" style="color:var(--sale)">Sale</a>
      </div></div>`;
    const foot = `
      <section class="news block"><div class="wrap">
        <h2 class="display">Get <em>10% Off</em> Your First Kit</h2>
        <p>Join the squad for drops, restocks and members-only deals.</p>
        <form id="newsForm"><input type="email" required placeholder="Enter your email"><button class="btn accent">Join Now</button></form>
      </div></section>
      <footer class="footer"><div class="wrap">
        <div class="cols">
          <div><div class="logo">PITCH<b>FITS</b></div><p>Premium football jerseys for fans across the USA. Club, national and retro kits, delivered to your door.</p>
            <div class="social"><a href="${S.instagram}" aria-label="Instagram">${I.ig}</a><a href="${S.tiktok}" aria-label="TikTok">${I.tt}</a></div></div>
          <div><h4>Shop</h4><a href="collection.html?c=new">New Arrivals</a><a href="collection.html?c=national">National Teams</a><a href="collection.html?c=retro">Retro Kits</a><a href="collection.html?c=kids">Kids</a><a href="collection.html?c=sale">Sale</a></div>
          <div><h4>Help</h4><a href="info.html#track">Track Order</a><a href="info.html#shipping">Shipping Policy</a><a href="info.html#returns">Returns &amp; Refunds</a><a href="info.html#sizes">Size Guide</a><a href="info.html#faq">FAQ</a></div>
          <div><h4>Company</h4><a href="info.html#about">About Us</a><a href="info.html#contact">Contact</a><a href="info.html#privacy">Privacy Policy</a><a href="info.html#terms">Terms of Service</a><a href="mailto:${S.email}">${S.email}</a></div>
        </div>
        <div class="bottom"><span>© ${new Date().getFullYear()} ${S.domain} — All rights reserved.</span>
          <div class="pay"><span>VISA</span><span>MASTERCARD</span><span>AMEX</span><span>PAYPAL</span><span>APPLE PAY</span><span>G PAY</span><span>KLARNA</span></div></div>
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

    // rotating announcement
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
      const add = e.target.closest("[data-quick-add]");
      if (add) { e.preventDefault(); const p = byId(add.dataset.quickAdd); addToCart(p.id, isKids(p) ? SIZES.kids[2] : "L", 1, null); }
    });
    document.addEventListener("keydown", e => { if (e.key === "Escape") $$(".drawer.open, .mnav.open").forEach(x => x.classList.remove("open")); });
    $("#newsForm").addEventListener("submit", e => { e.preventDefault(); e.target.reset(); toast("You're in! Use code PITCH10 for 10% off"); });
  }

  let tt;
  function toast(msg) { const t = $(".toast"); $("span", t).textContent = msg; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2600); }

  /* ---------- Cart ---------- */
  let cart = store.get("pf_cart", []);
  let code = store.get("pf_code", "");
  const save = () => { store.set("pf_cart", cart); store.set("pf_code", code); updateCount(); };
  const updateCount = () => { const n = cart.reduce((a, l) => a + l.qty, 0); $$(".cart-count").forEach(x => x.textContent = n); };
  const unitPrice = l => byId(l.id).price + (l.custom ? S.customizationPrice : 0);

  function addToCart(id, size, qty, custom) {
    const key = id + "|" + size + "|" + (custom ? custom.name + "#" + custom.number : "");
    const ex = cart.find(l => l.key === key);
    if (ex) ex.qty += qty; else cart.push({ key, id, size, qty, custom });
    save(); toast(byId(id).name.slice(0, 34) + (byId(id).name.length > 34 ? "…" : "") + " added");
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
    const codeOff = (sub - bxgy) * pct / 100;
    const after = sub - bxgy - codeOff;
    const ship = cart.length === 0 || after >= S.freeShippingThreshold ? 0 : S.shippingFee;
    return { sub, bxgy, codeOff, pct, ship, total: after + ship, after, units: cart.reduce((a, l) => a + l.qty, 0) };
  }

  function renderCart() {
    const d = $("#drawer"), t = totals();
    const left = S.freeShippingThreshold - t.after;
    $(".ship-bar", d).classList.toggle("done", left <= 0);
    $(".ship-bar .msg", d).innerHTML = left <= 0 ? "🎉 You've unlocked <b>FREE US shipping</b>" : `You're <b>${money(left)}</b> away from <b>FREE shipping</b>`;
    $(".ship-bar .fill", d).style.width = Math.min(100, t.after / S.freeShippingThreshold * 100) + "%";
    if (!cart.length) {
      $(".lines", d).innerHTML = `<div class="empty"><div style="width:90px;margin:0 auto 16px;opacity:.35">${jersey({ primary: "#ddd", secondary: "#bbb", pattern: "solid" })}</div><b style="color:var(--ink);font-size:18px">Your cart is empty</b><p>Find your next kit.</p><a class="btn" href="collection.html?c=all">Shop All Jerseys</a></div>`;
      $(".sum", d).innerHTML = ""; return;
    }
    $(".lines", d).innerHTML = cart.map((l, i) => {
      const p = byId(l.id);
      return `<div class="line"><a class="thumb" href="product.html?id=${p.id}">${media(p)}</a>
        <div><div class="t">${esc(p.name)}</div><div class="meta">Size: ${esc(l.size)}${l.custom ? ` · ${esc(l.custom.name)} #${esc(l.custom.number)}` : ""}</div>
        <div class="qty"><button data-q="${i}" data-d="-1" aria-label="Less">−</button><span>${l.qty}</span><button data-q="${i}" data-d="1" aria-label="More">+</button></div></div>
        <div><div class="lp">${money(unitPrice(l) * l.qty)}</div><button class="rm" data-rm="${i}">Remove</button></div></div>`;
    }).join("");
    const nextFree = S.buyXGetY ? (S.buyXGetY.buy + S.buyXGetY.free) - (t.units % (S.buyXGetY.buy + S.buyXGetY.free)) : 0;
    $(".sum", d).innerHTML = `
      ${S.buyXGetY && t.units % (S.buyXGetY.buy + S.buyXGetY.free) === S.buyXGetY.buy ? `<div class="deal-box" style="margin:0 0 6px">${I.gift.replace("<svg", '<svg width="20" height="20"')} Add 1 more item — it's FREE!</div>` : S.buyXGetY && t.bxgy === 0 ? `<div style="font-size:13px;color:var(--muted)">Add ${nextFree} more for <b>Buy ${S.buyXGetY.buy} Get ${S.buyXGetY.free} Free</b></div>` : ""}
      <div class="code"><input id="codeIn" placeholder="Discount code" value="${esc(code)}"><button id="codeBtn">Apply</button></div>
      <div class="code-msg">${code ? (t.pct ? `<span style="color:#0a7d3b">Code ${esc(code)} applied: ${t.pct}% off</span>` : `<span style="color:var(--sale)">Code not valid</span>`) : ""}</div>
      <div class="r"><span>Subtotal</span><span>${money(t.sub)}</span></div>
      ${t.bxgy ? `<div class="r disc"><span>Buy ${S.buyXGetY.buy} Get ${S.buyXGetY.free} Free</span><span>−${money(t.bxgy)}</span></div>` : ""}
      ${t.codeOff ? `<div class="r disc"><span>Code ${esc(code)}</span><span>−${money(t.codeOff)}</span></div>` : ""}
      <div class="r"><span>Shipping</span><span>${t.ship ? money(t.ship) : "FREE"}</span></div>
      <div class="r total"><span>Total</span><span>${money(t.total)}</span></div>
      <button class="btn accent block" id="checkoutBtn">${I.lock.replace("<svg", '<svg width="18" height="18"')} Secure Checkout</button>
      <div class="pay" style="justify-content:center"><span style="background:var(--mist)">VISA</span><span style="background:var(--mist)">MC</span><span style="background:var(--mist)">AMEX</span><span style="background:var(--mist)">PAYPAL</span><span style="background:var(--mist)">APPLE PAY</span></div>`;
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
    return `<div class="card">
      <a class="media" href="product.html?id=${p.id}">
        <div class="badges">${off ? `<span class="badge sale">-${off}%</span>` : ""}${p.badge ? `<span class="badge ${p.badge === "Best Seller" ? "hot" : ""}">${esc(p.badge)}</span>` : ""}</div>
        ${media(p)}
        <button class="btn quick" data-quick-add="${p.id}">Quick Add +</button>
      </a>
      <a class="info" href="product.html?id=${p.id}">
        <div class="name">${esc(p.name)}</div>
        <div class="stars">${starStr(p.rating)}<small>(${p.reviews})</small></div>
        <div class="price"><span class="now ${off ? "on-sale" : ""}">${money(p.price)}</span>${p.compareAt ? `<s>${money(p.compareAt)}</s>` : ""}</div>
      </a></div>`;
  }
  const inCol = (p, id) => id === "all" ? true : id === "sale" ? !!p.compareAt : p.collections.includes(id);

  /* ---------- Pages ---------- */
  function home() {
    // hero jerseys: first three products
    const hk = $(".hero-kits");
    if (hk) hk.innerHTML = [P[0], P[9], P[3]].map((p, i) => `<div class="k k${i + 1}">${p.image ? media(p) : jersey(p.kit, { number: ["7", "10", "9"][i] })}</div>`).join("");

    const tiles = $("#tiles");
    if (tiles) {
      const order = ["national", "retro", "england", "spain", "italy", "germany", "france", "kids", "new"];
      tiles.innerHTML = order.slice(0, 7).map((id, i) => {
        const c = colById(id), p = P.find(x => x.collections.includes(id)) || P[0];
        return `<a class="tile ${i === 0 ? "big" : ""}" href="collection.html?c=${id}">
          <div class="bg" style="background:${c.colors[0] === "#ffffff" || c.colors[0] === "#f2e8d5" ? "#1c1c1c" : c.colors[0]}">${jersey(p.kit)}</div>
          <small>${esc(c.tag)}</small><h3>${esc(c.name)}</h3><span class="go">Shop now ${I.arrow}</span></a>`;
      }).join("");
    }

    const best = $("#best"), tabs = $("#bestTabs");
    if (best) {
      const groups = { best: "Best Sellers", new: "New Arrivals", national: "National Teams", sale: "On Sale" };
      tabs.innerHTML = Object.entries(groups).map(([k, v], i) => `<button data-tab="${k}" class="${i ? "" : "on"}">${v}</button>`).join("");
      const show = k => {
        const list = k === "best" ? P.filter(p => p.badge === "Best Seller").concat(P.filter(p => p.badge !== "Best Seller")) : P.filter(p => inCol(p, k));
        best.innerHTML = list.slice(0, 8).map(card).join("");
      };
      tabs.addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $$("button", tabs).forEach(x => x.classList.toggle("on", x === b)); show(b.dataset.tab); });
      show("best");
    }
    const retro = $("#retro"); if (retro) retro.innerHTML = P.filter(p => p.collections.includes("retro")).slice(0, 4).map(card).join("");

    const art = $("#promoArt"); if (art) art.innerHTML = [P[1], P[10], P[13]].map(p => jersey(p.kit)).join("");
    const cnum = $("#customArt"); if (cnum) cnum.innerHTML = jersey({ primary: "#0b0b0b", secondary: "#c6ff3d", pattern: "solid" }, { number: "10" });

    const rv = $("#reviews");
    if (rv) rv.innerHTML = REVIEWS.map(r => `<div class="rev"><div class="stars">${starStr(r.stars)}</div><p>"${esc(r.text)}"</p><div class="who"><span><b>${esc(r.name)}</b> · ${esc(r.place)}</span><span class="verified">✓ Verified</span></div></div>`).join("");
  }

  function collection() {
    const qs = new URLSearchParams(location.search);
    const q = (qs.get("q") || "").trim().toLowerCase();
    const cid = q ? "all" : (qs.get("c") || "all");
    const c = colById(cid) || { name: cid === "sale" ? "Sale" : "All Jerseys", tag: cid === "sale" ? "Up to 50% off" : "Every kit in the store" };
    document.title = `${q ? "Search" : c.name} — PitchFits`;
    $("#colTitle").textContent = q ? `"${qs.get("q")}"` : c.name;
    $("#colTag").textContent = q ? "Search results" : c.tag;
    $("#chips").innerHTML = [{ id: "all", name: "All" }, ...C, { id: "sale", name: "Sale" }].map(x => `<a href="collection.html?c=${x.id}" class="${x.id === cid && !q ? "on" : ""}">${esc(x.name)}</a>`).join("");
    const base = P.filter(p => inCol(p, cid) && (!q || p.name.toLowerCase().includes(q) || p.collections.some(id => (colById(id) || {}).name?.toLowerCase().includes(q))));
    const render = () => {
      const s = $("#sort").value, list = [...base];
      if (s === "low") list.sort((a, b) => a.price - b.price);
      if (s === "high") list.sort((a, b) => b.price - a.price);
      if (s === "rating") list.sort((a, b) => b.reviews - a.reviews);
      $("#count").textContent = `${list.length} product${list.length === 1 ? "" : "s"}`;
      $("#colGrid").innerHTML = list.length ? list.map(card).join("") : `<p class="empty" style="grid-column:1/-1">No products found. <a href="collection.html?c=all" style="text-decoration:underline">See all jerseys</a></p>`;
    };
    $("#sort").addEventListener("change", render); render();
  }

  function product() {
    const p = byId(new URLSearchParams(location.search).get("id")) || P[0];
    document.title = `${p.name} — PitchFits`;
    const col = colById(p.collections[p.collections.length - 1]) || C[0];
    const off = p.compareAt ? Math.round((1 - p.price / p.compareAt) * 100) : 0;
    const sizes = isKids(p) ? SIZES.kids : SIZES.adult;
    let size = null, qty = 1;
    const views = p.image ? (p.images || [p.image]) : [null, "7", "10", "23"];
    const viewHtml = v => p.image ? `<img class="photo" src="${esc(v)}" alt="${esc(p.name)}">` : jersey(p.kit, v ? { number: v } : {});
    $("#crumbs").innerHTML = `<a href="index.html">Home</a> / <a href="collection.html?c=${col.id}">${esc(col.name)}</a> / ${esc(p.name)}`;
    $("#pdp").innerHTML = `
      <div class="gallery"><div class="main"><div class="badges">${off ? `<span class="badge sale">-${off}%</span>` : ""}${p.badge ? `<span class="badge hot">${esc(p.badge)}</span>` : ""}</div><div id="mainView" style="display:contents">${viewHtml(views[0])}</div></div>
        <div class="thumbs">${views.map((v, i) => `<button data-view="${i}" class="${i ? "" : "on"}" aria-label="View ${i + 1}">${viewHtml(v)}</button>`).join("")}</div></div>
      <div class="pinfo">
        <div class="stars">${starStr(p.rating)}<small>${p.rating} · ${p.reviews} reviews</small></div>
        <h1 class="display">${esc(p.name)}</h1>
        <div class="price"><span class="now ${off ? "on-sale" : ""}">${money(p.price)}</span>${p.compareAt ? `<s>${money(p.compareAt)}</s> <span class="save-pill">SAVE ${money(p.compareAt - p.price)}</span>` : ""}</div>
        <div style="font-size:13px;color:var(--muted)">Or 4 interest-free payments of ${money(p.price / 4)} with Klarna</div>
        <div class="opt"><label class="h"><span>Size: <span id="sizeLbl" style="color:var(--muted)">Select</span></span><a href="#sizeGuide" onclick="document.getElementById('sizeGuide').open=true">Size guide</a></label>
          <div class="sizes">${sizes.map(s => `<button data-size="${s}">${s}</button>`).join("")}</div></div>
        <div class="opt"><label class="toggle"><input type="checkbox" id="cust"> Add name &amp; number <span style="margin-left:auto;font-weight:800">+${money(S.customizationPrice)}</span></label>
          <div class="custom-fields" id="custFields"><input id="cName" maxlength="12" placeholder="Name"><input id="cNum" maxlength="2" inputmode="numeric" placeholder="No."></div></div>
        <div class="buy-row"><div class="qty"><button data-pq="-1" aria-label="Less">−</button><span id="pq">1</span><button data-pq="1" aria-label="More">+</button></div>
          <button class="btn" id="addBtn">Add to Cart — <span id="btnPrice">${money(p.price)}</span></button></div>
        ${S.buyXGetY ? `<div class="deal-box">${I.gift.replace("<svg", '<svg width="22" height="22"')} BUY ${S.buyXGetY.buy} GET ${S.buyXGetY.free} FREE — mix &amp; match any kits</div>` : ""}
        <div class="perks">
          <div>${I.truck} Free US shipping on orders ${money(S.freeShippingThreshold)}+ · Delivery in 7–14 business days</div>
          <div>${I.back} 30-day hassle-free returns</div>
          <div>${I.lock} Secure checkout — SSL encrypted</div>
        </div>
        <div style="margin-top:22px">
          <details class="acc" open><summary>Details</summary><ul><li>Fan version — breathable, lightweight polyester</li><li>Embroidered crest and brand details</li><li>Regular fit, true to size</li><li>Machine wash cold, inside out</li></ul></details>
          <details class="acc" id="sizeGuide"><summary>Size Guide</summary>${isKids(p)
            ? `<table class="size-table"><tr><th>Size</th><th>Height (in)</th><th>Chest (in)</th></tr><tr><td>4-5Y</td><td>41–45</td><td>22</td></tr><tr><td>6-7Y</td><td>45–50</td><td>24</td></tr><tr><td>8-9Y</td><td>50–54</td><td>26</td></tr><tr><td>10-11Y</td><td>54–58</td><td>28</td></tr><tr><td>12-13Y</td><td>58–62</td><td>30</td></tr></table>`
            : `<table class="size-table"><tr><th>Size</th><th>Chest (in)</th><th>Length (in)</th><th>Height</th></tr><tr><td>S</td><td>36–38</td><td>27</td><td>5'5"–5'8"</td></tr><tr><td>M</td><td>38–40</td><td>28</td><td>5'8"–5'11"</td></tr><tr><td>L</td><td>40–42</td><td>29</td><td>5'11"–6'1"</td></tr><tr><td>XL</td><td>42–45</td><td>30</td><td>6'1"–6'3"</td></tr><tr><td>2XL</td><td>45–48</td><td>31</td><td>6'3"–6'5"</td></tr><tr><td>3XL</td><td>48–51</td><td>32</td><td>6'5"+</td></tr></table>`}</details>
          <details class="acc"><summary>Shipping &amp; Returns</summary><p>Orders are processed in 1–3 business days and delivered in 7–14 business days across the USA with tracking. Free shipping on orders over ${money(S.freeShippingThreshold)}. Returns accepted within 30 days for unworn items (custom name/number items are final sale).</p></details>
        </div>
      </div>`;
    const upd = () => {
      const each = p.price + ($("#cust").checked ? S.customizationPrice : 0);
      $("#btnPrice").textContent = money(each * qty); $("#pq").textContent = qty;
      if (!p.image) $("#mainView").innerHTML = jersey(p.kit, $("#cust").checked && $("#cNum").value ? { number: $("#cNum").value } : {});
    };
    $("#pdp").addEventListener("click", e => {
      const s = e.target.closest("[data-size]");
      if (s) { size = s.dataset.size; $$("[data-size]").forEach(b => b.classList.toggle("on", b === s)); $("#sizeLbl").textContent = size; $("#sizeLbl").style.color = "var(--ink)"; }
      const v = e.target.closest("[data-view]");
      if (v) { $$("[data-view]").forEach(b => b.classList.toggle("on", b === v)); $("#mainView").innerHTML = viewHtml(views[+v.dataset.view]); }
      const pq = e.target.closest("[data-pq]"); if (pq) { qty = Math.max(1, qty + +pq.dataset.pq); upd(); }
      if (e.target.closest("#addBtn")) {
        if (!size) { toast("Please select a size"); $(".sizes").animate([{ transform: "translateX(0)" }, { transform: "translateX(-6px)" }, { transform: "translateX(6px)" }, { transform: "translateX(0)" }], 300); return; }
        let custom = null;
        if ($("#cust").checked) {
          const n = $("#cName").value.trim().toUpperCase(), num = $("#cNum").value.trim();
          if (!n || !num) { toast("Enter a name and number"); return; }
          custom = { name: n, number: num };
        }
        addToCart(p.id, size, qty, custom);
      }
    });
    $("#cust").addEventListener("change", e => { $("#custFields").classList.toggle("on", e.target.checked); upd(); });
    $("#cNum").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, ""); upd(); });

    const rel = P.filter(x => x.id !== p.id && x.collections.some(c => p.collections.includes(c))).slice(0, 4);
    $("#related").innerHTML = (rel.length ? rel : P.slice(0, 4)).map(card).join("");
  }

  shell(); updateCount();
  const page = document.body.dataset.page;
  if (page === "home") home();
  if (page === "collection") collection();
  if (page === "product") product();
})();
