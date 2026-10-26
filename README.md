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

## O que ficou fora do repositório

- **Vídeos de exemplo:** só o primeiro ([01_claudeai.mp4](biblioteca/06-exemplos/videos/01_claudeai.mp4)) está versionado. Os outros estão linkados no [catálogo](biblioteca/06-exemplos/catalogo.md), com o post original no X.
- `node_modules/` e `motion.rar`.
