// Builds the public site for hosting (Cloudflare Pages).
// landing/index.html is written as a page fragment; this wraps it in a full HTML document.
// Usage: node landing/build.mjs   → landing/dist/index.html
import { copyFileSync, cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const src = readFileSync(join(here, 'index.html'), 'utf8');
const split = src.indexOf('<div class="page"');
if (split < 0) throw new Error('Could not find the page wrapper in landing/index.html');
const head = src.slice(0, split).trim();
const body = src.slice(split).trim();

const html = `<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta property="og:title" content="فز و العب · Fizz & Play">
<meta property="og:description" content="صندوق ألعاب تعليمية شهري وتطبيق ألعاب بالعربي والإنجليزي للأطفال من ٣ إلى ٨ سنوات.">
<meta name="theme-color" content="#FFC23D">
${head}
</head>
<body>
${body}
</body>
</html>
`;
mkdirSync(join(here, 'dist'), { recursive: true });
writeFileSync(join(here, 'dist', 'index.html'), html);
// The admin dashboard is already a full page.
copyFileSync(join(here, 'admin.html'), join(here, 'dist', 'admin.html'));
copyFileSync(join(here, 'privacy.html'), join(here, 'dist', 'privacy.html'));
for (const f of ['favicon.svg', 'apple-touch-icon.png']) copyFileSync(join(here, f), join(here, 'dist', f));
cpSync(join(here, 'shop'), join(here, 'dist', 'shop'), { recursive: true });
// The Diwaniya party game is a standalone page served at /diwaniya/.
mkdirSync(join(here, 'dist', 'diwaniya'), { recursive: true });
copyFileSync(join(here, '..', 'diwaniya', 'index.html'), join(here, 'dist', 'diwaniya', 'index.html'));
// supabase-js browser build (MIT), served next to the game so the referee link doesn't depend on a CDN.
copyFileSync(join(here, '..', 'diwaniya', 'supabase.js'), join(here, 'dist', 'diwaniya', 'supabase.js'));
console.log('Built landing/dist: index.html, admin.html, privacy.html, shop/ (shop page and photos), diwaniya/ (party game)');
