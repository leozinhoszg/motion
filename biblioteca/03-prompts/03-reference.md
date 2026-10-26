# 03 · Guiado por referência

**Seção do curso:** 05 · **Rota:** qualquer uma · **Effort:** xhigh
**Exemplos:** [catálogo](../06-exemplos/catalogo.md) #09 (@rexan_wong: por que todo "one prompt" fica igual), #17 (@pleometric, galeria PC-98 própria)

Sem referência, o Opus volta ao padrão dele: texto centralizado, fundo em gradiente e tudo entrando com fade. **Dar nome a um estilo funciona melhor que descrevê-lo**, e um frame ou vídeo de referência entrega ritmo, tipografia e transições para copiar.

## Três níveis de referência
1. **Um frame:** um screenshot de um vídeo que você adora. Diga o que pegar (paleta, tipografia, grão) e o que não pegar (o assunto).
2. **Um vídeo:** passe o arquivo e peça para extrair frames com ffmpeg e descrever o ritmo plano a plano **antes** de codar.
3. **Uma biblioteca:** uma pasta com suas imagens ou trabalhos anteriores. Peça primeiro um `style_guide.md`. Uma biblioteca própria é uma referência que ninguém mais consegue copiar.

**Fontes de referência:** [whatships.com](https://whatships.com/) (vídeos de lançamento), Dribbble motion, os filmes de lançamento dos concorrentes e os 18 vídeos em [../06-exemplos/videos/](../06-exemplos/videos/).

## Template

```text
Reference: ./refs/launch.mp4 (and ./refs/frames/*.png)

1. Extract one frame every 0.5s with ffmpeg. Study them.
2. Write ./docs/style_guide.md: palette (hex), type (family, weight, tracking),
   shot lengths, transition types, camera moves, texture/grain, how text enters and exits.
3. Write ./docs/shotlist.md for a [DURATION]s video about [SUBJECT] in THAT style.
   Take the grammar of the reference, never its content, logos or characters.
4. Show me both files. Wait for my OK before any code.
```

Extração manual de frames (Windows):

```powershell
New-Item -ItemType Directory -Force refs\frames | Out-Null
ffmpeg -i refs\launch.mp4 -vf fps=2 refs\frames\f_%04d.png
```

> Dê a referência e deixe o modelo escolher a técnica. Especifique o visual e as restrições, não a biblioteca. Quando o Pleometric sugeriu p5.js, o Opus preferiu escrever o próprio renderer de papel.
