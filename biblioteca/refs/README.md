# Repositórios de referência

Clones rasos (`--depth 1`) de 13 out. 2026. **Só para leitura e estudo.** Não rode `npm install` nem scripts daqui sem revisar antes; para produzir, copie o que interessar para o seu projeto. Para atualizar: `git -C <pasta> pull`.

| Pasta | Origem | Rota | O que estudar |
|---|---|---|---|
| [ClaudeAnimationBase](repos/ClaudeAnimationBase/) | JohnHeibel | A | Starter recomendado pelo autor do PDoom. `ANIMATION_GUIDE.md` (regras + API), `src/core.js` (timing, câmera, luz, papel), `render.mjs` (contact sheets, strips, MP4), `studio.html` (scrub) |
| [PDoomVideo](repos/PDoomVideo/) | JohnHeibel | A | Clipe completo (1,1 mil estrelas). `ANIMATION_GUIDE.md` + `STORYBOARD.md` + capítulos em `src/` = padrão de subagentes |
| [claude-animation-skill](repos/claude-animation-skill/) | buildwithhanif | A | Plugin do Claude Code: ilustração densa em Node canvas, sem GPU. "Detail bible" e o "hábito de olhar" |
| [Battle-of-Austerlitz-Film](repos/Battle-of-Austerlitz-Film/) | WinterArc21 | A | Filme histórico de 5:01 em WebGL, com som sintetizado, voz e legendas `.srt`. Referência de formato longo |
| [hyperframes](repos/hyperframes/) | heygen-com | B / D | Framework HTML + GSAP. 20+ skills em `skills/`, incluindo `product-launch-video`, `music-to-video`, `talking-head-recut` e `embedded-captions` (1,5 GB, com testes) |
| [skills](repos/skills/) | remotion-dev | B / D | 12 skills oficiais do Remotion (`remotion-create`, `-render`, `-captions`, `-saas`…) |
| [opus-sound-layer](repos/opus-sound-layer/) | Bodila51 | todas | **Camada de som**: `sfx.py` (kit de 1.139 sons CC0, browse, search, add), `mix.py` (mix pela timeline, −14 LUFS) e `qa.py` (sincronia, audibilidade, loudness, imagem). **Não editar os scripts.** Kit montado em `biblioteca/som/kit` |
| [awesome-ai-motion](repos/awesome-ai-motion/) | guanmo-ai | todas | Cerca de 788 obras curadas. **114 prompts em `prompts/`** e making-of em `cases/`. Galeria local: `index.html` |
| [awesome-opus-5-5-videos](repos/awesome-opus-5-5-videos/) | athemeroy | todas | Dataset com 424 posts (301 de Opus) e "research findings" (é a origem do termo *brief contagion*). `docs/library.md` |

> Os prompts públicos não garantem o mesmo resultado; servem de ponto de partida.
