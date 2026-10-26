# Plano de estudo: motion design com Opus 5.5 (método Movez)

Fonte principal: [How to build motion design studio with Opus 5.5](https://movez.substack.com/p/how-to-build-motion-design-studio) (Movez, 4 out. 2026)

**Material de apoio:** [biblioteca/](biblioteca/README.md) reúne o artigo, as 4 rotas, a engine testada, os prompts, as regras, a skill, o catálogo dos 20 posts com 18 vídeos e 8 repositórios. Os Módulos 0 a 4 abaixo já têm código pronto em `biblioteca/02-engine/`. Daqui em diante, o estudo é de **direção** (Módulos 5 a 9), não de infraestrutura.

> O curso define **4 rotas** (A código · B framework · C misto · D footage). Este plano aprofunda a rota A; as outras três estão em [biblioteca/01-rotas/](biblioteca/01-rotas/README.md).

## A tese em uma linha

> "The prompt is 10% of the video. The other 90% is the harness."

Os bons motions do Movez não saem de prompts mágicos. Eles saem de um **harness**: o Opus escreve código (HTML/Canvas), um renderer transforma o código em vídeo e um **loop de crítica** força o modelo a olhar os próprios frames e corrigir os problemas antes do render final. O que vamos replicar é esse harness, não os prompts.

```
brief ──► Opus escreve index.html (window.seek(t)) ──► render.mjs (Playwright + ffmpeg)
  ▲                                                          │
  └──── corrige os 3 piores problemas ◄── contact sheet + nota 1–10 ◄┘
```

---

## Stack técnica

| Camada | Ferramenta | Função |
|---|---|---|
| Modelo | Claude Opus 5.5 no Claude Code (`claude --model claude-opus-5-5`) | Escreve o filme como código. Effort: *medium* para ajustes, *xhigh* para filmes novos, *max* para peças principais |
| Engine | HTML + Canvas 2D com `window.seek(t)` (Rota A, padrão) | Cada frame é uma função pura do tempo |
| Captura | Playwright + Chromium headless | Chama `seek(t)` e faz screenshot do canvas |
| Encode | ffmpeg (libx264, CRF 16, yuv420p, `tmix` para motion blur) | Gera o MP4 |
| Áudio | Python + librosa / numpy / soundfile (`beats.py`), Node (`sfx.mjs`) | Detecta beats e sintetiza SFX no grid |
| Alternativas | Remotion (React), HyperFrames (HTML + GSAP), p5.brush (visual pintado à mão) | Rotas opcionais |
| Opcionais | ElevenLabs (voz), Seedance 2.5 via FAL (planos base para "generate-then-trace") | Só no "director's brief" |

### Situação do nosso ambiente (instalado e testado em 13 out. 2026)

- ✅ Node v24.19 (o artigo pede 22 ou mais)
- ✅ **ffmpeg 9.0.2** (`winget install Gyan.FFmpeg`). Abra um terminal novo (ou reinicie o VS Code) para ele entrar no PATH.
- ✅ **Python 3.14.7**, acessível por **`py`** (o comando `python` ainda abre a Microsoft Store), com librosa 1.0.0, numpy 2.5.4 e soundfile 0.14.0. Rodar os scripts com `py beats.py`.
- ✅ **Playwright 1.64** no `package.json` do projeto, com Chromium 156 baixado. O teste de screenshot do canvas passou.
- ⚠️ Windows: o artigo usa `md5`, que é do macOS. Aqui o equivalente é `Get-FileHash -Algorithm MD5` (PowerShell) ou `certutil -hashfile`.

---

## Módulos de estudo

Cada módulo tem uma meta concreta. Só se avança quando o entregável funciona.

### Módulo 0: Setup (meio dia)
- Instalar ffmpeg, Python e Playwright (veja acima).
- Clonar as referências para estudo, cada uma em `refs/repos/` (só leitura):
  - `JohnHeibel/ClaudeAnimationBase`: starter com p5.brush, `ANIMATION_GUIDE.md`, `render.mjs` e `studio.html`
  - `JohnHeibel/PDoomVideo`: o clipe musical completo, com capítulos em `src/ch/` feitos por subagentes
  - `WinterArc21/Battle-of-Austerlitz-Film`: exemplo de formato longo
  - `heygen-com/hyperframes`: rota HTML + GSAP
- **Entregável:** `node render.mjs --clip` do ClaudeAnimationBase gera um MP4 na nossa máquina.

### Módulo 1: Contrato de render, o "filme como função do tempo" (1 dia)
Conceito central: o `index.html` expõe `window.seek(t)`, que pinta **exatamente** o frame do instante `t`. As cenas são objetos `{start, end, draw(localT)}`.

Regras de determinismo (são as que mais quebram):
- Proibido `Math.random`. Usar um PRNG com seed (`mulberry32`).
- Proibido `setTimeout`, `requestAnimationFrame` e transições CSS no modo render.
- Nenhum estado carregado entre frames: o frame 300 não pode depender do 299.
- O preview ao vivo só roda quando `navigator.webdriver === false`.
- Esperar `document.fonts.ready` antes de capturar (texto no canvas precisa da fonte carregada).

**Entregável:** um `index.html` de 5 s, 1080×1920, com 3 cenas, que se pode "scrubbar" no browser.

### Módulo 2: Pipeline de render (1 dia)
`render.mjs`, com os argumentos `--fps 60 --dur 15 --sub 4`:
1. Playwright abre o Chromium headless em 1080×1920 com `deviceScaleFactor: 1`.
2. Para cada subframe `i`, chama `seek(i / (FPS*SUB))`, tira screenshot de `#c` e escreve o PNG no stdin do ffmpeg, respeitando o backpressure.
3. O ffmpeg lê `image2pipe` a FPS×SUB, o `tmix` mistura cada grupo de SUB subframes (motion blur) e o `select` mantém 1 frame por grupo.
4. Saída: `libx264 -crf 16 -pix_fmt yuv420p out/silent.mp4`.

**Teste de determinismo:** renderizar 5 s duas vezes com `--sub 1` e comparar os hashes. Se forem diferentes, há estado ou aleatoriedade escondida.

**Entregável:** `render.mjs` funcionando no Windows e com o teste de hash passando.

### Módulo 3: Movimento com springs em forma fechada (2 dias)
Este é o segredo do "feel". Os springs são calculados analiticamente, então qualquer frame pode ser renderizado sem simular os anteriores.

- `spring(t, k, d)` de 0 a 1, com ω₀ = √k e ζ = d/(2ω₀):
  - subamortecido (ζ < 1): `1 − e^(−ζω₀t)·(cos(ω_d t) + (ζω₀/ω_d)·sin(ω_d t))`, com ω_d = ω₀√(1−ζ²)
  - crítico (ζ ≥ 1): `1 − e^(−ω₀t)(1 + ω₀t)`
- `track(t, keys, k, d)`: soma **um spring por mudança de valor**, sem reiniciar. Assim o movimento fica contínuo e "seekável".
- `indicator()`: a borda da frente é rígida (k 320, d 30) e a de trás é mole (k 140, d 22), o que faz o elemento esticar.
- `swapAlpha(t, tIn, tOut)`: o texto entra logo depois do início do morph e sai antes do próximo, sem sobreposição.
- `loopT(t, dur)`: módulo positivo. O último frame tem que ser igual ao primeiro.

| Preset | k | d | Uso |
|---|---|---|---|
| default | 170 | 26 | cards, câmera |
| title | 220 | 22 | tipografia cinética |
| grid | 260 | 20 | stagger de grid |
| snappy / leading | 320 | 30 | botões, toggles |
| trailing | 140 | 22 | borda de trás |
| heavy / playful | a calibrar | | logos grandes / mascotes com overshoot visível |

**Entregável:** `lib/motion.js` mais uma página de teste com os presets lado a lado. Calibrar *heavy* e *playful* a olho.

### Módulo 4: Som no grid (1–2 dias)
- `beats.py`: o librosa detecta BPM, `beats` (mudanças de estado), `downbeats` (a cada 4 beats, para os momentos grandes) e `hits` (picos de onset, para SFX). Tudo vai para `beats.json`.
- `sfx.mjs`: a partir de uma lista de cues `{t, type}`, gera um WAV de 48 kHz, 16 bits, mono:
  - click: seno de 1800 Hz, cerca de 0,05 s
  - pop: seno ascendente, cerca de 0,15 s
  - thump: grave descendente, cerca de 0,5 s
  - whoosh: ruído com envelope, cerca de 0,35 s, gerado por um LCG com seed
- Sem trilha fornecida, a música também é sintetizada em código (tempo fixo, por exemplo 120 BPM).
- Mix final normalizado a **−14 LUFS**:
  `ffmpeg -i out/silent.mp4 -i audio/mix.wav -c:v copy -c:a aac -af loudnorm=I=-14:TP=-1 -shortest out/final.mp4`

**Entregável:** um vídeo de 10 s em que todo corte e todo "hit" visual cai em um timestamp do `beats.json`.

> **Atualização (13 out. 2026):** os efeitos sintetizados acima soam "beep barato". O padrão agora é o **sound layer** ([biblioteca/03-prompts/07-sound-layer.md](biblioteca/03-prompts/07-sound-layer.md)): gravações reais CC0 (kit de 1.139 sons em `biblioteca/som/kit`), cues derivados da timeline (`window.CUES` + `cues.mjs`), `mix.py` a −14 LUFS e `qa.py`, que confere sincronia, audibilidade e o movimento da imagem. O `sfx.mjs` fica só como fallback sem internet.
>
> **Entregável revisado:** sonorizar um clipe com o sound layer até o `qa.py` passar em no máximo 2 rodadas, e entregar o `LISTEN.md` com 5 timecodes para alguém conferir de ouvido. Referência: `biblioteca/02-engine/exemplos/aprovado/launch-clip_LISTEN.md`.

### Módulo 5: Direção de arte, as regras da casa (1 dia)
Escrever o **nosso** `CLAUDE.md` na raiz do projeto, em quatro seções:
1. **Contrato de render:** função pura do tempo, sem timers, CRF 16 yuv420p.
2. **Look:**
   - *Banidos:* título centralizado sobre gradiente, tudo entrando com fade, labels nos cantos e bordas de frame, glow em UI, explosões genéricas de partículas.
   - *Obrigatórios:* 1 fonte display, 1 fonte de UI, 1 cor de destaque e algo novo a cada 2–4 s.
3. **Som:** sintetizado se não houver trilha, hits no `beats.json`, −14 LUFS.
4. **Loop:** contact sheet com 1 frame por beat, nota, correção dos 3 piores problemas e repetição até todas as notas serem 8 ou mais. Só então o render completo.

Adaptar a lista de banidos ao nosso brand (fontes, cor de destaque, grid).

### Módulo 5b: Tempo, leitura e reuso (método "Motion Engineering", 1 dia)
Fonte: post no X e infográfico, guardados em [biblioteca/03-prompts/06-launch-clip.md](biblioteca/03-prompts/06-launch-clip.md).
- **Timeline em frames com eventos nomeados** (reveal → press → result → hold → cut). As revisões de tempo editam a tabela, não o código.
- **Janela de leitura:** cada texto fica legível pelo tempo de `readingHold()` (mínimo de 1,2 s), e o corte é derivado do hold.
- **Revisão com escopo:** primeiro "não reescreva nada", depois P0/P1/P2, e só P0 e P1 são implementados; tudo em frames.
- **Reuso:** entradas, cursores e textos aprovados vão para `lib/components.js`.

**Entregável:** refazer a demo `launch-clip.html` com um produto nosso, em uma rodada de revisão com escopo, mais a capa.

### Módulo 6: O loop de crítica, a parte que faz o vídeo "viralizar" (2 dias)
Ferramentas de inspeção (o Opus as roda e lê as imagens geradas):

| Checagem | Comando ffmpeg |
|---|---|
| Contact sheet | `-vf "fps=2,scale=270:-1,tile=6x5" -frames:v 1 out/contact.png` |
| Strip de ação (12 frames seguidos perto de uma ação rápida) | `-ss 4.2 -vf "scale=320:-1,tile=12x1" -frames:v 1` |
| Teste de celular (360 px) | `-vf "fps=1,scale=360:-1,tile=5x3"` |
| Emenda do loop | `-stream_loop 1 -i out/final.mp4 -c copy out/loop_check.mp4` |
| Determinismo | 2 renders com `--sub 1` e hashes iguais |

Rubrica (nota de 1 a 10): **hook nos 2 primeiros segundos · legibilidade no celular · qualidade do movimento (springs, sem frames mortos) · variedade · composição · fidelidade à marca · sincronia com o som**

Lista de defeitos a caçar: texto sobreposto em trocas, deslizamento linear em vez de easing, labels nos cantos, plano centralizado sobre gradiente, texto escalado e borrado, beats mortos, engasgo na emenda do loop.

Criar `prompts/critique-pass.txt`, que o artigo cita mas não publica. Esboço:
> "Você é um diretor de motion exigente. Renderize o contact sheet, o strip e o teste de 360 px. Dê nota de 1 a 10 em cada critério da rubrica. Liste os 3 maiores problemas com timestamp. Corrija só esses, re-renderize só os segundos afetados e registre a rodada em docs/review_log.md."

**Entregável:** um filme que passou por pelo menos 3 rodadas registradas em `docs/review_log.md`, com notas crescentes.

### Módulo 7: Padrões de prompt (2 dias, um exercício por padrão)
1. **One-liner showreel:** "make a dynamic 15-second motion graphics video that shows what an incredible motion designer you are…". Estudar por que cada termo funciona: gênero, assunto, duração e o "multiplicador de esforço". Cuidado com o *brief contagion* (o modelo copia literalmente palavras do brief para a tela).
2. **Brand reel:** URL do produto, assets reais coletados pelo Playwright em `./assets` e uma feature por beat. As chaves ficam no `.env`, nunca no prompt.
3. **Guiado por referência:** frames, vídeo ou imagens em `refs/`. O ffmpeg extrai frames, o modelo escreve `docs/style_guide.md` e `docs/shotlist.md` e **espera aprovação** antes de codar.
4. **Spec em XML:** tags `<inputs> <direction> <structure> <build> <gotchas> <start>`. Conceito do exemplo: "uma forma, nunca corta". Um único elemento muda de forma através dos estados de UI, guiado por um cursor, e o último frame é igual ao primeiro.
5. **Director's brief:** logline, referências, character bible, beat sheet, regras de texto, gates de aprovação e entregáveis. Técnica-chave: **generate-then-trace**. Um modelo de vídeo (Seedance) gera os planos base e o Opus os redesenha em JS.

### Módulo 8: Multiformato (1 dia)
As cenas são escritas contra uma função de `layout(format)`, não contra pixels fixos. Os formatos 9:16, 1:1 e 16:9 saem de **uma mesma timeline**. A tipografia é reenquadrada para cada formato; nada é cortado.

### Módulo 9: Empacotar como skill (1 dia)
Criar `.claude/skills/motion-reel/SKILL.md`:
- **Gatilho:** launch video, showreel, product reel, explainer, motion ad
- **Inputs:** produto/URL, duração, formatos, marca, referência, música
- **Pipeline:** assets → style guide → beats → shot list (com gate de aprovação) → `index.html` com seek → rodadas de crítica → render + mix → entrega
- **Regras rígidas:** só UI real do produto, sem `Math.random`, sem timers ou transições CSS, looks banidos

Para filmes longos, usar o padrão do PDoom: dividir em capítulos (`src/ch/`) e paralelizar com subagentes.

### Módulo 10 (opcional): Rotas alternativas
- **HyperFrames:** `npx skills add heygen-com/hyperframes` e depois `npx hyperframes init / preview / render`. Composições HTML com timeline GSAP pausada registrada em `window.__timelines`. Bom para quem já domina GSAP.
- **Remotion:** skills em remotion.dev/docs/ai/skills. Bom se o time já trabalha com React.
- **p5.brush (ClaudeAnimationBase):** estética pintada à mão e personagens. Exige GPU, porque os preenchimentos em aquarela são lentos sem ela.

---

## Estrutura do projeto que vamos montar

```
motion/
├── CLAUDE.md               # regras da casa (Módulo 5)
├── index.html              # engine seek(t)
├── lib/motion.js           # springs, track, indicator, swapAlpha, loopT
├── render.mjs              # Playwright → ffmpeg
├── beats.py  sfx.mjs       # áudio
├── prompts/critique-pass.txt
├── .claude/skills/motion-reel/SKILL.md
├── docs/  style_guide.md  shotlist.md  review_log.md
├── refs/  assets/  audio/  # referências, assets reais, trilha
├── .env                    # chaves (FAL_KEY, ElevenLabs)
└── out/   final.mp4  contact.png  poster.png  loop_check.mp4
```

## Cronograma sugerido (cerca de 3 semanas)

| Semana | Módulos | Marco |
|---|---|---|
| 1 | 0, 1, 2, 3 | Engine determinística, springs e o primeiro MP4 nosso |
| 2 | 4, 5, 6 | Som no grid, `CLAUDE.md` próprio e loop de crítica com 3 rodadas |
| 3 | 7, 8, 9 | 5 exercícios de prompt, multiformato e a skill `motion-reel` |

**Projeto-piloto final:** um brand reel de 15 s de um produto real da casa, entregue em 9:16, 1:1 e 16:9, com nota de 8 ou mais em todos os critérios e o log de crítica anexado.

## Observações
- O artigo descreve o código, mas não o publica inteiro (o `critique-pass.txt`, por exemplo, não aparece). Os arquivos acima serão **implementações nossas** a partir da descrição e dos repositórios abertos.
- Os prompts públicos (como em `guanmo-ai/awesome-ai-motion`) não garantem o mesmo resultado. Use-os como ponto de partida e conte com iterações.

## Referências
- Artigo: https://movez.substack.com/p/how-to-build-motion-design-studio
- Starter: https://github.com/JohnHeibel/ClaudeAnimationBase
- Clipe musical: https://github.com/JohnHeibel/PDoomVideo
- Skill de canvas Node: https://github.com/buildwithhanif/claude-animation-skill
- HyperFrames: https://github.com/heygen-com/hyperframes
- Remotion AI skills: https://remotion.dev/docs/ai/skills
- Filme longo: https://github.com/WinterArc21/Battle-of-Austerlitz-Film
- Biblioteca de prompts: https://github.com/guanmo-ai/awesome-ai-motion
- Dataset: https://github.com/athemeroy/awesome-opus-5-5-videos
- Contexto do mesmo autor: "Harness engineering with Claude" e "Loop engineering" (arquivo do Movez)
