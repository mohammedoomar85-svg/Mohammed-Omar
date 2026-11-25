"""Builds the PitchFits help & company pages (about.html, contact.html, shipping.html, ...).
Edit the text below, then run:  python3 _src/pages.py   (from the pitchfits folder)."""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
UPDATED = "November 24, 2026"
EMAIL = "support@pitchfits.com"

HEAD = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<link rel="icon" href="assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="assets/styles.css">
<title>{title} — PitchFits</title>
<meta name="description" content="{desc}">
</head>
<body data-page="info">
"""

MENU = [
    ("Help", [("track", "Track Your Order"), ("shipping", "Shipping Policy"), ("returns", "Returns & Refunds"),
              ("size-guide", "Size Guide"), ("faq", "FAQ")]),
    ("Company", [("about", "About Us"), ("contact", "Contact Us"), ("privacy", "Privacy Policy"), ("terms", "Terms of Service")]),
]

PAGES = {}
def page(slug, title, tag, desc, body, legal=False):
    PAGES[slug] = dict(title=title, tag=tag, desc=desc, body=body, legal=legal)

# ---------------------------------------------------------------- ABOUT
page("about", "About Us", "Our Story", "PitchFits brings football jerseys to fans across the USA — national team, club and classic kits.", f"""
<p class="lead">PitchFits started with a simple idea: every fan in America should be able to wear the shirt of the team — and the player — they love, without paying $150 for it.</p>
<h2>Who we are</h2>
<p>We're football fans first. We grew up watching Ronaldinho at the Camp Nou, Neymar at Santos and the World Cup every four years. With the 2026 World Cup played across the United States, football has never been bigger here — and we built PitchFits so fans from Los Angeles to New York can rep their country, their club and their legends.</p>
<h2>What we sell</h2>
<div class="info-grid">
  <div><b>National Teams</b><p>The latest World Cup 2026 kits — Brazil, Portugal, England and more.</p></div>
  <div><b>Club Kits</b><p>Current-season shirts from the biggest clubs in world football.</p></div>
  <div><b>Classic Kits</b><p>Iconic shirts from past seasons and tournaments — the moments you remember.</p></div>
  <div><b>Name &amp; Number</b><p>Every jersey as pictured with the player's name and number, or with your own.</p></div>
</div>
<h2>Our promise</h2>
<ul class="checks">
  <li><b>Fast delivery:</b> every order arrives in 5–7 business days, anywhere in the USA, with tracking.</li>
  <li><b>Fair prices:</b> premium jerseys at prices that let you build a real collection.</li>
  <li><b>Easy returns:</b> not the right fit? You have 30 days to return or exchange.</li>
  <li><b>Real support:</b> real people answer every email within 24 hours, Monday to Saturday.</li>
  <li><b>Secure checkout:</b> pay with your card, PayPal, Venmo, Apple Pay, Google Pay, Shop Pay, Cash App Pay — or split it into 4 payments with Klarna, Afterpay or Affirm.</li>
</ul>
<h2>Join the squad</h2>
<p>Follow us on Instagram and TikTok for new drops and restocks, or sign up to our newsletter at the bottom of this page. Questions? <a href="contact.html">Get in touch</a> — we'd love to hear from you.</p>
""")

# ---------------------------------------------------------------- CONTACT
page("contact", "Contact Us", "We're Here To Help", "Contact PitchFits customer support. We reply within 24 hours, Monday to Saturday.", f"""
<p class="lead">Have a question about an order, sizing or a product? Our team replies to every message within 24 hours, Monday to Saturday.</p>
<div class="info-grid">
  <div><b>Email</b><p><a href="mailto:{EMAIL}">{EMAIL}</a></p></div>
  <div><b>Support hours</b><p>Monday – Saturday<br>9:00 AM – 6:00 PM (ET)</p></div>
  <div><b>Response time</b><p>Within 24 hours (business days)</p></div>
  <div><b>Social</b><p>Instagram &amp; TikTok: @pitchfits</p></div>
