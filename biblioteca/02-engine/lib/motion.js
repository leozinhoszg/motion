// lib/motion.js — springs em forma fechada e helpers determinísticos (curso Movez, seção 08).
// Script clássico (não ES module): páginas abertas via file:// não podem fazer `import`.
// No browser: <script src="lib/motion.js"></script> → window.Motion. No Node: require('./lib/motion.js').
(function (root) {
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

  // Spring amortecido 0 → 1. Função pura do tempo.
  function spring(t, k = 170, d = 26) {
    if (t <= 0) return 0;
    const w0 = Math.sqrt(k), z = d / (2 * w0);
    if (z < 1) {
      const wd = w0 * Math.sqrt(1 - z * z);
      return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
    }
    return 1 - Math.exp(-w0 * t) * (1 + w0 * t);      // z >= 1 tratado como crítico
  }

  // Presets [k, d]. Os valores com "calibrar" não vêm do artigo — são pontos de partida nossos.
  const SPRINGS = {
    snappy:   [320, 30],   // botões, toggles, borda da frente
    default:  [170, 26],   // cards, containers, câmera
    title:    [220, 22],   // tipografia cinética
    grid:     [260, 20],   // stagger de grid
    trailing: [140, 22],   // borda de trás
    heavy:    [120, 24],   // tipo grande, logos, 3D — calibrar
    playful:  [200, 12],   // mascotes, stickers, overshoot visível — calibrar
  };
  const sp = (t, name = 'default') => spring(t, ...SPRINGS[name]);

  // keys: [[tempo, valor], ...] ordenado. Um spring por mudança, somados: contínuo e seekável.
  function track(t, keys, k = 170, d = 26) {
    let v = keys[0][1];
    for (let i = 1; i < keys.length; i++)
      v += (keys[i][1] - keys[i - 1][1]) * spring(t - keys[i][0], k, d);
    return v;
  }

  // Indicador de aba que estica: borda da frente mais rígida que a de trás.
  function indicator(t, stops, width = 120) {      // stops: [[tempo, x], ...]
    const lead = track(t, stops, 320, 30);
    const trail = track(t, stops, 140, 22);
    return { left: Math.min(lead, trail), right: Math.max(lead, trail) + width };
  }

  // Texto dentro de caixa que muda de forma: entra após o morph começar, sai antes do próximo.
  function swapAlpha(t, tIn, tOut) {
    return Math.min(clamp((t - tIn - 0.08) / 0.12), clamp((tOut - 0.1 - t) / 0.1));
  }

  // Loop sem emenda: último frame = primeiro.
  const loopT = (t, dur) => ((t % dur) + dur) % dur;

  // PRNG com seed (mulberry32). Nunca Math.random.
  function rng(seed) {
    return () => {
      seed |= 0; seed = seed + 0x6D2B79F5 | 0;
      let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  const lerp = (a, b, p) => a + (b - a) * p;

  // Equivalente ao interpolate() do Remotion: interpolate(t, [0, 1, 2], [0, 100, 50])
  function interpolate(x, input, output, { clamp: doClamp = true, ease = (p) => p } = {}) {
    let i = 1;
    while (i < input.length - 1 && x > input[i]) i++;
    let p = (x - input[i - 1]) / (input[i] - input[i - 1]);
    if (doClamp) p = clamp(p);
    return lerp(output[i - 1], output[i], ease(p));
  }

  const api = { clamp, lerp, interpolate, spring, SPRINGS, sp, track, indicator, swapAlpha, loopT, rng };
  root.Motion = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
