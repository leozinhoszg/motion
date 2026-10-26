# 07 · Sound layer: gravações reais no lugar de beeps sintetizados

**Origem:** "Sound design for Opus 5.5: no more cheap beeps", de 0xCodila (9 out. 2026), e o repositório [Bodila51/opus-sound-layer](https://github.com/Bodila51/opus-sound-layer) (MIT), clonado em [../refs/repos/opus-sound-layer/](../refs/repos/opus-sound-layer/). Não é material da Anthropic, apesar do logo na imagem.
**Substitui:** o `sfx.mjs` do Movez (clique/pop/thump/whoosh sintetizados), que fica só como fallback sem internet.
**Exemplo aprovado:** [../02-engine/exemplos/aprovado/](../02-engine/exemplos/aprovado/) (`launch-clip_som.mp4`, `_LISTEN.md`, `_qa.png`, `_CREDITS.md`)

## A ideia
> *"Claude can't hear its own audio."*

Por isso os efeitos sintetizados soam baratos e fora da imagem. O sound layer resolve em três partes:
1. **Gravações reais:** kit com 1.139 sons CC0 (Kenney + Freesound) em 19 tipos, já cortados, filtrados e julgados.
2. **Posicionamento pela timeline:** os cues vêm do tempo da própria animação, e cada som entra pelo seu pico.
3. **QA que o Claude consegue ver:** medições de sincronia, audibilidade, loudness e movimento da imagem, mais um `qa.png` com forma de onda, espectrograma e curva de movimento. **Uma pessoa faz a checagem final de ouvido.**

## O que já está montado aqui
| Peça | Onde |
|---|---|
| Scripts `sfx.py`, `mix.py`, `qa.py` (não editar) | `refs/repos/opus-sound-layer/scripts/` |
| Kit construído (1.139 sons, `catalog.json`, `CREDITS.md`) | `biblioteca/som/kit/`, compartilhado entre projetos |
| Loop de música CC0 de teste + beats | `biblioteca/som/musica/` |
| Exportador de cues a partir da página | `02-engine/cues.mjs` (lê `window.CUES`, `window.DUR`, `window.FPS`) |
| Tempos de spring para cues | `Comp.springPeakSpeed(k, d)` → `move` · `Comp.springSettle(k, d)` → `land` |
| Ferramentas | `uv` 0.13 e ffmpeg via winget (`%LOCALAPPDATA%\Microsoft\WinGet\Links`) |

## Pipeline na nossa engine (PowerShell)

```powershell
$env:Path = "$env:LOCALAPPDATA\Microsoft\WinGet\Links;" + $env:Path   # terminais antigos
$sl = 'D:\DESIGN\motion\biblioteca\refs\repos\opus-sound-layer\scripts'

# 0. imagem muda
node render.mjs --page minha-cena.html --fps 30 --sub 4 --out out\silent.mp4
# 1. cues a partir da timeline (a página define window.CUES)
node cues.mjs --page minha-cena.html --out audio\cues.json --music ..\som\musica\<faixa>.mp3 --energy punchy
# 2. escolher cada som olhando
uv run "$sl\sfx.py" browse --type hit --like "soft plastic" --kit ..\som\kit --png audio\browse_hit.png
# 3. mix + mux + QA
uv run "$sl\mix.py" audio\cues.json 2>$null
ffmpeg -v error -y -i out\silent.mp4 -i audio\mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -shortest out\final.mp4
uv run "$sl\qa.py" out\final.mp4 2>$null      # sai com 1 se houver FAIL; gera audio\qa.png
```

> Use `2>$null` no `uv run`. O uv escreve "Installed N packages" no stderr e o PowerShell 5.1 trata isso como erro.

## Como declarar os cues na página

```js
const { springPeakSpeed: peak, springSettle: settle } = Comp;
window.FPS = E.fps; window.DUR = E.dur;
window.CUES = [
  { id: 'card',   t: E('reveal') + peak(170, 26), sound: 'swish/kenney-casino-card-slide-4', visual: 'move' },
  { id: 'click',  t: E('press'), sound: 'click/fs-399443-mouse-clicks' },
  { id: 'result', t: barsPeak, sound: 'thump/<id>+tap/<id>', weight: 'hero', visual: 'move', stop_before: true },
  { id: 'logo',   t: E('cut') + 0.1, sound: '...', visual: 'appear', stop_before: true, build: true },
];
```

Tags de imagem (o `qa.py` confere na imagem real): **cut** = troca do quadro inteiro · **move** = frame de pico de velocidade · **land** = o movimento para · **appear** = o elemento surge. Formato completo: `uv run "$sl\mix.py" --schema`.

## Lições do primeiro clipe (11 falhas → 0 em 2 rodadas)
1. **Movimento pequeno não conta como `move`.** O morph de um botão de 360 px quase não aparece na curva de movimento. Marque o cue no **movimento visível** (ali, as barras crescendo).
2. **`land` só funciona quando a tela inteira para.** Se outra coisa ainda se move (texto entrando, card saindo), use `appear` no instante em que o elemento surge.
3. **Cues a menos de 0,15 s uns dos outros** são atenuados (x0.6). Espace teclas e ticks a ≥ 0,15 s.
4. **Escolha sons fora da banda densa da música.** Uma guitarra lofi cobre 1–4 kHz; teclas a ~3,4 kHz passaram, a ~2 kHz não.
5. **`stop_before` = a pausa antes do reveal** (300–600 ms) do método de launch clip: a música para 0,4 s antes do hero.
6. **Um hero a cada ~4 s.** Num clipe de 9 s, o resultado é o hero e o logo é support.
7. **`punchy` = −14 LUFS** (regra da casa). O `calm` (−18) deixou os heros sem corpo.
8. **Uma família sonora por filme** (aqui: plástico macio de UI + papel + baque macio) e variação nas repetições (dois sons de tecla alternados, baques diferentes no resultado e no logo).

## Prompt original (do repositório, versão atual)

```text
SOUND LAYER · Opus 5.5
You can't hear. Use real recordings, pick each one yourself, place them from
the timeline, look at every sound, and let the QA decide. A human does the
final ear check.

SETUP  git clone https://github.com/Bodila51/opus-sound-layer sound-layer
Use its scripts (needs ffmpeg and uv). Never rewrite them and never loosen a
threshold to make a check pass.

1 CUES  Export audio/cues.json from the picture's own timing (springs,
easings, data-start). Never type frames. Format: uv run
sound-layer/scripts/mix.py --schema. Sound only on real actions; tag each:
cut (full-frame change) · move (frame of peak speed) · land (frame motion
stops) · appear (element pops in). One hero per ~4 s (logo, reveal):
"hit+boom" with stop_before and build, a riser or reverse peaking on it.

2 SOUNDS  uv run sound-layer/scripts/sfx.py kit  (1,139 CC0 sounds, 19
types: hit boom riser reverse transition whoosh swish glitch ui click key
tick tap pop thump paper chime shimmer zap). The first run downloads the
library: give it a 10-minute timeout or run it in the background. Choose
every sound yourself:
sfx.py browse --type <type> --like "<material, weight, mood>", LOOK at
audio/browse.png, put the chosen id in the cue. Keep one sonic family per
film (e.g. glass + air, or metal + sub); vary repeats. A bare type uses
the defaults.
Nothing fits? Find it yourself: sfx.py search "<material action>" --type
<type>, or any recording whose licence allows it; check it with sfx.py
sheet, then sfx.py add FILE --type <type> --credit "<source, licence>".
Never synthesize hits, clicks or whooshes; no meme sounds. Music: my
track, or a CC0 loop.

3 BUILD  Render the picture muted, then:
uv run sound-layer/scripts/mix.py audio/cues.json
ffmpeg -i video.mp4 -i audio/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac
-b:a 256k -shortest out/final.mp4
uv run sound-layer/scripts/qa.py out/final.mp4

4 VERIFY  Fix every FAIL by changing cues or sounds, at most 2 rounds.
Open audio/qa.png and describe what you see at each hero cue.

5 DELIVER  final.mp4 · audio/kit/CREDITS.md · LISTEN.md: 5 timecodes to
check by ear. Don't call the sound good; report what the checks show.
```

**Na nossa versão:** em vez de clonar o repositório em cada projeto, use os scripts de `refs/repos/opus-sound-layer/scripts` e o kit compartilhado em `biblioteca/som/kit` (com `"kit"` na cue sheet apontando para ele). O `cues.mjs` cuida disso.

## Música
O prompt pede **a sua trilha ou um loop CC0**. Para buscar loops CC0 sem chave, use a API do Openverse (filtros `license=cc0&source=freesound`). Guarde a faixa com o crédito em `biblioteca/som/musica/` e meça com `py beats.py faixa.wav faixa.beats.json`.