</div>
<h2>Send us a message</h2>
<form class="info-form" id="contactForm">
  <div class="row2"><input name="name" placeholder="Your name" required><input name="email" type="email" placeholder="Your email" required></div>
  <input name="order" placeholder="Order number (optional), e.g. #PF1001">
  <select name="topic" required>
    <option value="">What is it about?</option><option>Order status / tracking</option><option>Return or exchange</option>
    <option>Damaged or wrong item</option><option>Sizing question</option><option>Product question</option><option>Something else</option>
  </select>
  <textarea name="message" rows="5" placeholder="How can we help?" required></textarea>
  <button class="btn">Send Message</button>
  <small>This opens your email app with your message ready to send.</small>
</form>
<h2>Before you write</h2>
<p>Many answers are already in our <a href="faq.html">FAQ</a>, <a href="shipping.html">Shipping Policy</a> and <a href="returns.html">Returns &amp; Refunds</a> pages. If you're contacting us about an order, please include your order number so we can help faster.</p>
""")

# ---------------------------------------------------------------- TRACK
page("track", "Track Your Order", "Where's My Jersey?", "Track your PitchFits order. Delivery in 5–7 business days anywhere in the USA.", f"""
<p class="lead">As soon as your order ships, we email you a tracking number and a link to follow your package. Every order is delivered in <b>5–7 business days</b> anywhere in the USA.</p>
<h2>How to track</h2>
<ol class="steps">
  <li><b>Check your email.</b> Look for "Your PitchFits order is on the way" — it contains your tracking number. Check your spam or promotions folder too.</li>
  <li><b>Click the tracking link</b> in that email, or enter the tracking number on the carrier's website (USPS, UPS or FedEx).</li>
  <li><b>No email yet?</b> Send us your order number below and we'll reply with your tracking details.</li>
</ol>
<form class="info-form" id="trackForm">
  <div class="row2"><input name="order" placeholder="Order number, e.g. #PF1001" required><input name="email" type="email" placeholder="Email used at checkout" required></div>
  <button class="btn">Get My Tracking Info</button>
  <small>This opens your email app with your request ready to send. We reply within 24 hours.</small>
</form>
<h2>Tracking says delivered, but no package?</h2>
<p>Check around your property, mailbox, with neighbors and your building's front desk — carriers sometimes mark packages delivered up to 24 hours early. Still nothing after 48 hours? <a href="contact.html">Contact us</a> and we'll open a claim with the carrier.</p>
""")

# ---------------------------------------------------------------- SHIPPING
page("shipping", "Shipping Policy", "Delivered In 5–7 Days", "PitchFits ships to all 50 US states. Delivery in 5–7 business days. Free shipping on orders $75+.", f"""
<p class="lead">We ship to all 50 US states. Every order is delivered in <b>5–7 business days</b> with full tracking.</p>
<table class="info-table">
  <tr><th>Order total</th><th>Shipping cost</th><th>Delivery time</th></tr>
  <tr><td>Under $75</td><td>$6.99 flat rate</td><td>5–7 business days</td></tr>
  <tr><td>$75 and over</td><td><b>FREE</b></td><td>5–7 business days</td></tr>
</table>
<h2>Delivery times</h2>
<ul>
  <li>Delivery time includes order processing — no hidden extra days.</li>
  <li>Business days are Monday to Friday, excluding US federal holidays.</li>
  <li>During busy periods such as Black Friday and the holidays, a small number of orders may take 1–2 extra days. We'll email you if your order is affected.</li>
</ul>
<h2>Where we ship</h2>
<p>We ship to every address in the 50 US states, including PO boxes and APO/FPO/DPO military addresses. Orders to Alaska, Hawaii, Puerto Rico and military addresses may take a few extra days. We do not currently ship outside the United States.</p>
<h2>Order confirmation &amp; tracking</h2>
<p>You'll receive an order confirmation email right after checkout, and a shipping email with your tracking number as soon as your order leaves our warehouse. <a href="track.html">Track your order here</a>.</p>
<h2>Multiple items</h2>
<p>If you order several jerseys, they may arrive in separate packages on different days. Each package has its own tracking number.</p>
<h2>Wrong address</h2>
<p>Please double-check your shipping address at checkout. If you spot a mistake, email us within 12 hours of placing your order and we'll update it. We can't change the address once an order has shipped, and we're not responsible for orders delivered to an incorrect address entered at checkout.</p>
<h2>Lost or delayed packages</h2>
<p>If your order hasn't arrived within 10 business days, or tracking hasn't updated for 5 days, <a href="contact.html">contact us</a>. We'll investigate with the carrier and, if the package is lost, send a replacement or a full refund.</p>
<h2>Sales tax</h2>
<p>Sales tax is calculated at checkout based on your shipping address, as required by your state.</p>
""", legal=True)

# ---------------------------------------------------------------- RETURNS
page("returns", "Returns & Refunds", "30-Day Returns", "PitchFits returns and refund policy: 30 days to return unworn items for a refund or exchange.", f"""
<p class="lead">Not the right fit? You have <b>30 days from delivery</b> to return or exchange your jersey.</p>
<h2>What can be returned</h2>
<ul>
  <li>Items must be unworn, unwashed and in their original condition, with tags attached and in the original packaging.</li>
  <li>Jerseys sold "as pictured" with a player's name and number can be returned under these same conditions.</li>
