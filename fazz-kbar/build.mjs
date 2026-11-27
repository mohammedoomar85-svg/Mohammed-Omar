// Builds the Fizz & Play adults store into fazz-kbar/dist for Cloudflare.
// Usage (from the repo root or fazz-kbar/): node fazz-kbar/build.mjs
//   /           store            /order/   the customer's order page and codes
//   /admin/     dashboard        /play/<game>/   the digital games behind a code gate
import { copyFileSync, cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const dist = join(here, 'dist');
const repo = join(here, '..');
rmSync(dist, { recursive: true, force: true });
cpSync(join(here, 'site'), dist, { recursive: true });

// supabase-js browser build (MIT), served locally for the admin page and the game's referee link.
const sbjs = join(repo, 'diwaniya', 'supabase.js');
copyFileSync(sbjs, join(dist, 'admin', 'supabase.js'));

// Diwaniya lives outside this folder, so it is copied in with the code gate added.
// The other games are in site/play/ and already include the gate.
const games = [{ id: 'diwaniya', src: join(repo, 'diwaniya', 'index.html') }];
for (const g of games) {
  const out = join(dist, 'play', g.id);
  mkdirSync(out, { recursive: true });
  const html = readFileSync(g.src, 'utf8');
  const gate = `<script src="/config.js"></script>\n<script src="/play/gate.js" data-product="${g.id}"></script>\n<meta name="robots" content="noindex">\n`;
  if (!html.includes('</head>')) throw new Error(`No </head> in ${g.src}`);
  let page = html.replace('</head>', gate + '</head>');
  // The adult store sells Diwaniya under the name «اضمن».
  if (g.id === 'diwaniya') page = page.split('ديوانية مشربية الكوت').join('اضمن');
  writeFileSync(join(out, 'index.html'), page);
  if (g.id === 'diwaniya') copyFileSync(sbjs, join(out, 'supabase.js'));
}
console.log('Built fazz-kbar/dist: store, order/, admin/, play/' + games.map((g) => g.id).join(', play/'));
