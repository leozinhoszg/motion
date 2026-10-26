// node render.mjs --fps 60 --sub 4 [--dur 15] [--w 1080 --h 1920] [--page index.html] [--out out/silent.mp4] [--from 0]
// Sem --dur, a duração vem de window.DUR na página.
// Curso Movez, seção 07, adaptado para Windows (file URL, localização do ffmpeg).
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const raw = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const num = (k, d) => Number(raw(k, d));
const FPS = num('fps', 60), SUB = num('sub', 4), FROM = num('from', 0), DUR_ARG = raw('dur');
const W = num('w', 1080), H = num('h', 1920);
const PAGE = resolve(raw('page', 'index.html')), OUT = raw('out', 'out/silent.mp4');
mkdirSync(dirname(OUT), { recursive: true });

// winget instala o ffmpeg em WinGet\Links, que só entra no PATH de terminais novos
const wingetFF = join(process.env.LOCALAPPDATA || '', 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe');
const FFMPEG = process.env.FFMPEG || (existsSync(wingetFF) ? wingetFF : 'ffmpeg');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
const url = pathToFileURL(PAGE);
url.search = new URLSearchParams({ w: W, h: H, ...(DUR_ARG && { dur: DUR_ARG }) }).toString();
await page.goto(url.href);
await page.evaluate(() => document.fonts.ready);       // texto no canvas precisa das fontes carregadas
// Sem --dur, usa a duração que a página declara (window.DUR, ex.: derivada da timeline em frames)
const DUR = DUR_ARG ? Number(DUR_ARG) : await page.evaluate(() => window.DUR || 15);

// tmix faz a média de SUB subframes consecutivos; select mantém o último de cada grupo
const vf = `tmix=frames=${SUB},select='eq(mod(n\\,${SUB})\\,${SUB - 1})',setpts=N/${FPS}/TB`;
const ff = spawn(FFMPEG, ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS * SUB), '-i', '-',
  '-vf', vf, '-r', String(FPS), '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', OUT],
  { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now(), total = Math.round(DUR * FPS * SUB);
for (let i = 0; i < total; i++) {
  await page.evaluate((t) => window.seek(t), FROM + i / (FPS * SUB));
  const png = await page.locator('#c').screenshot({ type: 'png' });
  if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % (FPS * SUB) === 0) console.log(`rendered ${i / (FPS * SUB)}s / ${DUR}s`);
}
ff.stdin.end();
const code = await new Promise((r) => ff.on('close', r));
await browser.close();
if (code !== 0) { console.error(`ffmpeg saiu com código ${code}`); process.exit(code); }
console.log(`${OUT} · ${W}x${H} · ${DUR}s · ${((Date.now() - t0) / 1000).toFixed(1)}s de render`);