</ul>
<h2>What can't be returned</h2>
<ul>
  <li><b>Custom name &amp; number jerseys</b> (your own name or number) are made for you and are final sale — unless they arrive damaged, defective or incorrect.</li>
  <li>Items that have been worn, washed, altered or damaged after delivery.</li>
  <li>Items returned more than 30 days after delivery.</li>
</ul>
<h2>How to start a return</h2>
<ol class="steps">
  <li>Email <a href="mailto:{EMAIL}">{EMAIL}</a> with your order number, the item(s) you want to return and the reason.</li>
  <li>We'll reply within 24 hours with your return address and instructions.</li>
  <li>Pack the item securely and ship it with a trackable service. Keep your tracking number.</li>
  <li>Once we receive and inspect your return, we'll email you to confirm your refund or exchange.</li>
</ol>
<p class="note">Please don't send items back without contacting us first — returns sent without approval can't be processed.</p>
<h2>Refunds</h2>
<ul>
  <li>Approved refunds are issued to your original payment method within 3–5 business days of inspection. Your bank or card provider may take 5–10 business days to show it.</li>
  <li>Orders paid with Klarna, Afterpay or Affirm are refunded through that provider, which adjusts your remaining payments.</li>
  <li>Original shipping costs are non-refundable. Return shipping is paid by the customer, unless the item arrived damaged, defective or incorrect.</li>
</ul>
<h2>Exchanges</h2>
<p>Need a different size? Follow the same steps and tell us the size you'd like. If it's in stock, we'll ship your new size as soon as your return is received. If it isn't, we'll refund you.</p>
<h2>Damaged, defective or wrong items</h2>
<p>We're sorry! Email us within <b>7 days of delivery</b> with your order number and photos of the item and label. We'll send a free replacement or a full refund — including shipping — and you won't pay for the return.</p>
<h2>Cancellations</h2>
<p>You can cancel your order within 12 hours of placing it by emailing us. After that, your order may already be on its way — you can still return it under this policy once it arrives.</p>
<h2>Sale items</h2>
<p>Jerseys bought at sale prices, including Black Friday, can be returned under this same policy and are refunded at the price you paid.</p>
""", legal=True)

# ---------------------------------------------------------------- SIZE GUIDE
page("size-guide", "Size Guide", "Find Your Fit", "PitchFits jersey size guide with chest, length and height measurements in inches.", f"""
<p class="lead">Our jerseys have an <b>athletic fit</b>, close to the body like the players wear them. Between two sizes, or prefer a relaxed fit? <b>Size up one.</b></p>
<h2>Adult jerseys (inches)</h2>
<table class="info-table">
  <tr><th>Size</th><th>Chest</th><th>Length</th><th>Height</th><th>Weight</th></tr>
  <tr><td>S</td><td>36–38</td><td>27</td><td>5'5" – 5'8"</td><td>120–145 lb</td></tr>
  <tr><td>M</td><td>38–40</td><td>28</td><td>5'8" – 5'11"</td><td>145–165 lb</td></tr>
  <tr><td>L</td><td>40–42</td><td>29</td><td>5'11" – 6'1"</td><td>165–185 lb</td></tr>
  <tr><td>XL</td><td>42–45</td><td>30</td><td>6'1" – 6'3"</td><td>185–210 lb</td></tr>
  <tr><td>2XL</td><td>45–48</td><td>31</td><td>6'3" – 6'5"</td><td>210–235 lb</td></tr>
  <tr><td>3XL</td><td>48–51</td><td>32</td><td>6'5"+</td><td>235–260 lb</td></tr>
