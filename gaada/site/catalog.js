// Store catalog: what the page shows for each product.
// The price shown here is only a fallback: the page loads live prices from Supabase (gaada_products),
// and orders are always priced by the database. Add a product here AND in gaada_products with the same id.
//
// kind:  'digital'  → played in the browser, the buyer gets a code after paying
//        'physical' → delivered inside Kuwait
// draft: true      → hidden from the public store; visible with ?preview=1 for testing
// play:  path of the game page (digital only)
window.CATALOG = [
  {
    id: 'diwaniya',
    kind: 'digital',
    name: 'ديوانية مشربية الكوت',
    tagline: 'لعبة تخمين لفريقين على الشاشة الكبيرة',
    price: 2.5,
    oldPrice: 3.5,
    play: '/play/diwaniya/',
    players: '4 – 20',
    minutes: '30 – 60',
    tags: ['فرق', 'تخمين', 'ديوانية'],
    color: ['#0f4c5c', '#d9a441'],
    glyph: 'د',
    about:
      'افتحوها على التلفزيون أو اللابتوب وقسّموا أنفسكم فريقين. كل سؤال له عشر أجوبة من 100 إلى 1000 نقطة، ' +
      'وكل فريق يحاول يوصل لأصعب جواب قبل ما يخلص وقته.',
    features: [
      '17 فئة و30 سؤال جاهز في كل فئة',
      'مؤقت لكل دور ومؤقت لكل سؤال',
      'مميزات لكل فريق: سؤال الدبل، جاوب جوابين، باس، تلميح، إيقاف الوقت',
      'الحكم يدير اللعبة من جواله بباركود، والشاشة تتحدث مباشرة',
      'ما يتكرر السؤال على نفس الجهاز',
    ],
    howto: [
      'بعد الدفع يوصلك كود اللعبة على صفحة الطلب وعلى الواتساب.',
      'افتح رابط اللعبة على الشاشة الكبيرة وحط الكود.',
      'امسح باركود الحكم من الجوال وابدأوا.',
    ],
  },

  // Placeholders for physical games. Replace with your supplier's items, photos and prices,
  // then remove draft:true and set active=true for the same id in gaada_products.
  {
    id: 'sample-cards',
    kind: 'physical',
    draft: true,
    name: 'لعبة ورق (مثال)',
    tagline: 'مكان لعبة ورق من المورّد',
    price: 4,
    players: '2 – 6',
    minutes: '15',
    tags: ['ورق'],
    color: ['#7a2e3a', '#f0c987'],
    glyph: 'و',
    about: 'هذا منتج تجريبي لاختبار السلة والتوصيل. بدّله بلعبة حقيقية.',
    features: ['اكتب هنا محتوى العلبة', 'وعمر اللاعبين'],
  },
  {
    id: 'sample-board',
    kind: 'physical',
    draft: true,
    name: 'لعبة لوحية (مثال)',
    tagline: 'مكان لعبة لوحية من المورّد',
    price: 9,
    players: '2 – 4',
    minutes: '45',
    tags: ['لوحية'],
    color: ['#2f4a2a', '#e9d8a6'],
    glyph: 'ل',
    about: 'هذا منتج تجريبي لاختبار السلة والتوصيل. بدّله بلعبة حقيقية.',
    features: ['اكتب هنا محتوى العلبة', 'وعمر اللاعبين'],
  },
];
