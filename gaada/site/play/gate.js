// Code gate for paid games. Add to a game page:
//   <script src="/config.js"></script>
//   <script src="/play/gate.js" data-product="diwaniya"></script>
// The game opens once a valid code is entered (or arrives as ?code=...). The code is checked by
// Supabase (gaada_redeem) and remembered in this browser. The referee view (?ref / #ref) is never gated,
// because it only works with a room opened by a main screen that already has a code.
(function () {
  'use strict';
  var me = document.currentScript, product = me.getAttribute('data-product'), C = window.GAADA;
  if (/[?&]ref(=|&|$)/.test(location.search) || location.hash.indexOf('#ref') === 0) return;
  var KEY = 'gaada-code-' + product;
  function get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  var device = get('gaada-device');
  if (!device) { device = 'd' + Math.random().toString(36).slice(2) + Date.now().toString(36); set('gaada-device', device); }

  var css = document.createElement('style');
  css.textContent =
    '#gaada-gate{position:fixed;inset:0;z-index:2147483000;display:grid;place-items:center;padding:16px;' +
    'background:#0d1822;color:#f2ebe0;font-family:Tajawal,Tahoma,sans-serif;direction:rtl}' +
    '#gaada-gate .box{width:min(420px,100%);background:#182a39;border:1px solid #24384a;border-radius:20px;padding:24px;text-align:center}' +
    '#gaada-gate h1{font-family:"Reem Kufi",Tajawal,sans-serif;font-size:1.6rem;margin:0 0 6px}' +
    '#gaada-gate p{color:#a3b0bb;margin:0 0 16px;line-height:1.6}' +
    '#gaada-gate input{width:100%;min-height:52px;border-radius:12px;border:1px solid #24384a;background:#0d1822;color:#f2ebe0;' +
    'font:700 1.3rem ui-monospace,Menlo,Consolas,monospace;text-align:center;letter-spacing:.08em;direction:ltr;text-transform:uppercase}' +
    '#gaada-gate button,#gaada-gate a.buy{display:block;width:100%;min-height:48px;margin-top:10px;border:0;border-radius:12px;' +
    'font:700 1rem Tajawal,Tahoma,sans-serif;cursor:pointer;text-decoration:none;line-height:48px}' +
    '#gaada-gate button{background:#f07a55;color:#1a0b05}#gaada-gate a.buy{background:#24384a;color:#f2ebe0}' +
    '#gaada-gate .e{color:#f08a5d;font-weight:700;min-height:1.6em;margin:10px 0 0}';
  document.head.appendChild(css);

  var gate = document.createElement('div');
  gate.id = 'gaada-gate';
  gate.innerHTML = '<form class="box" novalidate><h1>اكتب كود اللعبة</h1>' +
    '<p>الكود يطلع لك على صفحة طلبك بعد الدفع، ويوصلك على الواتساب.</p>' +
    '<input id="gaada-code" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="GD-XXXX-XXXX" aria-label="كود اللعبة">' +
    '<div class="e" id="gaada-err" role="alert"></div>' +
    '<button type="submit">افتح اللعبة</button><a class="buy" href="/?p=' + encodeURIComponent(product) + '">ما عندي كود؟ اشترِ اللعبة</a></form>';

  var ERR = { 'invalid code': 'الكود غير صحيح.', 'code is for another game': 'هذا الكود للعبة ثانية.',
    'too many devices': 'الكود انفتح على 3 أجهزة. كلمنا على الواتساب لو تبي تغيّر جهاز.' };

  function redeem(code) {
    return fetch(C.SB_URL + '/rest/v1/rpc/gaada_redeem', {
      method: 'POST', headers: { apikey: C.SB_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_code: code, p_product: product, p_device: device })
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) { if (!r.ok) { var e = new Error(j.message || 'error'); e.server = true; throw e; } return true; });
    });
  }
  function open() { if (gate.parentNode) gate.parentNode.removeChild(gate); }
  function lock(msg) {
    if (!gate.parentNode) document.body.appendChild(gate);
    gate.querySelector('#gaada-err').textContent = msg || '';
    setTimeout(function () { var i = gate.querySelector('#gaada-code'); if (i) i.focus(); }, 50);
  }
  gate.addEventListener('submit', function (e) {
    e.preventDefault();
    var code = gate.querySelector('#gaada-code').value.toUpperCase().replace(/\s/g, '');
    if (code.length < 6) return lock('اكتب الكود كامل.');
    var b = gate.querySelector('button'); b.disabled = true; b.textContent = 'جاري التحقق…';
    redeem(code).then(function () { set(KEY, code); open(); })
      .catch(function (x) { lock(x.server ? (ERR[x.message] || 'الكود غير صحيح.') : 'ما قدرنا نتحقق من الكود. تأكد من الإنترنت.'); })
      .finally(function () { b.disabled = false; b.textContent = 'افتح اللعبة'; });
  });

  // Cover the game straight away, then check.
  function start() {
    var fromUrl = (/[?&]code=([A-Za-z0-9-]+)/.exec(location.search) || [])[1];
    if (fromUrl) {
      var clean = location.search.replace(/([?&])code=[^&]*&?/, '$1').replace(/[?&]$/, '');
      try { history.replaceState(null, '', location.pathname + clean + location.hash); } catch (e) {}
    }
    var code = (fromUrl || get(KEY) || '').toUpperCase();
    lock('');
    if (!code) return;
    gate.querySelector('#gaada-code').value = code;
    redeem(code).then(function () { set(KEY, code); open(); }).catch(function (x) {
      // Offline with a code that worked before on this device: let them play.
      if (!x.server && get(KEY) === code) return open();
      lock(x.server ? (ERR[x.message] || 'الكود غير صحيح.') : 'ما قدرنا نتحقق من الكود. تأكد من الإنترنت.');
    });
  }
  if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
})();