</table>
<h2>How to measure</h2>
<div class="info-grid">
  <div><b>Chest</b><p>Measure around the fullest part of your chest, under your arms, keeping the tape level.</p></div>
  <div><b>Length</b><p>Measure from the highest point of the shoulder down to the bottom hem of the shirt.</p></div>
  <div><b>Best tip</b><p>Lay a T-shirt that fits you well flat, measure it, and compare with the table.</p></div>
</div>
<h2>Still not sure?</h2>
<p>Email us your height and weight and how you like your jerseys to fit — we'll recommend a size. And if it's not right, you can <a href="returns.html">exchange it within 30 days</a>.</p>
""")

# ---------------------------------------------------------------- FAQ
FAQ = [
 ("Orders & Shipping", [
  ("How long does delivery take?", "Every order is delivered in 5–7 business days anywhere in the USA, with tracking. See our <a href='shipping.html'>Shipping Policy</a>."),
  ("How much is shipping?", "Shipping is FREE on orders of $75 or more. Orders under $75 ship for a flat $6.99."),
  ("Do you ship outside the USA?", "Not at the moment — we ship to all 50 US states, including PO boxes and military addresses."),
  ("How do I track my order?", "You'll get an email with your tracking number as soon as your order ships. You can also visit our <a href='track.html'>Track Your Order</a> page."),
  ("Can I change or cancel my order?", "Yes, within 12 hours of placing it. Email us with your order number and the change you need."),
 ]),
 ("Products & Sizing", [
  ("How do the jerseys fit?", "They have an athletic fit, close to the body. If you're between sizes or like a relaxed fit, size up one. See our <a href='size-guide.html'>Size Guide</a>."),
  ("Does the jersey come with the name and number in the photos?", "Yes. Choose \"As pictured\" on the product page and you'll get the jersey exactly as shown, at no extra cost. You can also choose a blank jersey for the same price."),
  ("Can I put my own name and number on a jersey?", "Yes! Choose \"Custom name &amp; number\" on any product page for $9.99. Custom jerseys are final sale."),
  ("What's the difference between Club Kits and Classic Kits?", "Club Kits and National Teams are current kits. Classic Kits are shirts from previous seasons and past tournaments."),
  ("How do I wash my jersey?", "Turn it inside out, machine wash cold on a gentle cycle and hang to dry. Don't tumble dry, bleach or iron over the name, number or badges."),
 ]),
 ("Payments & Discounts", [
  ("Which payment methods do you accept?", "Visa, Mastercard, American Express, Discover, PayPal, Venmo, Apple Pay, Google Pay, Shop Pay and Cash App Pay."),
  ("Can I pay in installments?", "Yes. Split your order into 4 interest-free payments with Klarna, Afterpay or Affirm at checkout."),
  ("Is checkout secure?", "Yes. Payments are processed by PCI-compliant payment providers over an encrypted connection. We never see or store your full card number."),
  ("How does the Black Friday sale work?", "During Black Friday every jersey is $45 instead of $65 — no code needed, the price is already reduced."),
  ("Can I use WELCOME10 during Black Friday?", "WELCOME10 gives 10% off full-price jerseys. It can't be combined with Black Friday prices, which are already our lowest prices of the year."),
 ]),
 ("Returns", [
  ("What is your return policy?", "You can return unworn items in original condition within 30 days of delivery. See <a href='returns.html'>Returns &amp; Refunds</a>."),
  ("My item arrived damaged or wrong. What do I do?", "Email us within 7 days of delivery with your order number and photos. We'll send a free replacement or a full refund."),
  ("How long do refunds take?", "We issue approved refunds within 3–5 business days of receiving your return. Your bank may take 5–10 business days to show it."),
 ]),
]
faq_html = "<p class='lead'>Quick answers to the questions we hear most. Can't find yours? <a href='contact.html'>Contact us</a>.</p>"
for group, qs in FAQ:
    faq_html += f"<h2>{group}</h2>" + "".join(f"<details class='acc'><summary>{q}</summary><p>{a}</p></details>" for q, a in qs)
page("faq", "FAQ", "Frequently Asked Questions", "Answers about PitchFits shipping, sizing, payments, discounts and returns.", faq_html)

# ---------------------------------------------------------------- PRIVACY
page("privacy", "Privacy Policy", "Your Privacy Matters", "How PitchFits collects, uses and protects your personal information.", f"""
<p class="lead">This Privacy Policy explains what information PitchFits ("we", "us") collects when you visit PitchFits.com or place an order, how we use it, and the choices you have.</p>
<h2>1. Information we collect</h2>
<ul>
  <li><b>Information you give us:</b> your name, email, phone number, shipping and billing address, and order details when you check out, contact us or join our newsletter.</li>
  <li><b>Payment information:</b> payments are processed directly by our payment providers (such as Shopify Payments, Stripe, PayPal, Klarna, Afterpay and Affirm). We do not see or store your full card number.</li>
  <li><b>Automatic information:</b> device and browser type, IP address, pages viewed and how you reached our site, collected through cookies and similar technologies.</li>
