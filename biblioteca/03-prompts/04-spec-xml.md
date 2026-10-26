# 04 · Spec em XML ("escreva a lista de estados, não a vibe")

**Seção do curso:** 06 · **Rota:** A · **Effort:** xhigh
**Exemplos:** [catálogo](../06-exemplos/catalogo.md) #10 (@twoclipping, UI morph com 907K views e 19K bookmarks; template original no texto do post), #11 (@verbove, MakerMap), #12 (@NFT_Chen, UI como set de filmagem)

Foi o prompt mais salvo da semana. O conceito é **uma forma, nunca corta**: um único elemento muda de tamanho, raio e cor de estado em estado (botão, loader, player, slider, gráfico, command palette). Um cursor dispara cada mudança com cliques reais, e o último frame é igual ao primeiro, então o vídeo fecha em loop.

## Template (versão do curso)

```xml
<inputs>
Ask me for: my product + URL, 8 to 12 UI states that tell its story, the real data shown in
each state, brand colors + fonts + one accent, a royalty-free track near 120 BPM, formats.
</inputs>

<direction>
Product-film UI motion. One container never cuts: every state is the same element changing
size, radius and fill while its content swaps behind a short blur. A cursor drives every change.
Warm neutral canvas, one accent. Springs with at most a tiny overshoot.
Banned: bouncy easing, glows, gradients on UI chrome, particle bursts, dead time.
</direction>

<structure>
120 BPM, 8 bars, something happens on every beat.
logo → CTA button → email field (typed) → loader → success check → dashboard card
→ chart draws itself → tooltip on hover → ⌘K palette → toast → logo.
</structure>

<build>
1. One HTML file, one canvas, window.seek(t). No CSS transitions, no timers, no carried state.
2. Closed-form springs. A value with many targets = sum of one spring per change.
3. Text inside a morphing container enters after the morph starts, leaves before the next one.
4. Tab indicators: leading and trailing edges on different springs so they stretch.
5. Beat grid from the track (numpy/librosa). Start on a downbeat. UI sounds on measured peaks.
6. Render in headless Chrome at 60 fps, 4 subframes per frame, blended for motion blur.
</build>

<gotchas>
Never use will-change on anything the camera scales (blurry text).
The last frame must equal the first, cursor position and velocity included.
</gotchas>

<start>
Ask for the inputs, then show me the state list on the beat grid before writing code.
</start>
```

Todos os itens de `<build>` já estão implementados em [../02-engine/](../02-engine/): `track`, `swapAlpha`, `indicator`, `loopT`, `beats.py` e `render.mjs --sub 4`.

## Refatoração de springs (prompt de uma linha)

```text
Replace every easing curve with closed-form springs from lib/motion.js. Tiny overshoot on UI,
none on type. Any value with more than one target uses track().
```
