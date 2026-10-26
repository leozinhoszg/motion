// node cues.mjs --page exemplos/launch-clip.html --out audio/cues.json [--kit ../som/kit] [--music audio/music.wav] [--energy punchy|calm]
// Exporta a cue sheet do opus-sound-layer a partir do tempo da própria animação (window.CUES, window.DUR, window.FPS).
// A página declara os cues a partir da timeline e dos springs — nunca frames digitados à mão.
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { pathToFileURL } from 'node:url';

const raw = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const PAGE = resolve(raw('page', 'index.html')), OUT = raw('out', 'audio/cues.json');
const KIT = raw('kit', resolve('..', 'som', 'kit')), MUSIC = raw('music'), ENERGY = raw('energy', 'punchy');

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
await page.goto(pathToFileURL(PAGE).href);
const { cues, dur, fps, silenceOk } = await page.evaluate(() =>
  ({ cues: window.CUES, dur: window.DUR, fps: window.FPS || 30, silenceOk: window.SILENCE_OK }));
await browser.close();
if (!Array.isArray(cues) || !cues.length) { console.error('a página não declara window.CUES'); process.exit(1); }

// Caminhos relativos à pasta de onde mix.py roda (a do projeto), com barras normais
const rel = (p) => relative(process.cwd(), resolve(p)).split('\\').join('/');
const sheet = {
  fps, duration_s: +dur.toFixed(3), energy: ENERGY, kit: rel(KIT),
  ...(MUSIC && existsSync(MUSIC) && { music: { file: rel(MUSIC), start_s: 0, loop: true, fade_out_s: 1.0 } }),
  ...(silenceOk && { silence_ok: silenceOk }),
  cues: cues.map((c) => ({ ...c, t: +c.t.toFixed(4) })),
};
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(sheet, null, 1));
console.log(`${OUT} · ${sheet.cues.length} cues · ${sheet.duration_s}s @ ${fps} fps${sheet.music ? ' · music' : ' · sem música'}`);
for (const c of sheet.cues) console.log(`  ${c.id.padEnd(12)} ${c.t.toFixed(3)}s  ${c.sound.padEnd(14)} ${c.weight || 'support'}${c.visual ? ' · ' + c.visual : ''}`);