</ul>
<h2>2. How we use your information</h2>
<ul>
  <li>To process, ship and deliver your orders, and send order and shipping updates.</li>
  <li>To answer your questions and handle returns, exchanges and refunds.</li>
  <li>To send marketing emails if you subscribed — you can unsubscribe at any time with one click.</li>
  <li>To prevent fraud and keep our website secure.</li>
  <li>To understand how our website is used and improve it.</li>
</ul>
<h2>3. How we share your information</h2>
<p>We do <b>not sell</b> your personal information. We share it only with service providers who help us run our store, and only as needed:</p>
<ul>
  <li>Payment processors, to take payments securely.</li>
  <li>Our fulfillment partners and shipping carriers (USPS, UPS, FedEx), to pack and deliver your order.</li>
  <li>Our e-commerce platform, email and analytics providers.</li>
  <li>Authorities, when required by law or to protect our rights.</li>
</ul>
<h2>4. Cookies</h2>
<p>We use cookies to keep items in your cart, remember your preferences and understand site traffic. You can block or delete cookies in your browser settings, but some features — like the cart — may not work properly.</p>
<h2>5. Your rights</h2>
<p>Depending on your state (including California, Virginia, Colorado, Connecticut and others), you may have the right to know what personal information we hold about you, to access or delete it, to correct it, and to opt out of targeted advertising. To make a request, email <a href="mailto:{EMAIL}">{EMAIL}</a>. We'll respond within 45 days and won't treat you differently for exercising your rights.</p>
<h2>6. Data retention &amp; security</h2>
<p>We keep order information as long as needed to fulfill your order and meet legal, tax and accounting requirements. We use industry-standard security, including encrypted (SSL) connections, to protect your information. No method of transmission over the internet is 100% secure, but we work hard to protect your data.</p>
<h2>7. Children</h2>
<p>Our website is not directed to children under 13, and we do not knowingly collect personal information from them. Jerseys for kids should be purchased by a parent or guardian.</p>
<h2>8. Changes to this policy</h2>
<p>We may update this policy from time to time. The "Last updated" date at the top shows when it was last changed.</p>
<h2>9. Contact</h2>
<p>Questions about your privacy? Email <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
""", legal=True)

# ---------------------------------------------------------------- TERMS
page("terms", "Terms of Service", "The Rules Of The Game", "Terms of Service for shopping at PitchFits.com.", f"""
<p class="lead">Welcome to PitchFits. By using PitchFits.com or placing an order, you agree to these Terms of Service. Please read them carefully.</p>
<h2>1. Eligibility</h2>
<p>You must be at least 18 years old, or use the site with the involvement of a parent or guardian, to place an order. We currently sell and deliver only to addresses in the United States.</p>
<h2>2. Products &amp; images</h2>
<p>We do our best to show our products accurately. Colors may look slightly different depending on your screen, and minor variations in badges, patches and fabric texture can occur between production batches. Jersey sizes and fit are described in our <a href="size-guide.html">Size Guide</a>.</p>
<h2>3. Prices &amp; promotions</h2>
<ul>
  <li>All prices are in US dollars. Sales tax is added at checkout where required.</li>
  <li>Prices, promotions and discount codes may change at any time without notice, but changes won't affect orders already confirmed.</li>
  <li>Discount codes can't be combined with other offers unless stated, have no cash value, and may be limited to one use per customer. WELCOME10 applies to full-price items only.</li>
  <li>If an item is listed at an incorrect price because of an error, we may cancel the order and refund you in full.</li>
