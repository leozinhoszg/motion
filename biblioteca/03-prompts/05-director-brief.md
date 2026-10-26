# 05 · Brief de diretor (produção longa, overnight)

**Seção do curso:** 10 · **Rota:** C (ou A/B para filmes longos só em código) · **Effort:** max
**Exemplos:** [catálogo](../06-exemplos/catalogo.md) #15 e #16 (@donaldjewkes, "Claude Pop", 142 s, 12 h de execução autônoma, **brief completo de ~9.500 caracteres no #16**), #17 (@pleometric, mesmo brief com outra galeria), repositório [PDoomVideo](../refs/repos/PDoomVideo/)

Os briefs longos não descrevem um vídeo; eles **contratam uma equipe**. O do Donald tem cerca de 9.500 caracteres e o do filme "Pip", de @pradeepXkapoor, cerca de 19.000. Os dois seguem o mesmo esqueleto:

| Bloco | Conteúdo |
|---|---|
| Filme em uma linha | Logline e a piada, para que cada decisão possa ser checada contra ela |
| Referências | Vídeo-fonte, música, biblioteca de imagens, repositório de trabalhos anteriores. O que manter e o que forçar |
| Ferramentas e chaves | Skills a carregar, APIs (imagem, vídeo, voz), orçamento. *"Spend it economically."* |
| Character bible | Proporções, paleta amostrada de um model sheet, expressões e uma trava de identidade que sobrevive a qualquer troca de estilo |
| Beat sheet | Atos com timestamps, um payoff visual a cada 3–5 s e um hook nos 2 primeiros segundos |
| Texto na tela | Quando letras ou legendas ficam enormes e quando ficam como legenda. A composição deixa espaço para elas |
| Gates | Plano → rig → stills → animatic → passada completa → polimento → áudio → render. Não pular gates |
| Loop de crítica | Stills, nota, os 3 piores problemas, correção e repetição até todas as notas serem 8 ou mais |
| Entregáveis | MP4 final, loop check, poster, contact sheet e código-fonte limpo com README |

## Técnica-chave: generate-then-trace
Um modelo de vídeo (**Seedance 2.5**, via `FAL_KEY`) gera os planos base com personagens e física. Depois o Opus **redesenha o vídeo inteiro em JavaScript** por cima, e o espectador só vê a camada desenhada em código. O modelo de vídeo resolve o movimento difícil de codar à mão, e a camada JS dá um visual consistente e próprio.

## Padrão de subagentes (PDoom)
O Opus escreve um `docs/ANIMATION_GUIDE.md` para alinhar os subagentes que roda em paralelo e um `STORYBOARD.md` depois da primeira geração, com os capítulos em `src/ch/`. **Peça os dois arquivos pelo nome.**

## Template

```text
You are the director, animator, sound designer and render engineer for a [DURATION] film
made in code. Treat this as a multi-session production. Don't rush to a final render.

## The film in one line
[LOGLINE. What the viewer should feel at the end.]

## References and inputs
- ./refs/ : [video / frames / image library]. Take the grammar, never the content.
- ./audio/track.wav : use it unchanged. Measure beats with beats.py first.
- Skills available: [/remotion-best-practices | /hyperframes | /claude-animation].
- APIs in .env: [ELEVENLABS_API_KEY, FAL_KEY]. Budget: [$X]. Be economical.

## Look
[3-5 lines: palette, type, texture, camera language. Banned looks.]

## Beat sheet
0:00-0:02  hook: [the single most striking image]
0:02-0:10  [act 1]
...        a new visual payoff every 3-5 seconds
[END]      the last frame sets up the first frame (loop)

## Workflow, with gates
1. Write docs/style_guide.md and docs/shotlist.md (every shot: frames, camera, text, SFX).
   Show me the shot list. Then continue without waiting if I don't answer in 10 minutes.
2. Build stills for every shot. Contact sheet. Critique.
3. Animatic at 960x540 with placeholder audio. Fix pacing before polish.
4. Full animation, polish pass, sound pass, final render.
5. Split work across subagents per chapter. Write docs/ANIMATION_GUIDE.md first
   so every subagent codes in the same style.

## Critique loop (every shot, at least 3 rounds)
Render 3-5 stills, score 1-10 on: hook, readability at 360px wide, motion, composition,
depth, sound sync, polish. Log scores + 3 biggest problems in docs/review_log.md. Fix. Repeat
until all are 8+.

## Deliverables
out/final.mp4 · out/loop_check.mp4 · out/poster.png · out/contact.png · README.md
```

> Dica do Donald: ele **ditou** o brief por 5 minutos em vez de digitar. Falar produz briefs mais ricos.
