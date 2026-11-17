// مشربية الكوت — كل المحتوى يجي مباشرة من TMDB، فالموقع يتحدث تلقائياً بأحدث الأفلام والمسلسلات.
(() => {
  const CFG = Object.assign({ TMDB_KEY: '', REGION: 'SA', REFRESH_MINUTES: 30, NEW_DAYS: 21 }, window.CINEMA_CONFIG || {});
  const API = 'https://api.themoviedb.org/3';
  const IMG = 'https://image.tmdb.org/t/p/';
  const LS = {
    get(k, d) { try { const v = localStorage.getItem('cinema.' + k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem('cinema.' + k, JSON.stringify(v)); } catch {} },
  };
  const $ = (s, el = document) => el.querySelector(s);
  const main = $('#main');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const today = () => new Date().toISOString().slice(0, 10);
  const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
  const daysAhead = (n) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
  const year = (d) => (d ? d.slice(0, 4) : '');
  const isNew = (d) => d && d <= today() && d >= daysAgo(CFG.NEW_DAYS);
  const fmtDate = (d) => { try { return new Date(d).toLocaleDateString('ar', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return d; } };

  let key = LS.get('key', '') || CFG.TMDB_KEY;
  let region = LS.get('region', '') || CFG.REGION;

  // ---------- API ----------
  const cache = new Map();
  async function tmdb(path, params = {}, { fresh = false, k = key } = {}) {
    const q = new URLSearchParams({ language: 'ar', include_adult: 'false', ...params });
    const headers = { accept: 'application/json' };
    if (k.startsWith('eyJ')) headers.Authorization = 'Bearer ' + k; else q.set('api_key', k);
    const url = `${API}${path}?${q}`;
    const hit = cache.get(url);
    if (!fresh && hit && Date.now() - hit.t < CFG.REFRESH_MINUTES * 6e4) return hit.p;
    const p = fetch(url, { headers }).then(async (r) => {
      if (!r.ok) { const e = new Error('TMDB ' + r.status); e.status = r.status; throw e; }
      return r.json();
    });
    cache.set(url, { t: Date.now(), p });
    p.catch(() => cache.delete(url));
    return p;
  }

  // ---------- الأقسام ----------
  // كل قسم له طرق ترتيب، وكل طريقة = طلب discover من TMDB بتاريخ اليوم، فالمحتوى دايماً محدث.
  const SECTIONS = {
    'movies-foreign': {
      title: 'أفلام أجنبية', type: 'movie',
      sorts: {
        latest: ['الأحدث', () => ({ sort_by: 'primary_release_date.desc', 'primary_release_date.lte': today(), 'vote_count.gte': 40 })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 1500 })],
        soon: ['قريباً', () => ({ sort_by: 'popularity.desc', 'primary_release_date.gte': daysAhead(1), 'primary_release_date.lte': daysAhead(120) })],
      },
    },
    'movies-arabic': {
      title: 'أفلام عربية', type: 'movie', filter: { with_original_language: 'ar' },
      sorts: {
        latest: ['الأحدث', () => ({ sort_by: 'primary_release_date.desc', 'primary_release_date.lte': today(), 'vote_count.gte': 1 })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 40 })],
      },
    },
    'tv-foreign': {
      title: 'مسلسلات أجنبية', type: 'tv',
      sorts: {
        airing: ['تُعرض الآن', () => ({ sort_by: 'popularity.desc', 'air_date.gte': daysAgo(10), 'air_date.lte': daysAhead(7), 'vote_count.gte': 20 })],
        latest: ['مسلسلات جديدة', () => ({ sort_by: 'first_air_date.desc', 'first_air_date.lte': today(), 'vote_count.gte': 20 })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 1000 })],
      },
    },
    'tv-arabic': {
      title: 'مسلسلات عربية', type: 'tv', filter: { with_original_language: 'ar' },
      sorts: {
        airing: ['تُعرض الآن', () => ({ sort_by: 'popularity.desc', 'air_date.gte': daysAgo(14), 'air_date.lte': daysAhead(7) })],
        latest: ['مسلسلات جديدة', () => ({ sort_by: 'first_air_date.desc', 'first_air_date.lte': today() })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 20 })],
      },
    },

    'movies-indian': {
      title: 'أفلام هندية', type: 'movie', filter: { with_origin_country: 'IN' },
      sorts: {
        latest: ['الأحدث', () => ({ sort_by: 'primary_release_date.desc', 'primary_release_date.lte': today(), 'vote_count.gte': 5 })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 150 })],
        soon: ['قريباً', () => ({ sort_by: 'popularity.desc', 'primary_release_date.gte': daysAhead(1), 'primary_release_date.lte': daysAhead(120) })],
      },
    },
    'movies-turkish': {
      title: 'أفلام تركية', type: 'movie', filter: { with_original_language: 'tr' },
      sorts: {
        latest: ['الأحدث', () => ({ sort_by: 'primary_release_date.desc', 'primary_release_date.lte': today(), 'vote_count.gte': 3 })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 50 })],
      },
    },
    'anime': {
      title: 'أنمي', type: 'tv', filter: { with_original_language: 'ja', with_genres: '16' },
      sorts: {
        airing: ['يُعرض الآن', () => ({ sort_by: 'popularity.desc', 'air_date.gte': daysAgo(10), 'air_date.lte': daysAhead(7) })],
        latest: ['أنمي جديد', () => ({ sort_by: 'first_air_date.desc', 'first_air_date.lte': today(), 'vote_count.gte': 5 })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 300 })],
        movies: ['أفلام أنمي', () => ({ sort_by: 'popularity.desc' }), 'movie'],
      },
    },
  };

  async function discover(id, sortKey, page = 1, genre = '') {
    const s = SECTIONS[id];
    const type = s.sorts[sortKey][2] || s.type;
    const params = { ...(s.filter || {}), ...s.sorts[sortKey][1](), page };
    // التصنيف المختار يضاف لتصنيف القسم (مثلاً أنمي + أكشن)
    if (genre) params.with_genres = params.with_genres ? `${params.with_genres},${genre}` : genre;
    const data = await tmdb(`/discover/${type}`, params);
    let results = data.results.map((r) => ({ ...r, media_type: type }));
    if (!s.filter) results = results.filter((r) => r.original_language !== 'ar');
    if (s.filter && sortKey === 'latest') results = results.filter((r) => r.poster_path);
    return { results, totalPages: Math.min(data.total_pages || 1, 500) };
  }

  const genreCache = {};
  async function genres(type) {
    if (!genreCache[type]) genreCache[type] = tmdb(`/genre/${type}/list`).then((d) => d.genres).catch(() => []);
    return genreCache[type];
  }

  // ---------- عناصر العرض ----------
  const titleOf = (it) => it.title || it.name || it.original_title || it.original_name || '';
  const dateOf = (it) => it.release_date || it.first_air_date || '';
  const typeOf = (it) => it.media_type || (it.title !== undefined ? 'movie' : 'tv');

  function card(it) {
    const t = titleOf(it), d = dateOf(it), type = typeOf(it);
    const poster = it.poster_path ? `<img loading="lazy" src="${IMG}w342${it.poster_path}" alt="">` : `<div class="noimg">${esc(t)}</div>`;
    const badges = (it._badge ? `<span class="badge">${esc(it._badge)}</span>` : isNew(d) ? '<span class="badge">جديد</span>' : '')
      + (it.vote_average ? `<span class="badge rate">★ ${it.vote_average.toFixed(1)}</span>` : '');
    return `<button class="card" data-id="${it.id}" data-type="${type}">
      <div class="poster">${poster}${badges}</div>
      <div class="t" title="${esc(t)}">${esc(t)}</div>
      <div class="s"><span>${type === 'tv' ? 'مسلسل' : 'فيلم'}</span><span>${year(d)}</span></div>
    </button>`;
  }
  const skeleton = (n = 8) => Array.from({ length: n }, () => '<div class="card skeleton"><div class="poster"></div></div>').join('');

  function row(title, items, link) {
    if (!items.length) return '';
    return `<section class="section"><div class="section-head"><h2>${esc(title)}</h2>${link ? `<a href="#${link}">عرض الكل ←</a>` : ''}</div>
      <div class="row-wrap"><button class="arrow prev" data-scroll="-1" aria-label="السابق">‹</button>
      <div class="row-scroll">${items.map(card).join('')}</div>
      <button class="arrow next" data-scroll="1" aria-label="التالي">›</button></div></section>`;
  }

  function hero(it) {
    const type = typeOf(it), d = dateOf(it);
    return `<section class="hero" style="background-image:url('${IMG}w1280${it.backdrop_path}')">
      <div class="hero-in">
        <div class="meta"><span>${type === 'tv' ? 'مسلسل' : 'فيلم'}</span><span>${year(d)}</span>${it.vote_average ? `<span class="star">★ ${it.vote_average.toFixed(1)}</span>` : ''}${isNew(d) ? '<span class="badge" style="position:static">جديد</span>' : ''}</div>
        <h1>${esc(titleOf(it))}</h1>
        <p>${esc(it.overview || '')}</p>
        <div class="btns"><button class="btn primary" data-open="${it.id}" data-type="${type}" data-trailer="1">▶ الإعلان</button>
        <button class="btn" data-open="${it.id}" data-type="${type}">ⓘ مزيد من المعلومات</button>
        <button class="btn" data-add="${it.id}" data-type="${type}">${inList(it.id, type) ? '✓ في قائمتي' : '+ قائمتي'}</button></div>
      </div></section>`;
  }

  // ---------- الصفحات ----------
  let renderToken = 0;
  async function showHome() {
    const tok = ++renderToken;
    main.innerHTML = `<section class="hero"></section>${['', '', ''].map(() => `<section class="section"><div class="row-scroll">${skeleton()}</div></section>`).join('')}`;
    const safe = (p) => p.catch(() => ({ results: [] }));
    const [trend, mf, ma, tf, ta, soon, mi, mt, an, free] = await Promise.all([
      safe(tmdb('/trending/all/day')),
      safe(discover('movies-foreign', 'latest')),
      safe(discover('movies-arabic', 'latest')),
      safe(discover('tv-foreign', 'airing')),
      safe(discover('tv-arabic', 'airing')),
      safe(discover('movies-foreign', 'soon')),
      safe(discover('movies-indian', 'latest')),
      safe(discover('movies-turkish', 'latest')),
      safe(discover('anime', 'airing')),
      iaSearch(FREE.movies[1], 'downloads desc', 1, 20).catch(() => ({ docs: [] })),
    ]);
    if (tok !== renderToken) return;
    const trending = trend.results.filter((r) => r.media_type === 'movie' || r.media_type === 'tv');
    const pick = trending.find((r) => r.backdrop_path && r.overview) || trending.find((r) => r.backdrop_path);
    main.innerHTML = (pick ? hero(pick) : '')
      + (free.docs.length ? `<section class="section"><div class="section-head"><h2>▶ شاهد مجاناً داخل الموقع</h2><a href="#watch">عرض الكل ←</a></div>
          <div class="row-scroll">${free.docs.map(iaCard).join('')}</div></section>` : '')
      + row('الرائج اليوم', trending)
      + row('أحدث الأفلام الأجنبية', mf.results, 'movies-foreign')
      + row('أحدث الأفلام العربية', ma.results, 'movies-arabic')
      + row('مسلسلات أجنبية تُعرض الآن', tf.results, 'tv-foreign')
      + row('مسلسلات عربية تُعرض الآن', ta.results, 'tv-arabic')
      + row('أحدث الأفلام الهندية', mi.results, 'movies-indian')
      + row('أحدث الأفلام التركية', mt.results, 'movies-turkish')
      + row('أنمي يُعرض الآن', an.results, 'anime')
      + row('قريباً في السينما', soon.results.map((r) => ({ ...r, _badge: fmtDate(r.release_date) })), 'movies-foreign/soon')
      || '<p class="empty">ما قدرنا نجيب المحتوى. تأكد من الاتصال أو المفتاح.</p>';
    stamp();
  }

  async function showSection(id, sortKey, genre = '') {
    const s = SECTIONS[id];
    if (!s.sorts[sortKey]) sortKey = Object.keys(s.sorts)[0];
    const tok = ++renderToken;
    const gs = await genres(s.type);
    if (tok !== renderToken) return;
    main.innerHTML = `<section class="section">
      <div class="section-head"><h2>${s.title}</h2></div>
      <div class="filters">
        ${Object.entries(s.sorts).map(([k, [label]]) => `<button class="chip ${k === sortKey ? 'on' : ''}" data-sort="${k}">${label}</button>`).join('')}
        <select class="chip" id="genreSel" aria-label="التصنيف"><option value="">كل التصنيفات</option>${gs.map((g) => `<option value="${g.id}" ${String(g.id) === genre ? 'selected' : ''}>${esc(g.name)}</option>`).join('')}</select>
      </div>
      <div class="grid" id="grid">${skeleton(12)}</div>
      <button class="btn more" id="more" hidden>عرض المزيد</button>
    </section>`;
    main.querySelectorAll('[data-sort]').forEach((b) => (b.onclick = () => (location.hash = `${id}/${b.dataset.sort}${genre ? '/' + genre : ''}`)));
    $('#genreSel').onchange = (e) => (location.hash = `${id}/${sortKey}${e.target.value ? '/' + e.target.value : ''}`);
    let page = 1, first = true;
    const grid = $('#grid'), more = $('#more');
    const load = async () => {
      more.disabled = true;
      try {
        const { results, totalPages } = await discover(id, sortKey, page, genre);
        if (tok !== renderToken) return;
        if (first) grid.innerHTML = '';
        first = false;
        grid.insertAdjacentHTML('beforeend', results.map(card).join(''));
        if (!grid.children.length) grid.innerHTML = '<p class="empty">ما في نتائج.</p>';
        more.hidden = page >= totalPages;
        page++;
      } catch (e) { grid.innerHTML = errorMsg(e); }
      more.disabled = false;
    };
    more.onclick = load;
    await load();
    stamp();
  }

  async function showSearch(q) {
    const tok = ++renderToken;
    $('#q').value = q;
    main.innerHTML = `<section class="section"><div class="section-head"><h2>نتائج البحث: ${esc(q)}</h2></div><div class="grid">${skeleton(12)}</div></section>`;
    try {
      const [p1, p2] = await Promise.all([tmdb('/search/multi', { query: q, page: 1 }), tmdb('/search/multi', { query: q, page: 2 }).catch(() => ({ results: [] }))]);
      if (tok !== renderToken) return;
      const res = [...p1.results, ...p2.results].filter((r) => r.media_type === 'movie' || r.media_type === 'tv');
      $('.grid', main).innerHTML = res.length ? res.map(card).join('') : '<p class="empty">ما لقينا شي بهالاسم.</p>';
    } catch (e) { $('.grid', main).innerHTML = errorMsg(e); }
  }

  // قائمتي: تحفظ في المتصفح، وتنبهك إذا نزلت حلقة جديدة لمسلسل في قائمتك
  const getList = () => LS.get('list', []);
  const inList = (id, type) => getList().some((x) => x.id === +id && x.type === type);
  function toggleList(it, type) {
    let list = getList();
    if (inList(it.id, type)) list = list.filter((x) => !(x.id === +it.id && x.type === type));
    else list.unshift({ id: it.id, type, title: titleOf(it), poster_path: it.poster_path, date: dateOf(it), vote_average: it.vote_average, seen: today() });
    LS.set('list', list);
    return inList(it.id, type);
  }

  async function showMyList() {
    const tok = ++renderToken;
    const list = getList();
    if (!list.length) { main.innerHTML = '<p class="empty">قائمتك فاضية. افتح أي فيلم أو مسلسل واضغط «+ قائمتي».</p>'; return; }
    const items = list.map((x) => ({ ...x, media_type: x.type, [x.type === 'tv' ? 'first_air_date' : 'release_date']: x.date }));
    const draw = () => {
      main.innerHTML = `<section class="section"><div class="section-head"><h2>قائمتي (${items.length})</h2></div><div class="grid">${items.map(card).join('')}</div></section>`;
    };
    draw();
    // افحص المسلسلات: هل نزلت حلقة بعد آخر مرة فتحتها؟
    const updates = await Promise.all(items.filter((x) => x.type === 'tv').map((x) =>
      tmdb(`/tv/${x.id}`).then((d) => ({ x, ep: d.last_episode_to_air })).catch(() => null)));
    if (tok !== renderToken) return;
    let changed = false;
    for (const u of updates) {
      if (u && u.ep && u.ep.air_date && u.ep.air_date > (u.x.seen || '')) { u.x._badge = `حلقة جديدة م${u.ep.season_number} ح${u.ep.episode_number}`; changed = true; }
    }
    if (changed) draw();
  }

  function markSeen(id, type) {
    const list = getList();
    const x = list.find((i) => i.id === +id && i.type === type);
    if (x) { x.seen = today(); LS.set('list', list); }
  }

  // ---------- صفحة التفاصيل ----------
  const dlg = $('#detail'), body = $('#detailBody');
  async function openDetail(id, type, autoTrailer = false) {
    body.innerHTML = '<div class="d-hero"></div><div class="d-body" style="margin-top:0;padding-top:24px"><p class="empty">جاري التحميل…</p></div>';
    if (!dlg.open) dlg.showModal();
    let d;
    try {
      d = await tmdb(`/${type}/${id}`, { append_to_response: 'videos,credits,watch/providers,recommendations', include_video_language: 'ar,en,null' });
    } catch (e) { body.innerHTML = `<button class="d-close" data-close>✕</button><div class="d-body" style="margin-top:0;padding-top:48px">${errorMsg(e)}</div>`; return; }
    if (!d.overview) { try { d.overview = (await tmdb(`/${type}/${id}`, { language: 'en' })).overview; } catch {} }
    markSeen(id, type);

    const vids = (d.videos?.results || []).filter((v) => v.site === 'YouTube');
    const trailer = vids.find((v) => v.type === 'Trailer' && v.iso_639_1 === 'ar') || vids.find((v) => v.type === 'Trailer') || vids.find((v) => v.type === 'Teaser') || vids[0];
    const prov = d['watch/providers']?.results?.[region];
    const provHtml = prov ? [['flatrate', 'اشتراك'], ['free', 'مجاني'], ['ads', 'مجاني مع إعلانات'], ['rent', 'إيجار'], ['buy', 'شراء']]
      .filter(([k]) => prov[k]?.length)
      .map(([k, label]) => `<div><b>${label}</b><div class="providers">${prov[k].map((p) => `<a href="${esc(prov.link)}" target="_blank" rel="noopener" title="${esc(p.provider_name)}"><img src="${IMG}w92${p.logo_path}" alt="${esc(p.provider_name)}"></a>`).join('')}</div></div>`).join('') : '';
    const cast = (d.credits?.cast || []).slice(0, 15);
    const isTv = type === 'tv';
    const director = !isTv && (d.credits?.crew || []).find((c) => c.job === 'Director');
    const creators = isTv && (d.created_by || []).map((c) => c.name).join('، ');
    const runtime = isTv ? (d.episode_run_time?.[0] ? `${d.episode_run_time[0]} د للحلقة` : '') : (d.runtime ? `${Math.floor(d.runtime / 60)}س ${d.runtime % 60}د` : '');
    const statusAr = { 'Returning Series': 'مستمر', Ended: 'انتهى', Canceled: 'ملغي', 'In Production': 'قيد الإنتاج', Released: 'معروض', 'Post Production': 'ما بعد الإنتاج', Planned: 'مخطط له' }[d.status] || d.status;
    const recs = (d.recommendations?.results || []).slice(0, 12).map((r) => ({ ...r, media_type: r.media_type || type }));
    const added = inList(id, type);

    body.innerHTML = `
      <div class="d-hero" id="dHero" style="background-image:url('${d.backdrop_path ? IMG + 'w1280' + d.backdrop_path : ''}')"></div>
      <button class="d-close" data-close aria-label="إغلاق">✕</button>
      <div class="d-body">
        <h2>${esc(titleOf(d))}</h2>
        ${(d.original_title || d.original_name) !== titleOf(d) ? `<div class="orig" dir="auto">${esc(d.original_title || d.original_name)}</div>` : ''}
        <div class="meta">
          ${d.vote_average ? `<span class="star">★ ${d.vote_average.toFixed(1)}</span>` : ''}
          <span>${year(dateOf(d))}</span>${runtime ? `<span>${runtime}</span>` : ''}
          ${isTv ? `<span>${d.number_of_seasons || 0} مواسم · ${d.number_of_episodes || 0} حلقة</span>` : ''}
          ${statusAr ? `<span>${esc(statusAr)}</span>` : ''}
        </div>
        <div class="btns">
          ${trailer ? `<button class="btn primary" id="playTrailer">▶ شاهد الإعلان</button>` : ''}
          <button class="btn" id="addList">${added ? '✓ في قائمتي' : '+ قائمتي'}</button>
        </div>
        <div class="genres">${(d.genres || []).map((g) => `<span>${esc(g.name)}</span>`).join('')}</div>
        <div class="d-cols">
          <div><p>${esc(d.overview || 'لا يوجد ملخص.')}</p></div>
          <div class="d-side">
            ${director ? `<div>الإخراج: <b>${esc(director.name)}</b></div>` : ''}
            ${creators ? `<div>من تأليف: <b>${esc(creators)}</b></div>` : ''}
            ${d.release_date ? `<div>تاريخ العرض: <b>${fmtDate(d.release_date)}</b></div>` : ''}
            ${isTv && d.last_episode_to_air ? `<div>آخر حلقة: <b>م${d.last_episode_to_air.season_number} ح${d.last_episode_to_air.episode_number} · ${fmtDate(d.last_episode_to_air.air_date)}</b></div>` : ''}
            ${isTv && d.next_episode_to_air ? `<div>الحلقة القادمة: <b>${fmtDate(d.next_episode_to_air.air_date)}</b></div>` : ''}
            ${(d.production_countries || []).length ? `<div>البلد: <b>${esc(d.production_countries.map((c) => c.name).join('، '))}</b></div>` : ''}
          </div>
        </div>
        <h3>وين تشوفه</h3>
        ${provHtml || '<p class="d-side">ما في منصات معروفة لهالعمل في دولتك حالياً.</p>'}
        ${cast.length ? `<h3>الممثلين</h3><div class="cast">${cast.map((c) => `<div>${c.profile_path ? `<img loading="lazy" src="${IMG}w185${c.profile_path}" alt="">` : '<div class="ph"></div>'}${esc(c.name)}<small>${esc(c.character || '')}</small></div>`).join('')}</div>` : ''}
        ${recs.length ? `<h3>ممكن يعجبك</h3><div class="row-scroll">${recs.map(card).join('')}</div>` : ''}
      </div>`;
    body.scrollTop = 0; dlg.scrollTop = 0;
    if (trailer) $('#playTrailer').onclick = () => {
      const h = $('#dHero');
      h.classList.add('playing');
      h.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(trailer.key)}?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="الإعلان"></iframe>`;
      h.scrollIntoView({ behavior: 'smooth' });
    };
    if (autoTrailer && trailer) $('#playTrailer').click();
    $('#addList').onclick = (e) => { e.target.textContent = toggleList(d, type) ? '✓ في قائمتي' : '+ قائمتي'; };

    // أزرار التشغيل: ملف مربوط من ملفاتي، أو نسخة مجانية من الأرشيف، أو المنصة الرسمية
    const btns = $('.d-body .btns', body);
    const linked = getFiles().find((f) => f.tmdb && f.tmdb.id === +id && f.tmdb.type === type);
    if (linked) btns.insertAdjacentHTML('afterbegin', `<button class="btn primary" data-file="${esc(linked.id)}">▶ شغّل</button>`);
    if (prov?.link && (prov.flatrate || prov.free || prov.ads)) btns.insertAdjacentHTML('beforeend', `<a class="btn" href="${esc(prov.link)}" target="_blank" rel="noopener">شاهد على المنصة ↗</a>`);
    const addLink = document.createElement('button');
    addLink.className = 'btn'; addLink.textContent = linked ? 'تغيير رابط التشغيل' : '+ رابط تشغيل';
    addLink.onclick = () => {
      const url = prompt('حط رابط فيديو تملكه أو عندك حق تشغيله (MP4 / WebM أو يوتيوب):', linked ? linked.url : '');
      if (!url) return;
      const files = getFiles().filter((f) => !(f.tmdb && f.tmdb.id === +id && f.tmdb.type === type));
      setFiles([{ id: Date.now().toString(36), title: titleOf(d), url: url.trim(), poster: d.poster_path, tmdb: { id: +id, type } }, ...files]);
      openDetail(id, type);
    };
    btns.appendChild(addLink);
    findFreeCopy(d, type).then((x) => {
      if (x && dlg.open && $('#addList', body)) btns.insertAdjacentHTML('afterbegin', `<button class="btn primary" data-ia="${esc(x.identifier)}">▶ شاهد مجاناً</button>`);
    });
  }
  dlg.addEventListener('close', () => { body.innerHTML = ''; if (location.hash.startsWith('#mylist')) showMyList(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });

  // ---------- شاهد الآن: محتوى مسموح تشغيله ----------
  // ١) أرشيف الإنترنت (archive.org): أفلام ومسلسلات ورسوم حقوقها منتهية (ملكية عامة) أو برخصة مفتوحة.
  // ٢) ملفاتي: روابط فيديو تضيفها أنت لأشياء تملكها أو عندك حق تشغيلها.
  const IA = 'https://archive.org';
  const FREE = {
    movies: ['أفلام كلاسيكية', 'collection:feature_films AND mediatype:movies'],
    tv: ['مسلسلات كلاسيكية', 'collection:classic_tv AND mediatype:movies'],
    cartoons: ['رسوم متحركة', 'collection:classic_cartoons AND mediatype:movies'],
    arabic: ['عربي', 'mediatype:movies AND language:(Arabic OR ara) AND licenseurl:(*creativecommons* OR *publicdomain*)'],
    mine: ['ملفاتي'],
  };
  const FREE_SORTS = { popular: ['الأكثر مشاهدة', 'downloads desc'], new: ['المضاف حديثاً', 'addeddate desc'], year: ['الأحدث إنتاجاً', 'year desc'] };
  const iaItems = new Map();

  function jsonp(url) {
    return new Promise((res, rej) => {
      const cb = 'ia' + Math.random().toString(36).slice(2);
      const s = document.createElement('script');
      const done = () => { delete window[cb]; s.remove(); };
      window[cb] = (d) => { done(); res(d); };
      s.onerror = () => { done(); rej(new Error('IA')); };
      s.src = url + '&callback=' + cb;
      document.head.appendChild(s);
    });
  }
  const iaCache = new Map();
  function iaSearch(q, sort = 'downloads desc', page = 1, rows = 48) {
    const p = new URLSearchParams({ q, rows, page, output: 'json' });
    ['identifier', 'title', 'year', 'description', 'downloads'].forEach((f) => p.append('fl[]', f));
    p.append('sort[]', sort);
    const url = `${IA}/advancedsearch.php?${p}`;
    const hit = iaCache.get(url);
    if (hit && Date.now() - hit.t < CFG.REFRESH_MINUTES * 6e4) return hit.p;
    const pr = fetch(url).then((r) => { if (!r.ok) throw new Error('IA'); return r.json(); }).catch(() => jsonp(url))
      .then((d) => {
        const docs = d.response.docs.map((x) => ({ ...x, title: [].concat(x.title)[0], description: [].concat(x.description || '')[0] }));
        docs.forEach((x) => iaItems.set(x.identifier, x));
        return { docs, total: d.response.numFound };
      });
    iaCache.set(url, { t: Date.now(), p: pr });
    pr.catch(() => iaCache.delete(url));
    return pr;
  }
  const stripHtml = (s) => String(s || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
  const fmtNum = (n) => Number(n || 0).toLocaleString('ar');

  function iaCard(x) {
    return `<button class="card" data-ia="${esc(x.identifier)}">
      <div class="poster"><img loading="lazy" src="${IA}/services/img/${encodeURIComponent(x.identifier)}" alt=""><span class="badge">▶ مجاني</span></div>
      <div class="t" title="${esc(x.title)}" dir="auto">${esc(x.title)}</div>
      <div class="s"><span>${esc(x.year || '')}</span><span>${x.downloads ? fmtNum(x.downloads) + ' مشاهدة' : ''}</span></div>
    </button>`;
  }

  async function showWatch(cat = 'movies', sort = 'popular', q = '') {
    if (!FREE[cat]) cat = 'movies';
    if (!FREE_SORTS[sort]) sort = 'popular';
    const tok = ++renderToken;
    main.innerHTML = `<section class="section">
      <div class="section-head"><h2>شاهد الآن</h2><span class="d-side" id="freeTotal"></span></div>
      <p class="d-side" style="margin-top:-6px">كل اللي هنا مسموح تشغيله: أعمال حقوقها منتهية أو منشورة برخصة مفتوحة من أرشيف الإنترنت، وملفاتك الخاصة.</p>
      <div class="filters">${Object.entries(FREE).map(([k, [label]]) => `<button class="chip ${k === cat ? 'on' : ''}" data-cat="${k}">${label}<span class="cnt" data-count="${k}"></span></button>`).join('')}</div>
      ${cat === 'mine' ? '' : `<div class="filters">${Object.entries(FREE_SORTS).map(([k, [label]]) => `<button class="chip ${k === sort ? 'on' : ''}" data-fsort="${k}">${label}</button>`).join('')}
        <form id="freeSearch" style="flex:1;min-width:160px;display:flex"><input class="chip" style="flex:1" type="search" placeholder="ابحث هنا (بالإنجليزي)…" value="${esc(q)}"></form></div>`}
      <div id="watchBody"><div class="grid">${skeleton(12)}</div></div>
      <button class="btn more" id="more" hidden>عرض المزيد</button>
    </section>`;
    main.querySelectorAll('[data-cat]').forEach((b) => (b.onclick = () => (location.hash = `watch/${b.dataset.cat}/${sort}`)));
    main.querySelectorAll('[data-fsort]').forEach((b) => (b.onclick = () => (location.hash = `watch/${cat}/${b.dataset.fsort}${q ? '/' + encodeURIComponent(q) : ''}`)));
    const fs = $('#freeSearch');
    if (fs) fs.onsubmit = (e) => { e.preventDefault(); const v = $('input', fs).value.trim(); location.hash = `watch/${cat}/${sort}${v ? '/' + encodeURIComponent(v) : ''}`; };

    // عدد كل قسم، مباشرة من الأرشيف
    for (const [k, [, query]] of Object.entries(FREE)) {
      const el = main.querySelector(`[data-count="${k}"]`);
      if (k === 'mine') { el.textContent = ` (${fmtNum(getFiles().length)})`; continue; }
      iaSearch(query, 'downloads desc', 1, 0).then((r) => { el.textContent = ` (${fmtNum(r.total)})`; }).catch(() => {});
    }

    const wb = $('#watchBody'), more = $('#more');
    if (cat === 'mine') return showMyFiles(wb);
    const query = FREE[cat][1] + (q ? ` AND (title:(${q.replace(/[():"]/g, ' ')}))` : '');
    let page = 1, first = true;
    const load = async () => {
      more.disabled = true;
      try {
        const { docs, total } = await iaSearch(query, FREE_SORTS[sort][1], page);
        if (tok !== renderToken) return;
        if (first) { wb.innerHTML = '<div class="grid" id="grid"></div>'; $('#freeTotal').textContent = `${fmtNum(total)} عمل`; }
        first = false;
        $('#grid').insertAdjacentHTML('beforeend', docs.map(iaCard).join(''));
        if (!total) wb.innerHTML = '<p class="empty">ما في نتائج.</p>';
        more.hidden = page * 48 >= total;
        page++;
      } catch { wb.innerHTML = '<p class="empty">ما قدرنا نوصل لأرشيف الإنترنت. حاول بعد شوي.</p>'; }
      more.disabled = false;
    };
    more.onclick = load;
    await load();
    stamp();
  }

  // ملفاتي
  const getFiles = () => LS.get('files', []);
  const setFiles = (f) => LS.set('files', f);
  const ytId = (u) => (u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/) || [])[1];
  function showMyFiles(wb) {
    const files = getFiles();
    wb.innerHTML = `<form id="fileForm" class="file-form">
        <input id="fTitle" required placeholder="اسم الفيلم أو الحلقة">
        <input id="fUrl" required dir="ltr" type="url" placeholder="https://…/movie.mp4 أو رابط يوتيوب">
        <button class="btn primary">إضافة</button>
      </form>
      <p class="d-side">أضف روابط لفيديوهات تملكها أو عندك حق تشغيلها: ملف MP4 أو WebM على تخزينك السحابي، أو رابط يوتيوب. يحفظ لك وين وقفت. تقدر بعد تربط الرابط بفيلم من صفحته («+ رابط تشغيل»).</p>
      <div class="grid">${files.map((f) => `<div class="card file-card">
        <button class="poster" data-file="${esc(f.id)}">${f.poster ? `<img loading="lazy" src="${IMG}w342${f.poster}" alt="">` : `<div class="noimg">▶<br>${esc(f.title)}</div>`}${progressBar(f.url)}</button>
        <div class="t" title="${esc(f.title)}">${esc(f.title)}</div>
        <div class="s"><button class="link" data-delfile="${esc(f.id)}">حذف</button></div></div>`).join('')}</div>`;
    $('#fileForm').onsubmit = (e) => {
      e.preventDefault();
      setFiles([{ id: Date.now().toString(36), title: $('#fTitle').value.trim(), url: $('#fUrl').value.trim() }, ...getFiles()]);
      showMyFiles(wb);
      const c = main.querySelector('[data-count="mine"]'); if (c) c.textContent = ` (${fmtNum(getFiles().length)})`;
    };
    wb.querySelectorAll('[data-delfile]').forEach((b) => (b.onclick = () => {
      if (!confirm('تحذف هالرابط؟')) return;
      setFiles(getFiles().filter((f) => f.id !== b.dataset.delfile)); showMyFiles(wb);
    }));
  }
  const progress = () => LS.get('progress', {});
  function progressBar(url) {
    const p = progress()[url];
    return p && p.d ? `<span class="prog"><i style="width:${Math.min(100, (p.t / p.d) * 100)}%"></i></span>` : '';
  }

  // المشغّل
  function playerHtml(src) {
    if (src.ia) return `<iframe src="${IA}/embed/${encodeURIComponent(src.ia)}?playlist=1" allow="autoplay; fullscreen" allowfullscreen title="مشغّل"></iframe>`;
    const y = ytId(src.url);
    if (y) return `<iframe src="https://www.youtube-nocookie.com/embed/${y}?autoplay=1&rel=0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="مشغّل"></iframe>`;
    return `<video id="vid" controls autoplay playsinline src="${esc(src.url)}"></video>`;
  }
  function wireVideo(url) {
    const v = $('#vid');
    if (!v) return;
    const saved = progress()[url];
    v.addEventListener('loadedmetadata', () => { if (saved && saved.t < v.duration - 30) v.currentTime = saved.t; }, { once: true });
    let last = 0;
    v.addEventListener('timeupdate', () => {
      if (Date.now() - last < 5000) return;
      last = Date.now();
      const all = progress(); all[url] = { t: v.currentTime, d: v.duration }; LS.set('progress', all);
    });
    v.addEventListener('error', () => { v.outerHTML = '<p class="empty">ما قدرنا نشغّل الملف. تأكد إن الرابط مباشر لملف MP4 أو WebM.</p>'; });
  }

  function openIa(id) {
    const x = iaItems.get(id) || { identifier: id, title: id };
    body.innerHTML = `<div class="d-hero playing">${playerHtml({ ia: id })}</div>
      <button class="d-close" data-close aria-label="إغلاق">✕</button>
      <div class="d-body" style="margin-top:0;padding-top:16px">
        <h2 dir="auto">${esc(x.title)}</h2>
        <div class="meta"><span>${esc(x.year || '')}</span>${x.downloads ? `<span>${fmtNum(x.downloads)} مشاهدة</span>` : ''}<span class="badge" style="position:static">مسموح تشغيله</span></div>
        <p dir="auto">${esc(stripHtml(x.description).slice(0, 900))}</p>
        <p class="d-side">المصدر: <a href="${IA}/details/${encodeURIComponent(id)}" target="_blank" rel="noopener">أرشيف الإنترنت</a>. إذا العمل فيه أكثر من حلقة، اختارها من قائمة التشغيل داخل المشغّل.</p>
      </div>`;
    if (!dlg.open) dlg.showModal();
  }
  function openFile(id) {
    const f = getFiles().find((x) => x.id === id);
    if (!f) return;
    body.innerHTML = `<div class="d-hero playing">${playerHtml(f)}</div>
      <button class="d-close" data-close aria-label="إغلاق">✕</button>
      <div class="d-body" style="margin-top:0;padding-top:16px"><h2>${esc(f.title)}</h2>
      ${f.tmdb ? `<button class="btn" data-open="${f.tmdb.id}" data-type="${f.tmdb.type}">تفاصيل العمل</button>` : ''}</div>`;
    if (!dlg.open) dlg.showModal();
    wireVideo(f.url);
  }

  // في صفحة الفيلم: هل له نسخة مجانية في الأرشيف؟
  async function findFreeCopy(d, type) {
    const t = (d.original_title || d.original_name || '').replace(/[():"\\]/g, ' ').trim();
    const y = +year(dateOf(d));
    if (!t || !y) return null;
    const coll = type === 'tv' ? 'classic_tv' : 'feature_films';
    try {
      const { docs } = await iaSearch(`collection:${coll} AND mediatype:movies AND title:("${t}") AND year:[${y - 1} TO ${y + 1}]`, 'downloads desc', 1, 1);
      return docs[0] || null;
    } catch { return null; }
  }

  // ---------- عام ----------
  function errorMsg(e) {
    if (e.status === 401) { setTimeout(openSetup, 0); return '<p class="empty">المفتاح غير صحيح. حدّثه من الإعدادات ⚙</p>'; }
    return '<p class="empty">صار خطأ في جلب البيانات. حاول مرة ثانية.</p>';
  }
  let lastUpdate = Date.now();
  function stamp() {
    lastUpdate = Date.now();
    $('#updated').textContent = 'آخر تحديث: ' + new Date().toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' }) + ` · يتحدث تلقائياً كل ${CFG.REFRESH_MINUTES} دقيقة`;
  }

  document.addEventListener('click', (e) => {
    const ar = e.target.closest('[data-scroll]');
    if (ar) { const sc = ar.parentElement.querySelector('.row-scroll'); return sc.scrollBy({ left: -(+ar.dataset.scroll) * sc.clientWidth * 0.9 }); }
    const ia = e.target.closest('[data-ia]');
    if (ia) return openIa(ia.dataset.ia);
    const fl = e.target.closest('[data-file]');
    if (fl) return openFile(fl.dataset.file);
    const c = e.target.closest('.card[data-id]');
    if (c) return openDetail(c.dataset.id, c.dataset.type);
    const o = e.target.closest('[data-open]');
    if (o) return openDetail(o.dataset.open, o.dataset.type, !!o.dataset.trailer);
    const a = e.target.closest('[data-add]');
    if (a) {
      tmdb(`/${a.dataset.type}/${a.dataset.add}`).then((d) => { a.textContent = toggleList(d, a.dataset.type) ? '✓ في قائمتي' : '+ قائمتي'; });
    }
  });

  $('#searchForm').onsubmit = (e) => { e.preventDefault(); const q = $('#q').value.trim(); if (q) location.hash = 'search=' + encodeURIComponent(q); };

  function route() {
    if (!key) return openSetup();
    const h = decodeURIComponent(location.hash.slice(1)) || 'home';
    const [tab, sort, genre] = h.split('/');
    document.querySelectorAll('#tabs a').forEach((a) => a.classList.toggle('active', a.dataset.tab === tab));
    window.scrollTo(0, 0);
    document.body.classList.toggle('home', tab === 'home');
    headerState();
    if (h.startsWith('search=')) return showSearch(h.slice(7));
    if (SECTIONS[tab]) return showSection(tab, sort || Object.keys(SECTIONS[tab].sorts)[0], genre || '');
    if (tab === 'mylist') return showMyList();
    if (tab === 'watch') return showWatch(sort, genre, h.split('/').slice(3).join('/'));
    return showHome();
  }
  window.addEventListener('hashchange', route);
  // الشريط العلوي شفاف فوق الصورة الكبيرة، ويصير أسود لما تنزل
  const top = $('.top');
  function headerState() {
    document.documentElement.style.setProperty('--top-h', top.offsetHeight + 'px');
    top.classList.toggle('solid', window.scrollY > 40 || !document.body.classList.contains('home'));
  }
  window.addEventListener('scroll', headerState, { passive: true });
  window.addEventListener('resize', headerState);

  // ---------- الإعداد ----------
  const setup = $('#setup');
  function openSetup() {
    $('#keyInput').value = key;
    $('#regionInput').value = region;
    $('#setupErr').textContent = '';
    if (!setup.open) setup.showModal();
  }
  $('#settingsBtn').onclick = openSetup;
  setup.addEventListener('cancel', (e) => { if (!key) e.preventDefault(); });
  $('#setupForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const k = $('#keyInput').value.trim();
    $('#setupErr').textContent = 'جاري التحقق…';
    try { await tmdb('/configuration', {}, { fresh: true, k }); }
    catch (err) { $('#setupErr').textContent = err.status === 401 ? 'المفتاح غير صحيح.' : 'ما قدرنا نتصل بـ TMDB. تأكد من الإنترنت.'; return; }
    key = k; region = $('#regionInput').value;
    LS.set('key', key); LS.set('region', region);
    cache.clear();
    setup.close();
    route();
  });

  // ---------- التحديث التلقائي ----------
  function autoRefresh() {
    if (dlg.open || setup.open || !key) return;
    if (Date.now() - lastUpdate < CFG.REFRESH_MINUTES * 6e4) return;
    cache.clear();
    const y = window.scrollY;
    Promise.resolve(route()).then(() => window.scrollTo(0, y));
  }
  setInterval(autoRefresh, 60e3);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) autoRefresh(); });

  route();
})();
