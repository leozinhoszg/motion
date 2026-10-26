// FALLBACK sem internet. O padrão agora é o opus-sound-layer (gravações reais CC0):
// veja biblioteca/03-prompts/07-sound-layer.md. Efeitos sintetizados soam "beep barato".
// node sfx.mjs cues.json out/sfx.wav     cues: [{"t":0.5,"type":"click"}, ...]
// Curso Movez, seção 09. WAV 48 kHz, 16 bits, mono. Ruído com seed (LCG): determinístico.
import { readFileSync, writeFileSync } from 'node:fs';
const SR = 48000;
const cues = JSON.parse(readFileSync(process.argv[2], 'utf8').replace(/^﻿/, ''));
const buf = new Float32Array(Math.ceil((Math.max(...cues.map(c => c.t)) + 2) * SR));

let s = 42; const noise = () => (s = (s * 1664525 + 1013904223) >>> 0) / 2147483648 - 1;
const VOICES = {
  click:  [0.05, t => Math.sin(2 * Math.PI * 1800 * t) * Math.exp(-t * 90) * 0.5],
  pop:    [0.15, t => Math.sin(2 * Math.PI * (600 + 900 * t) * t) * Math.exp(-t * 30) * 0.4],
  thump:  [0.50, t => Math.sin(2 * Math.PI * (90 - 60 * t) * t) * Math.exp(-t * 9) * 0.9],
  whoosh: [0.35, t => noise() * Math.sin(Math.PI * Math.min(1, t / 0.35)) * 0.25],
};
for (const c of cues) {
  if (!VOICES[c.type]) throw new Error(`tipo de cue desconhecido: ${c.type} (use ${Object.keys(VOICES)})`);
  const [len, fn] = VOICES[c.type], start = Math.floor(c.t * SR);
  for (let i = 0; i < len * SR && start + i < buf.length; i++) buf[start + i] += fn(i / SR);
}

const n = buf.length, b = Buffer.alloc(44 + n * 2);      // WAV 16-bit mono
b.write('RIFF', 0); b.writeUInt32LE(36 + n * 2, 4); b.write('WAVEfmt ', 8);
b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
b.writeUInt32LE(SR, 24); b.writeUInt32LE(SR * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34);
b.write('data', 36); b.writeUInt32LE(n * 2, 40);
for (let i = 0; i < n; i++) b.writeInt16LE(Math.round(Math.max(-1, Math.min(1, buf[i])) * 32767), 44 + i * 2);
writeFileSync(process.argv[3], b);
console.log(`${process.argv[3]} · ${cues.length} cues · ${(n / SR).toFixed(2)}s`);
