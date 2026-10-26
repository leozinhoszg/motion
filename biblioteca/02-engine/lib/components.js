// lib/components.js — peças reutilizáveis aprovadas: timeline em frames, janela de leitura,
// entradas, cursor e texto. Carregar depois de lib/motion.js → window.Comp.
// Origem: método "frame timeline + reading window + reuse" (post do X, out. 2026) sobre a engine do Movez.
// Medidas em px de uma base de 1080; passe U (= min(W, H) / 1080) para escalar.
(function (root) {
  const M = root.Motion || (typeof require !== 'undefined' && require('./motion.js'));
  const { clamp, spring, track, SPRINGS } = M;

  // Eventos nomeados em frames, como no storyboard: E('press') → segundos.
  // Revisões viram "mova o press 12 frames" e mudam só esta tabela.
  function timeline(fps, frames) {
    const at = (name) => {
      if (!(name in frames)) throw new Error(`evento desconhecido: ${name}`);
      return frames[name] / fps;
    };
    at.fps = fps; at.frames = frames;
    at.dur = Math.max(...Object.values(frames)) / fps;
    return at;
  }

  // Janela de leitura: ~4 palavras/s + 0,5 s de margem, nunca menos de 1,2 s para headline.
  function readingHold(text, { wps = 4, min = 1.2, pad = 0.5 } = {}) {
    const words = String(text).trim().split(/\s+/).filter(Boolean).length;
    return Math.max(min, pad + words / wps);
  }

  // Entradas: recebem o progresso do spring p (0 → 1, pode passar de 1) e devolvem deslocamentos.
  const ENTRANCES = {
    mask:  (p) => ({ reveal: clamp(p), dy: (1 - p) * 40 }),     // revela da esquerda e sobe
    rise:  (p) => ({ alpha: clamp(p * 1.6), dy: (1 - p) * 80 }),
    scale: (p) => ({ alpha: clamp(p * 2), scale: 0.86 + 0.14 * p }),
    slide: (p) => ({ alpha: clamp(p * 2), dx: (1 - p) * -90 }),
  };
  function entrance(t, kind = 'rise', preset = 'default') {
    const p = t <= 0 ? 0 : spring(t, ...SPRINGS[preset]);
    return { alpha: 1, dx: 0, dy: 0, scale: 1, reveal: 1, ...ENTRANCES[kind](p) };
  }
  // Saída curta e linear: o foco fica na entrada, a saída só limpa o palco.
  const exitAlpha = (t, tOut, dur = 0.25) => 1 - clamp((t - tOut) / dur);

  // Texto com entrada, janela de leitura e saída. Devolve false enquanto não está na tela.
  function drawText(g, text, x, y, t, o = {}) {
    const { font = '700 100px serif', color = '#F0EEE6', kind = 'mask', preset = 'title',
            tIn = 0, tOut = Infinity, U = 1, align = 'left' } = o;
    if (t < tIn) return false;
    const e = entrance(t - tIn, kind, preset), out = exitAlpha(t, tOut);
    if (out <= 0) return false;
    g.save();
    g.font = font; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    const m = g.measureText(text), w = m.width;
    const x0 = align === 'center' ? x - w / 2 : align === 'right' ? x - w : x;
    if (e.reveal < 1) {
      const top = y - m.actualBoundingBoxAscent - 30 * U, h = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent + 60 * U;
      g.beginPath(); g.rect(x0 - 20 * U, top, (w + 40 * U) * e.reveal, h); g.clip();
    }
    g.globalAlpha = e.alpha * out;
    g.translate(x0 + w / 2 + e.dx * U, y + e.dy * U); g.scale(e.scale, e.scale);
    g.fillStyle = color; g.fillText(text, -w / 2, 0);
    g.restore();
    return true;
  }

  // Várias linhas com stagger. Devolve o tempo em que a última linha fica legível.
  function drawLines(g, lines, x, y, lineH, t, o = {}) {
    const { stagger = 0.09, tIn = 0 } = o;
    lines.forEach((line, i) => drawText(g, line, x, y + i * lineH, t, { ...o, tIn: tIn + i * stagger }));
    return tIn + (lines.length - 1) * stagger + 0.35;
  }

  // Cursor: path [[t, x, y], ...] com um spring por trecho; clicks: [t, ...].
  function cursor(t, path, clicks = [], preset = 'default') {
    const [k, d] = SPRINGS[preset];
    const x = track(t, path.map(([tt, xx]) => [tt, xx]), k, d);
    const y = track(t, path.map(([tt, , yy]) => [tt, yy]), k, d);
    let press = 0, ripple = -1;
    for (const c of clicks) {
      const dt = t - c;
      if (dt >= 0 && dt < 0.22) press = Math.max(press, Math.sin(Math.PI * dt / 0.22));
      if (dt >= 0 && dt < 0.45) ripple = dt / 0.45;
    }
    return { x, y, press, ripple, scale: 1 - 0.16 * press };
  }

  function drawCursor(g, c, U = 1, { fill = '#FFFFFF', stroke = '#141413', alpha = 1 } = {}) {
    g.save(); g.globalAlpha = alpha; g.translate(c.x, c.y);
    if (c.ripple >= 0) {
      g.beginPath(); g.arc(0, 0, (14 + 46 * c.ripple) * U, 0, Math.PI * 2);
      g.strokeStyle = fill; g.lineWidth = 3 * U; g.globalAlpha = alpha * (1 - c.ripple) * 0.7; g.stroke();
      g.globalAlpha = alpha;
    }
    g.scale(U * 1.4 * c.scale, U * 1.4 * c.scale);
    g.beginPath();
    g.moveTo(0, 0); g.lineTo(0, 44); g.lineTo(11, 33); g.lineTo(19, 51);
    g.lineTo(26, 48); g.lineTo(18, 31); g.lineTo(33, 31); g.closePath();
    g.fillStyle = fill; g.fill(); g.lineWidth = 2.5; g.strokeStyle = stroke; g.stroke();
    g.restore();
  }

  // Tempos de um spring para cues de som (sound-layer): nunca digitar frames, derivar do movimento.
  // springPeakSpeed → "move" (frame de maior velocidade); springSettle → "land" (o movimento para).
  function springPeakSpeed(k = 170, d = 26) {
    let best = 0, bt = 0, prev = 0;
    for (let t = 0.001; t < 3; t += 0.001) {
      const s = spring(t, k, d), v = s - prev; prev = s;
      if (v > best) { best = v; bt = t; }
    }
    return bt;
  }
  function springSettle(k = 170, d = 26, eps = 0.01) {
    let last = 0;
    for (let t = 0; t < 5; t += 0.001) if (Math.abs(1 - spring(t, k, d)) > eps) last = t;
    return last;
  }

  const api = { timeline, readingHold, ENTRANCES, entrance, exitAlpha, drawText, drawLines, cursor, drawCursor,
                springPeakSpeed, springSettle };
  root.Comp = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
