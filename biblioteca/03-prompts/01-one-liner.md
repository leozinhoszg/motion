# 01 · One-liner (showreel)

**Seção do curso:** 03 · **Rota:** A · **Effort:** xhigh ou max
**Exemplos:** [catálogo](../06-exemplos/catalogo.md) #04 (@stephanlivera, original em max), #05 (@robj3d3, xhigh com áudio), #06 (@himanshutwtxs)

Serve para **testar o setup**, não a ideia, porque o prompt não contém uma ideia. Rodado centenas de vezes, ele gera reels parecidos entre si (o que o dataset athemeroy chama de *brief contagion*).

## Prompt original

```text
make a dynamic 15-second motion graphics video that shows what an
incredible motion designer you are, like it's your showreel for a résumé.
go all out.
```

### Por que funciona
- **"showreel for a résumé"** define um gênero com regras conhecidas: cortes rápidos, uma técnica nova por plano e o melhor trabalho primeiro.
- **"what an incredible motion designer you are"** faz do modelo o assunto, então ele mostra técnica em vez de explicar um produto e não tem conteúdo para errar.
- **"15-second"** é curto o bastante para uma passada só e longo o bastante para 6 a 8 planos.
- **"go all out"** funciona como multiplicador de esforço, por cima do xhigh ou max.

## Variantes que funcionaram

```text
# Mais longo, com trilha (padrão do reel de piano de 90 s de @kloss_xyz)
make a dynamic 16:9, 60-second motion graphics showreel that shows your real creative limits.
S-tier sound design, no generic synth pads. Compose an original piano score and sync every
cut to it. Export 1080p MP4.

# Guarda-corpo anti-slop (padrão de @1littlecoder)
make a dynamic 10-second motion graphics video that introduces who you are as Opus 5.5.
Avoid frames and text in the corners, the usual giveaways of AI-made video.

# História em vez de técnicas (padrão de @sonnylazuardi)
use your showreel energy, but tell a story: the history of [TOPIC] from [START] to today,
surprise me with the storyboard. 45 seconds, vertical 9:16.

# Persona de agência
make a 30-second showreel as if you were a niche branding studio for startup founders.
Create every graphic from scratch. One accent color. Every shot is a different technique.
```

> Sem instrução explícita, o Opus escolhe a rota A (index.html + seek + Playwright + ffmpeg), mesmo com Remotion ou HyperFrames instalados. Se quiser um framework, peça pelo nome.
