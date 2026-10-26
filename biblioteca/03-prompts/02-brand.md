# 02 · Brand reel (vídeo do produto)

**Seção do curso:** 04 · **Rota:** A (ou C, com voz/mascote) · **Effort:** xhigh
**Exemplos:** [catálogo](../06-exemplos/catalogo.md) #07 (@tdinh_me, TypingMind em menos de 30 min no lugar de um vídeo de ~US$1.000), #08 e #20 (@achxvi, mascote com voz do ElevenLabs)

O que fez a diferença no caso do Tony Dinh foram três linhas a mais: a **URL do produto**, *"use actual product screenshot, logo, assets"* e *"must have music"*.

**Mantenha uma sessão do Claude Code por marca.** A partir do segundo vídeo, o renderer, o sintetizador de áudio e o export já existem na sessão, e tudo fica mais rápido.

## Template

```text
Make a dynamic 20-second motion graphics video for [PRODUCT] ([URL]), with the energy
of a motion designer's showreel. Go all out.

Assets
- Visit the site. Use real screenshots (Playwright), the real logo, real colors and fonts.
  Save everything to ./assets and list what you found before you animate.
- Never redraw the product UI from imagination. Crop and animate the real thing.

Story (one beat each, 2 to 4 seconds)
1. Hook: the problem in 5 words of huge kinetic type.
2. The product appears, the UI assembles itself piece by piece.
3. Three features, each as a UI moment with a cursor doing a real action.
4. One number that proves it works: [METRIC].
5. Logo lockup + [CTA].

Sound
- Original music, 120 BPM, synthesized in code. UI clicks and whooshes on the beat.

Format: 1080x1920 (9:16) first, then 1:1 and 16:9 from the same timeline.
Before the full render, show me a contact sheet of one frame per beat.
```

## Upgrade: mascote com voz (rota C)

Acrescente ao template:

```text
The ElevenLabs key is ELEVENLABS_API_KEY in .env. Create a mascot character in [STYLE]
who explains the product in [LANGUAGE]. Generate the voice line per beat, then time the
animation to the measured voice, not the other way around.
```

**Regra:** a chave fica no `.env` e nunca é colada no prompt (os prompts acabam virando screenshots).