</ul>
<h2>4. Orders &amp; payment</h2>
<p>Your order is an offer to buy. We accept it when we send your shipping confirmation. We may refuse or cancel any order — for example, if a product is out of stock, there is a pricing error, or we suspect fraud — and if we do, we'll refund any payment in full. Payments are handled by third-party providers under their own terms.</p>
<h2>5. Shipping, returns &amp; refunds</h2>
<p>Delivery is covered in our <a href="shipping.html">Shipping Policy</a> and returns in our <a href="returns.html">Returns &amp; Refunds</a> policy, which form part of these Terms. Risk of loss passes to you when your order is delivered to the carrier-confirmed address.</p>
<h2>6. Custom orders</h2>
<p>When you add a custom name and number, you're responsible for the spelling and number you enter. Custom jerseys are made for you and are final sale, except when they arrive damaged, defective or incorrect. We may refuse custom text that is offensive or infringes someone else's rights.</p>
<h2>7. Using our website</h2>
<p>You agree not to misuse the website — including attempting to hack, scrape or disrupt it, placing fraudulent orders, or buying products for unauthorized resale. The PitchFits name, logo, website design and content belong to PitchFits and may not be copied without permission. Team names, crests and player names belong to their respective owners.</p>
<h2>8. Disclaimers &amp; limitation of liability</h2>
<p>The website and products are provided "as is" to the fullest extent allowed by law. To the extent permitted by law, PitchFits is not liable for indirect, incidental or consequential damages, and our total liability for any claim related to an order is limited to the amount you paid for that order. Nothing in these Terms limits rights you have under consumer protection laws that cannot be waived.</p>
<h2>9. Disputes</h2>
<p>If you have a problem with an order, please contact us first at <a href="mailto:{EMAIL}">{EMAIL}</a> — most issues can be solved quickly. These Terms are governed by the laws of the United States and the state in which PitchFits is registered.</p>
<h2>10. Changes</h2>
<p>We may update these Terms from time to time. The version in effect when you place your order applies to that order.</p>
<h2>11. Contact</h2>
<p>Questions about these Terms? Email <a href="mailto:{EMAIL}">{EMAIL}</a>.</p>
""", legal=True)

FORMS_JS = """<script>
(function () {
  function mailto(form, subject, lines) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = new FormData(form), body = lines.map(function (k) { return k[0] + ': ' + (f.get(k[1]) || '-'); }).join('\\n');
      location.href = 'mailto:""" + EMAIL + """?subject=' + encodeURIComponent(subject(f)) + '&body=' + encodeURIComponent(body);
    });
  }
  var c = document.getElementById('contactForm');
  if (c) mailto(c, function (f) { return (f.get('topic') || 'Question') + (f.get('order') ? ' — ' + f.get('order') : ''); },
    [['Name', 'name'], ['Email', 'email'], ['Order', 'order'], ['Topic', 'topic'], ['Message', 'message']]);
  var t = document.getElementById('trackForm');
  if (t) mailto(t, function (f) { return 'Tracking request — ' + f.get('order'); }, [['Order', 'order'], ['Email', 'email']]);
})();
</script>"""

def render(slug, p):
    side = ""
    for group, items in MENU:
        side += f"<h4>{group}</h4>" + "".join(
            f'<a href="{s}.html" class="{"on" if s == slug else ""}">{t.replace("&", "&amp;")}</a>' for s, t in items)
    updated = f'<p class="updated">Last updated: {UPDATED}</p>' if p["legal"] else ""
    return (HEAD.format(title=p["title"].replace("&", "&amp;"), desc=p["desc"]) +
f"""<section class="col-hero"><div class="wrap"><p class="hero-tag">{p["tag"]}</p><h1 class="display">{p["title"].replace("&", "&amp;")}</h1>{updated}</div></section>
<div class="wrap info-layout">
  <aside class="info-side">{side}</aside>
  <article class="info-body">{p["body"]}</article>
</div>
<script src="assets/products.js"></script>
<script src="assets/app.js"></script>
{FORMS_JS if slug in ("contact", "track") else ""}
</body>
</html>
""")

for slug, p in PAGES.items():
    (ROOT / f"{slug}.html").write_text(render(slug, p))
    print("wrote", slug + ".html")
