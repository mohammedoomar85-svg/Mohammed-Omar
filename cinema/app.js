// سينما محمد — كل المحتوى يجي مباشرة من TMDB، فالموقع يتحدث تلقائياً بأحدث الأفلام والمسلسلات.
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
      title: 'أفلام أجنبية', type: 'movie', arabic: false,
      sorts: {
        latest: ['الأحدث', () => ({ sort_by: 'primary_release_date.desc', 'primary_release_date.lte': today(), 'vote_count.gte': 40 })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 1500 })],
        soon: ['قريباً', () => ({ sort_by: 'popularity.desc', 'primary_release_date.gte': daysAhead(1), 'primary_release_date.lte': daysAhead(120) })],
      },
    },
    'movies-arabic': {
      title: 'أفلام عربية', type: 'movie', arabic: true,
      sorts: {
        latest: ['الأحدث', () => ({ sort_by: 'primary_release_date.desc', 'primary_release_date.lte': today(), 'vote_count.gte': 1 })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 40 })],
      },
    },
    'tv-foreign': {
      title: 'مسلسلات أجنبية', type: 'tv', arabic: false,
      sorts: {
        airing: ['تُعرض الآن', () => ({ sort_by: 'popularity.desc', 'air_date.gte': daysAgo(10), 'air_date.lte': daysAhead(7), 'vote_count.gte': 20 })],
        latest: ['مسلسلات جديدة', () => ({ sort_by: 'first_air_date.desc', 'first_air_date.lte': today(), 'vote_count.gte': 20 })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 1000 })],
      },
    },
    'tv-arabic': {
      title: 'مسلسلات عربية', type: 'tv', arabic: true,
      sorts: {
        airing: ['تُعرض الآن', () => ({ sort_by: 'popularity.desc', 'air_date.gte': daysAgo(14), 'air_date.lte': daysAhead(7) })],
        latest: ['مسلسلات جديدة', () => ({ sort_by: 'first_air_date.desc', 'first_air_date.lte': today() })],
        popular: ['الأكثر شعبية', () => ({ sort_by: 'popularity.desc' })],
        top: ['الأعلى تقييماً', () => ({ sort_by: 'vote_average.desc', 'vote_count.gte': 20 })],
      },
    },
  };

  async function discover(id, sortKey, page = 1, genre = '') {
    const s = SECTIONS[id];
    const params = { ...s.sorts[sortKey][1](), page };
    if (s.arabic) params.with_original_language = 'ar';
    if (genre) params.with_genres = genre;
    const data = await tmdb(`/discover/${s.type}`, params);
    let results = data.results.map((r) => ({ ...r, media_type: s.type }));
    if (!s.arabic) results = results.filter((r) => r.original_language !== 'ar');
    if (s.arabic && sortKey === 'latest') results = results.filter((r) => r.poster_path);
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
      <div class="row-scroll">${items.map(card).join('')}</div></section>`;
  }

  function hero(it) {
    const type = typeOf(it), d = dateOf(it);
    return `<section class="hero" style="background-image:url('${IMG}w1280${it.backdrop_path}')">
      <div class="hero-in">
        <div class="meta"><span>${type === 'tv' ? 'مسلسل' : 'فيلم'}</span><span>${year(d)}</span>${it.vote_average ? `<span class="star">★ ${it.vote_average.toFixed(1)}</span>` : ''}${isNew(d) ? '<span class="badge" style="position:static">جديد</span>' : ''}</div>
        <h1>${esc(titleOf(it))}</h1>
        <p>${esc(it.overview || '')}</p>
        <div class="btns"><button class="btn primary" data-open="${it.id}" data-type="${type}">▶ التفاصيل والإعلان</button>
        <button class="btn" data-add="${it.id}" data-type="${type}">${inList(it.id, type) ? '✓ في قائمتي' : '+ قائمتي'}</button></div>
      </div></section>`;
  }

  // ---------- الصفحات ----------
  let renderToken = 0;
  async function showHome() {
    const tok = ++renderToken;
    main.innerHTML = `<section class="hero"></section>${['', '', ''].map(() => `<section class="section"><div class="row-scroll">${skeleton()}</div></section>`).join('')}`;
    const safe = (p) => p.catch(() => ({ results: [] }));
    const [trend, mf, ma, tf, ta, soon] = await Promise.all([
      safe(tmdb('/trending/all/day')),
      safe(discover('movies-foreign', 'latest')),
      safe(discover('movies-arabic', 'latest')),
      safe(discover('tv-foreign', 'airing')),
      safe(discover('tv-arabic', 'airing')),
      safe(discover('movies-foreign', 'soon')),
    ]);
    if (tok !== renderToken) return;
    const trending = trend.results.filter((r) => r.media_type === 'movie' || r.media_type === 'tv');
    const pick = trending.find((r) => r.backdrop_path && r.overview) || trending.find((r) => r.backdrop_path);
    main.innerHTML = (pick ? hero(pick) : '')
      + row('الرائج اليوم', trending)
      + row('أحدث الأفلام الأجنبية', mf.results, 'movies-foreign')
      + row('أحدث الأفلام العربية', ma.results, 'movies-arabic')
      + row('مسلسلات أجنبية تُعرض الآن', tf.results, 'tv-foreign')
      + row('مسلسلات عربية تُعرض الآن', ta.results, 'tv-arabic')
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
  async function openDetail(id, type) {
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
    $('#addList').onclick = (e) => { e.target.textContent = toggleList(d, type) ? '✓ في قائمتي' : '+ قائمتي'; };
  }
  dlg.addEventListener('close', () => { body.innerHTML = ''; if (location.hash.startsWith('#mylist')) showMyList(); });
  dlg.addEventListener('click', (e) => { if (e.target === dlg || e.target.closest('[data-close]')) dlg.close(); });

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
    const c = e.target.closest('.card[data-id]');
    if (c) return openDetail(c.dataset.id, c.dataset.type);
    const o = e.target.closest('[data-open]');
    if (o) return openDetail(o.dataset.open, o.dataset.type);
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
    if (h.startsWith('search=')) return showSearch(h.slice(7));
    if (SECTIONS[tab]) return showSection(tab, sort || Object.keys(SECTIONS[tab].sorts)[0], genre || '');
    if (tab === 'mylist') return showMyList();
    return showHome();
  }
  window.addEventListener('hashchange', route);

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
