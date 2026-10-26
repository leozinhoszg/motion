# Biblioteca de motion com Opus 5.5

Tudo o que o curso **[How to build motion design studio with Opus 5.5](https://movez.substack.com/p/how-to-build-motion-design-studio)** (Movez, 4 out. 2026) cita, organizado para reuso. Inclui uma engine da rota A pronta e testada no Windows.

> *"The prompt is 10% of the video. The other 90% is the harness."*

## Estrutura

| Pasta | Conteúdo |
|---|---|
| [00-curso/](00-curso/) | Artigo completo (`artigo.md`), os diagramas das 4 rotas e o infográfico "Motion Engineering" |
| [01-rotas/](01-rotas/README.md) | **As 4 rotas** (A código · B framework · C misto · D footage) com os comandos de cada uma |
| [02-engine/](02-engine/) | Engine da rota A **testada**: `index.html` (seek), `lib/motion.js` (springs, interpolate), `lib/components.js` (timeline em frames, janela de leitura, entradas, cursor, texto), `render.mjs`, `cues.mjs` (cue sheet de som a partir da página), `beats.py`, `qa.ps1` (inclui frames de revisão e capa), `sfx.mjs` (só fallback) |
| [02-engine/exemplos/](02-engine/exemplos/launch-clip.html) | Demo `launch-clip.html` (reveal → press → result → hold → cut), aprovada em 2 rodadas de crítica de imagem e com o QA de som aprovado; em `aprovado/`: MP4 mudo e **com som**, capa, contact sheet, `qa.png`, `LISTEN.md` e créditos |
| [03-prompts/](03-prompts/) | Os 6 padrões de prompt + o **sound layer** (07) + `critique-pass.txt` |
| [som/](som/) | **Kit de 1.139 sons CC0** (19 tipos, `catalog.json`, `CREDITS.md`), compartilhado entre projetos, e loops de música CC0 com créditos e beats |
| [04-regras/CLAUDE.md](04-regras/CLAUDE.md) | Regras da casa: copiar para a raiz de cada projeto de vídeo |
| [05-skills/motion-reel/](05-skills/motion-reel/SKILL.md) | A skill que empacota o pipeline inteiro |
| [06-exemplos/](06-exemplos/catalogo.md) | **Catálogo dos 20 posts** do curso, com texto integral (incluindo os prompts originais) e os vídeos em `videos/` (no repositório git só vão o 01 e o 04; os demais têm link para o post) |
| [refs/](refs/README.md) | 9 repositórios clonados (incluindo o opus-sound-layer), entre eles os 114 prompts do awesome-ai-motion e as 30+ skills do HyperFrames e do Remotion |

## Escolha o padrão de prompt pelo objetivo

| Quero… | Prompt | Rota |
|---|---|---|
| Testar se o setup funciona | [01-one-liner](03-prompts/01-one-liner.md) | A |
| Vídeo do nosso produto | [02-brand](03-prompts/02-brand.md) | A (ou C, com voz) |
| Copiar a "gramática" de um vídeo que admiro | [03-reference](03-prompts/03-reference.md) | qualquer |
| Motion de UI premium, em loop | [04-spec-xml](03-prompts/04-spec-xml.md) | A |
| Clipe de lançamento de **uma ação**, revisável em frames, para vender | [06-launch-clip](03-prompts/06-launch-clip.md) | A (ou B) |
| Filme longo, clipe musical, personagens | [05-director-brief](03-prompts/05-director-brief.md) | C |
| **Som de verdade** em qualquer vídeo da rota A ou B | [07-sound-layer](03-prompts/07-sound-layer.md) | A/B |
| Vestir um vídeo gravado (legendas, cards, PiP) | [01-rotas → D](01-rotas/README.md#d--edição-de-footage-seus-clipes-cortes-legendas-b-roll-pip) | D |

## Começar um projeto novo (rota A)

```powershell
$p = 'D:\DESIGN\motion\projetos\meu-video'
Copy-Item -Recurse D:\DESIGN\motion\biblioteca\02-engine $p
Copy-Item D:\DESIGN\motion\biblioteca\04-regras\CLAUDE.md $p
New-Item -ItemType Directory -Force "$p\prompts", "$p\.claude\skills" | Out-Null
Copy-Item D:\DESIGN\motion\biblioteca\03-prompts\critique-pass.txt "$p\prompts"
Copy-Item -Recurse D:\DESIGN\motion\biblioteca\05-skills\motion-reel "$p\.claude\skills"
cd $p; claude --model claude-opus-5-5     # /model → effort xhigh (filme novo) ou max (peça principal)
```

O Playwright é resolvido pelo `node_modules` de `D:\DESIGN\motion`, então os projetos devem ficar dentro dessa pasta. Se ficarem fora, rode `npm i -D playwright` no projeto.

## Ambiente (instalado em 13 out. 2026)

Node 24.19 · ffmpeg 9.0.2 (winget) · Python 3.14 (`py`) + librosa 1.0 · Playwright 1.64 + Chromium 156 · uv 0.13 (winget, para os scripts do sound layer).

Resultado do teste da engine: 6 s em 1080×1920 a 30 fps com 4 subframes renderizou em cerca de 62 s; **teste de determinismo aprovado** (hashes MD5 idênticos); `beats.py` detectou 119,7 BPM e todos os hits; mixagem a −14 LUFS OK.

## Fontes além do curso
- Post no X "Motion Engineering with Opus 5.5: Build Launch Videos You Can Sell" + infográfico: base do [06-launch-clip](03-prompts/06-launch-clip.md). O "full guide" citado no post não foi localizado.
- [aiidelist.com/blog/opus-5-5-motion-design](https://aiidelist.com/blog/opus-5-5-motion-design): regras numéricas de tempo (hold ≥ 1,2 s, pausa antes do reveal, tempo morto ≤ 0,5 s), revisão P0/P1/P2 e zonas seguras.
- "Sound design for Opus 5.5: no more cheap beeps" (0xCodila, 9 out. 2026) + [Bodila51/opus-sound-layer](https://github.com/Bodila51/opus-sound-layer) (MIT; sons CC0 da Kenney e do Freesound): base do [07-sound-layer](03-prompts/07-sound-layer.md). Código revisado antes de rodar: só baixa de kenney.nl, freesound.org e api.openverse.org, e só executa o ffmpeg.

## Lacunas conhecidas
- O `critique-pass.txt` original não foi publicado; o daqui é nossa versão, montada a partir da seção 11.
- A rota D só aparece na tabela do curso; o guia dela é complemento nosso.
- Os presets de spring `heavy` e `playful` não têm valores no artigo; os de `lib/motion.js` são pontos de partida para calibrar.
- Os posts do X têm só o primeiro tweet. Prompts que continuam nas respostas (o 2º reply do Tony Dinh, a thread do twoclipping) precisam ser abertos no X.
