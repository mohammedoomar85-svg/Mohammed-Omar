// Builds the Gaada store into gaada/dist for Cloudflare.
// Usage (from the repo root or gaada/): node gaada/build.mjs
//   /           store            /order/   the customer's order page and codes
//   /admin/     dashboard        /play/diwaniya/   the Diwaniya game behind a code gate
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

// Paid games: the original page plus the code gate. Add more games here as { id, src }.
const games = [{ id: 'diwaniya', src: join(repo, 'diwaniya', 'index.html') }];
for (const g of games) {
  const out = join(dist, 'play', g.id);
  mkdirSync(out, { recursive: true });
  const html = readFileSync(g.src, 'utf8');
  const gate = `<script src="/config.js"></script>\n<script src="/play/gate.js" data-product="${g.id}"></script>\n<meta name="robots" content="noindex">\n`;
  if (!html.includes('</head>')) throw new Error(`No </head> in ${g.src}`);
  writeFileSync(join(out, 'index.html'), html.replace('</head>', gate + '</head>'));
  if (g.id === 'diwaniya') copyFileSync(sbjs, join(out, 'supabase.js'));
}
console.log('Built gaada/dist: store, order/, admin/, play/' + games.map((g) => g.id).join(', play/'));
