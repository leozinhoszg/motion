# 06 · Launch clip de uma ação (timeline em frames + janela de leitura + reuso)

**Origem:** post no X "Motion Engineering with Opus 5.5: Build Launch Videos You Can Sell" (out. 2026; o "full guide" citado não foi localizado) + infográfico em [../00-curso/motion-engineering.png](../00-curso/motion-engineering.png). Complementado com as regras de tempo de [aiidelist.com/blog/opus-5-5-motion-design](https://aiidelist.com/blog/opus-5-5-motion-design).
**Rota:** A (ou B, em Remotion) · **Effort:** xhigh para o primeiro clipe, medium para revisões
**Demo pronta:** [../02-engine/exemplos/launch-clip.html](../02-engine/exemplos/launch-clip.html), com componentes em [../02-engine/lib/components.js](../02-engine/lib/components.js)

## A ideia
**Uma ação do produto → um clipe de lançamento → um workflow reutilizável.** Cada movimento tem uma função. O que se aprova não é só o vídeo, mas as **peças** (entradas, trajetos de cursor, componentes de texto), que entram no próximo projeto.

```
brief → build → preview → scoped edit → render → review → reuse
```

Comece pequeno: **um clipe, uma capa e uma rodada de revisão.**

## Os 4 passos

| # | Passo | O que entra | Na nossa engine |
|---|---|---|---|
| 01 | **Assets + brief** | Logo, telas do produto, referência; o plano, o texto e a **janela de leitura** | `assets/`, `docs/shotlist.md`, `readingHold()` |
| 02 | **Timeline em frames** | Entrada, clique do botão e reveal do resultado presos a frames | `timeline(30, { reveal: 36, press: 117, result: 123, … })` |
| 03 | **Preview + revisão** | Ver os stills, assistir a cena e dar ao agente **uma edição precisa** | `studio` no browser, `qa.ps1 -Frames`, prompt de edição com escopo (abaixo) |
| 04 | **Export + reuso** | Entregar o clipe e **guardar** as entradas, trajetos e textos aprovados | `out/`, `qa.ps1 -Cover`, promover para `lib/components.js` |

### Os eventos do infográfico
Reveal → Press → Result → Hold → Cut (no exemplo: frames 120, 195, 210, 234 e 420). Note os intervalos: o **resultado vem 15 frames depois do clique** (resposta imediata) e o **hold vai de 234 a 420**, o tempo de ler.

## Regras de tempo
- **Janela de leitura:** headline legível e resultado visível **por tempo suficiente**. Mínimo de **1,2 s** para headline; o nosso `readingHold()` usa ~4 palavras/s + 0,5 s.
- **Derive o corte do hold**, não chute: `CUT = HOLD + ceil((readingHold(texto) + 0.3) * fps)`. A demo faz isso.
- **Pausa antes do reveal:** 300–600 ms de quietude antes de um reveal deixam o movimento mais forte.
- **Tempo morto ≤ 0,5 s** fora das janelas de leitura.
- **Primeiro frame = thumbnail** nos reels verticais, ou exporte uma capa dedicada (`qa.ps1 -Cover`).
- **Zonas seguras no 9:16:** nada crítico nos ~18% de baixo nem nos ~11% de cima (UI do Reels e do TikTok).

## Sistema de movimento (para reuso)
- **Vocabulário:** horizontal = progresso, escala = importância, rotação = mudança de estado. O mesmo significado em todas as cenas.
- **2–3 famílias de transição** por filme, no máximo.
- **Easing por função:** UI = `snappy`, câmera e cards = `default`, logo = `heavy`, dados crescendo = `grid` (veja `SPRINGS`).
- **Encadeie objetos:** cada transição tem uma origem (barra de busca → barra de progresso → eixo do gráfico).

## Template de brief

```text
Make a [DURATION]s launch clip for [PRODUCT] built around ONE product action: [ACTION].

Assets: logo, product screens and reference are in ./assets and ./refs. Use them as-is.

Shot brief
- Copy: headline "[HEADLINE]" and result line "[RESULT]". Nothing else on screen.
- Layout: 9:16, content inside the safe zone (nothing critical in the bottom 18%).
- Events, in frames at 30 fps (use lib/components.js timeline()):
  reveal (product enters) · press (cursor clicks [BUTTON]) · result (≤ 15 frames after press)
  · hold (result readable) · cut. Derive cut from readingHold() of the result line.
- Reuse lib/components.js: entrance(), drawText()/drawLines(), cursor()/drawCursor().
  Springs from SPRINGS: UI snappy, cards default, logo heavy.
- First frame must work as a thumbnail.

Before rendering, show me the event table in frames and the reading hold of every text.
Then render, run .\qa.ps1 -Frames 'opening=…,press=…,result=…,hold=…,closing=…' and look at them.
```

## Revisão com escopo (uma edição precisa por rodada)

```text
Review only. Do not rewrite anything yet.
Open out/review_*.png and out/contact.png. List issues as P0 (must fix), P1 (major), P2 (polish),
each with the frame number and the event it belongs to.
```

```text
Implement only the P0 and P1 items. Change the event table, not the scene code, when the fix is timing.
Express every timing change in frames.
```

Exemplos de edições precisas (em vez de "deixa mais dinâmico"):
- "Move o reveal do logo **12 frames** para depois."
- "Reduz o overshoot do botão em **8 frames**" (troque o preset para `snappy`).
- "Estende o hold final em **30 frames**."
- "O cursor para em cima do gráfico no frame 140; mova o ponto de descanso para a direita do botão."

## Frames de revisão
Além do contact sheet, exporte **frames nomeados** dos momentos que vendem: abertura, produto, resultado e fechamento. Inclua também **o meio das transições** (morphs quebram no meio, não nas pontas).

```powershell
.\qa.ps1 -Video out\clip.mp4 -Frames 'opening=0.6,press=3.92,result=4.6,hold=5.6,closing=8.5' -Cover 5.6
```

## Equivalência com o Remotion (rota B)
O infográfico usa o vocabulário do Remotion. Na nossa engine:

| Remotion | Engine seek(t) |
|---|---|
| `useCurrentFrame()` | `t * fps` (o `seek` recebe segundos) |
| `interpolate(frame, [a, b], [x, y])` | `Motion.interpolate(t, [a, b], [x, y])` |
| `spring({ frame, fps })` | `Motion.spring(t - t0, k, d)` / `Motion.sp(t - t0, 'snappy')` |
| `<Sequence from={120}>` | `timeline(30, { reveal: 120 })` + `if (t >= E('reveal'))` |
