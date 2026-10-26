# motion

Conhecimento e ferramental para fazer motion design com o Claude Opus 5.5, a partir do curso [How to build motion design studio with Opus 5.5](https://movez.substack.com/p/how-to-build-motion-design-studio) (Movez, 4 out. 2026).

> *"The prompt is 10% of the video. The other 90% is the harness."*

| Arquivo / pasta | Conteúdo |
|---|---|
| [How to build motion design studio with Opus 5.5.md](How%20to%20build%20motion%20design%20studio%20with%20Opus%205.5.md) | O artigo original |
| [motion_plan.md](motion_plan.md) | Plano de estudo (módulos 0 a 9) |
| [biblioteca/](biblioteca/README.md) | A biblioteca: rotas, engine testada, prompts, regras, skill, kit de som, catálogo de exemplos e repositórios de referência |

## Clonar

Os repositórios de referência em `biblioteca/refs/repos/` são submódulos (o `hyperframes` sozinho tem ~1,5 GB):

```powershell
git clone https://github.com/leozinhoszg/motion.git
cd motion
npm install                          # Playwright, usado pela engine
npx playwright install chromium
git submodule update --init --depth 1                              # todos os refs
git submodule update --init --depth 1 biblioteca/refs/repos/opus-sound-layer   # ou só um
```

O `ffmpeg` precisa estar no PATH (veja "Ambiente" em [biblioteca/README.md](biblioteca/README.md)).

Requisitos: Node 22+, ffmpeg, Python com `numpy librosa soundfile` (análise de música) e [uv](https://docs.astral.sh/uv/) (scripts do sound layer).

## Como funciona

O Opus 5.5 recebe texto e imagem e devolve texto: ele **não gera MP4**. Todo vídeo desse trend é um **programa** que o Opus escreve e que outra ferramenta transforma em frames.

O truque é o determinismo. O Opus escreve uma única função, `window.seek(t)`, que pinta o frame exato de qualquer instante. Um Chromium headless chama essa função frame a frame, tira um screenshot de cada um e o ffmpeg junta tudo. Como nada depende de timer, o render sai idêntico toda vez, e uma correção vira uma edição de uma linha mais um novo render.

O que separa um vídeo "mid" de um viral não é o prompt, é o **loop de crítica**: o Opus renderiza, olha os próprios frames, dá nota e corrige. Por isso o vídeo tem que ser feito no **Claude Code** (ou em outro agente com shell), não no chat: só ali ele consegue renderizar e olhar o resultado.

```
brief ──► Opus escreve index.html (window.seek(t)) ──► render.mjs (Playwright + ffmpeg)
  ▲                                                          │
  └──── corrige os 3 piores problemas ◄── contact sheet + nota 1–10 ◄┘
```

## Como criar um vídeo com o Claude Opus 5.5

### 1. Monte o projeto

Crie o projeto dentro de `projetos/` (assim ele usa o Playwright do `node_modules` da raiz):

```powershell
$p = 'projetos\meu-video'
Copy-Item -Recurse biblioteca\02-engine $p                       # engine seek(t)
Copy-Item biblioteca\04-regras\CLAUDE.md $p                      # regras da casa
New-Item -ItemType Directory -Force "$p\prompts", "$p\.claude\skills" | Out-Null
Copy-Item biblioteca\03-prompts\critique-pass.txt "$p\prompts"
Copy-Item -Recurse biblioteca\05-skills\motion-reel "$p\.claude\skills"
cd $p
```

Edite a seção **Look** do `CLAUDE.md` com as fontes e a cor de destaque da sua marca. O Claude Code lê esse arquivo em toda execução, então as regras (render determinístico, estilos proibidos, loop de crítica) valem para todo vídeo do projeto sem precisar repetir.

### 2. Abra o Claude Code no Opus 5.5 com effort alto

```powershell
claude --model claude-opus-5-5
> /model      # Opus 5.5 e o effort
```

O padrão é effort **medium**. Todos os one-shots virais rodaram em **xhigh** ou **max**:

| Effort | Quando usar |
|---|---|
| medium | Pequenas correções e re-renders |
| xhigh | Filme novo |
| max | Peça principal, quando os 3 primeiros segundos precisam segurar um lançamento |

Mantenha **uma sessão por marca**: o segundo vídeo sai mais rápido porque o renderer, o áudio e o export já existem.

### 3. Escolha o prompt pelo objetivo

Os modelos estão em [biblioteca/03-prompts/](biblioteca/03-prompts/):

| Quero… | Prompt |
|---|---|
| Testar se o setup funciona | [01-one-liner](biblioteca/03-prompts/01-one-liner.md): *"make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are, like it's your showreel for a résumé. go all out."* |
| Vídeo do meu produto | [02-brand](biblioteca/03-prompts/02-brand.md): URL do produto, "use screenshots, logo e assets reais", história em 5 batidas, música |
| Copiar o estilo de um vídeo que admiro | [03-reference](biblioteca/03-prompts/03-reference.md): extrai frames com ffmpeg, escreve `style_guide.md` e `shotlist.md` e espera seu OK |
| Motion de UI premium em loop | [04-spec-xml](biblioteca/03-prompts/04-spec-xml.md): spec XML com a lista de estados, "uma forma que nunca corta" |
| Clipe de lançamento de uma ação | [06-launch-clip](biblioteca/03-prompts/06-launch-clip.md): reveal → press → result → hold → cut |
| Filme longo, clipe musical, personagens | [05-director-brief](biblioteca/03-prompts/05-director-brief.md): brief de diretor com gates, rodando sozinho por horas |
| Som de verdade | [07-sound-layer](biblioteca/03-prompts/07-sound-layer.md) |

O resultado do one-liner: o reel original de Stephan Livera, gerado no effort **max** com aquele prompt de uma linha (15 s, 1920×1080, [post no X](https://x.com/stephanlivera/status/2103315922098470926)). Clique para abrir o vídeo com som:

[![Showreel de Stephan Livera feito com o one-liner no Opus 5.5 (max)](biblioteca/06-exemplos/videos/04_stephanlivera.gif)](biblioteca/06-exemplos/videos/04_stephanlivera.mp4)

Ou use a skill, que empacota o pipeline inteiro numa frase:

```
/motion-reel para https://meuproduto.com, 20s, vertical, referência ./refs/frame.png
```

Três regras do artigo que valem para qualquer prompt:

- **One-liner testa a engine, nunca a ideia.** Centenas de pessoas usaram o mesmo prompt e os reels saíram parecidos ("brief contagion"). Use para validar o setup e depois parta para os outros.
- **Dê uma referência.** Sem ela, o Opus cai no padrão: texto centralizado num gradiente, tudo com fade-in. Nomear um estilo funciona melhor que descrevê-lo; um frame ou um vídeo de referência dá ritmo, tipografia e transições para copiar. Pegue a gramática da referência, nunca o conteúdo.
- **Escreva a lista de estados, não a vibe.** O prompt mais salvo da semana era uma spec com inputs, direção, estados batida a batida, regras de build e pegadinhas.

Chaves de API (ElevenLabs para voz, fal para imagem/vídeo) ficam no `.env`. No prompt, escreva só *"a chave do ElevenLabs está em ELEVENLABS_API_KEY no .env"*. Nunca cole a chave.

### 4. Aprove o plano antes do código

Peça (os prompts já pedem) para o Opus mostrar o `docs/shotlist.md` na grade de batidas, e o `docs/style_guide.md` quando houver referência, **antes** de escrever código.

### 5. Deixe o Opus olhar os próprios frames

Esse é o passo que mais importa. Antes de mostrar qualquer coisa, o Opus deve:

1. Gerar o contact sheet, o strip de uma ação rápida e o teste de celular (`.\qa.ps1`) e **olhar** as imagens.
2. Dar nota de 1 a 10 em: gancho nos 2 primeiros segundos, leitura no tamanho de celular, qualidade do movimento, variedade, fidelidade à marca e sincronia do som.
3. Corrigir os 3 piores problemas e repetir até todas as notas ficarem em 8 ou mais (mínimo 3 rodadas, registradas em `docs/review_log.md`).

O prompt da crítica está em [critique-pass.txt](biblioteca/03-prompts/critique-pass.txt). Iterar é o método, não um fracasso: o curta aquarelado do catálogo levou 163 chamadas e quase 7 horas.

### 6. Som, render final e formatos

```powershell
node render.mjs --fps 60 --sub 4 --out out\silent.mp4          # imagem muda
node cues.mjs --page index.html --out audio\cues.json          # cues a partir da timeline
# escolher os sons, mixar, juntar e checar: passo a passo em biblioteca/03-prompts/07-sound-layer.md
.\qa.ps1 -Determinism                                          # o render tem que sair idêntico duas vezes
```

As cenas são escritas sobre uma função de layout, não em pixels fixos. Assim 9:16, 1:1 e 16:9 saem da mesma timeline (`--w --h`), com o texto reenquadrado por formato em vez de cortado.

Entregáveis: `out/final.mp4`, `out/contact.png`, `out/poster.png`, `LISTEN.md` (5 timecodes para ouvir) e os créditos dos sons.

## O que cada ferramenta faz

### Engine da rota A ([biblioteca/02-engine/](biblioteca/02-engine/))

| Ferramenta | O que faz |
|---|---|
| `index.html` | A página do filme. Um canvas e a função `window.seek(t)`, que pinta o frame do instante `t`. No navegador comum mostra um preview ao vivo; no render headless o preview desliga. |
| `lib/motion.js` | Matemática do movimento. `spring` (mola amortecida em forma fechada, função pura do tempo), presets `SPRINGS` (snappy, default, heavy, playful), `track` (um valor com vários alvos = soma de uma mola por mudança, sem simular os frames anteriores), `indicator` (aba que estica: bordas com molas diferentes), `swapAlpha` (texto que entra depois do morph e sai antes do próximo), `loopT` (loop sem emenda), `rng` (ruído com seed, no lugar do `Math.random`) e `interpolate`. |
| `lib/components.js` | Peças aprovadas para reusar. `timeline` (tabela de eventos em frames), `readingHold` (quanto tempo um texto precisa ficar legível, mínimo 1,2 s), `entrance`/`exitAlpha` (entradas e saídas), `drawText`/`drawLines`, `cursor`/`drawCursor` (cursor com cliques reais) e `springPeakSpeed`/`springSettle` (momentos de uma mola usados para posicionar o som). |
| `render.mjs` | O renderer. Abre a página no Chromium (Playwright), chama `seek(t)` em cada subframe, envia os screenshots para o ffmpeg e gera H.264 (CRF 16). Com `--sub 4`, faz a média de 4 subframes por frame para criar motion blur. |
| `qa.ps1` | As checagens do loop de crítica: contact sheet, strip de 12 frames de uma ação rápida, teste de leitura a 360 px, emenda do loop, teste de determinismo (dois renders com hash igual), frames de revisão nomeados, capa e mix a −14 LUFS. |
| `beats.py` | Mede uma música com librosa e grava `beats.json`: BPM, batidas (mudanças de estado), downbeats (momentos grandes) e picos (efeitos sonoros). |
| `cues.mjs` | Gera a cue sheet de som a partir do tempo da própria animação (`window.CUES`, `window.DUR`, `window.FPS`), para o som nunca depender de frames digitados à mão. |
| `sfx.mjs` | Efeitos sintetizados do curso (click, pop, thump, whoosh). Fica só como fallback sem internet, porque soa "beep barato". |
| `exemplos/launch-clip.html` | Demo pronta de um clipe de lançamento, aprovada em 2 rodadas de crítica, com o resultado em `exemplos/aprovado/`. |

### Som

| Ferramenta | O que faz |
|---|---|
| [opus-sound-layer](biblioteca/refs/repos/opus-sound-layer/) (submódulo) | `sfx.py` busca e mostra sons do kit numa folha visual (o Claude não ouve, então escolhe olhando), `mix.py` mixa os cues na timeline a −14 LUFS e `qa.py` mede sincronia, audibilidade, loudness e movimento e gera o `qa.png`. |
| [biblioteca/som/kit/](biblioteca/som/kit/) | 1.139 gravações reais CC0 (Kenney + Freesound) em 19 tipos (hit, whoosh, click, riser…), com `catalog.json` e `CREDITS.md`. Os downloads originais ficam em `_raw/`. |
| [biblioteca/som/musica/](biblioteca/som/musica/) | Loop de música CC0 de teste, com as batidas já medidas. |

### Regras, prompts e skill

| Ferramenta | O que faz |
|---|---|
| [CLAUDE.md](biblioteca/04-regras/CLAUDE.md) | Regras da casa, lidas pelo Claude Code em toda execução: contrato de render, estilos proibidos, regras de tempo e de som e o loop de crítica. |
| [03-prompts/](biblioteca/03-prompts/) | Os padrões de prompt do curso, o sound layer e o `critique-pass.txt`. |
| [motion-reel](biblioteca/05-skills/motion-reel/SKILL.md) | Skill do Claude Code com o pipeline completo: coleta assets, guia de estilo, música, shot list, build, crítica, som e entrega. |

### Outras rotas (frameworks e referências)

O curso define 4 rotas: **A** código puro (esta engine, a que o Opus escolhe sozinho), **B** framework, **C** misto (modelos de imagem, vídeo e voz + código) e **D** edição de footage. Detalhes e comandos em [01-rotas/](biblioteca/01-rotas/README.md).

| Ferramenta | O que faz |
|---|---|
| [Remotion](biblioteca/refs/repos/skills/) | Framework React. Melhor para séries, templates e vídeos guiados por dados. Skills `/remotion-create`, `/remotion-render`… |
| [HyperFrames](biblioteca/refs/repos/hyperframes/) | Framework HTML + GSAP, para quem pensa em páginas web. Skills como `product-launch-video` e `music-to-video`. |
| [claude-animation-skill](biblioteca/refs/repos/claude-animation-skill/) | Plugin para visual desenhado à mão em Node canvas, sem GPU. |
| [ClaudeAnimationBase](biblioteca/refs/repos/ClaudeAnimationBase/) e [PDoomVideo](biblioteca/refs/repos/PDoomVideo/) | Starter e clipe completo de John Heibel. Mostram o padrão de subagentes por capítulo (`ANIMATION_GUIDE.md` + `STORYBOARD.md`). |
| [Battle-of-Austerlitz-Film](biblioteca/refs/repos/Battle-of-Austerlitz-Film/) | Filme de 5 minutos em WebGL. Referência de formato longo. |
| [awesome-ai-motion](biblioteca/refs/repos/awesome-ai-motion/) e [awesome-opus-5-5-videos](biblioteca/refs/repos/awesome-opus-5-5-videos/) | Biblioteca com 114 prompts e dataset de 424 posts do trend. |

Os exemplos reais citados no artigo, com o texto e o prompt de cada post, estão no [catálogo](biblioteca/06-exemplos/catalogo.md).

## O que ficou fora do repositório

- **Vídeos de exemplo:** só o [01_claudeai.mp4](biblioteca/06-exemplos/videos/01_claudeai.mp4) e o [04_stephanlivera.mp4](biblioteca/06-exemplos/videos/04_stephanlivera.mp4) estão versionados. Os outros estão linkados no [catálogo](biblioteca/06-exemplos/catalogo.md), com o post original no X.
- `node_modules/` e `motion.rar`.
