# LISTEN: launch-clip_som.mp4

O QA (`qa.py`) passou com **0 falhas e 0 avisos**: loudness −14,08 LUFS, true peak −2,0 dBTP, todos os cues sincronizados a 0 frame, todos audíveis (≥ 1,5 dB na própria banda) e os 4 cues de imagem batendo com o movimento real. As medições **não garantem** que soa bem. Confira estes 5 pontos de ouvido, de preferência no celular **e** em fone.

| # | Timecode | O que ouvir | O que as medições dizem |
|---|---|---|---|
| 1 | **0:01.28** | O "card slide" no card subindo. Soa como papel/cartão ou como chiado agudo? | Pico no frame 38, junto com o pico de movimento; sobressai só 1,9 dB, em 4–8 kHz (o mais baixo do filme). |
| 2 | **0:01.88 → 0:02.61** | As 5 teclas. Soam como digitação natural (dois sons alternados) ou como metralhadora? Muito altas? | As teclas 1, 3 e 4 sobressaem 6 dB em 4–8 kHz, bem mais que as outras: confira se não ficaram "na cara". |
| 3 | **0:03.90 → 0:04.47** | Clique → música **para** por 0,4 s → **hero** (baque + toque) quando as barras sobem. A pausa parece intencional ou parece defeito? O baque tem peso? | Corpo do hero +3,5 dB em 125–250 Hz (mínimo 3). Em caixa de som de celular, quase nada abaixo de 150 Hz se ouve; o toque de plástico é que vai carregar o hit. |
| 4 | **0:06.40 → 0:06.80** | Segunda pausa da música + swell reverso entrando no logo. O swell aparece ou some? | O swell foi atenuado (x0.6) por cair junto com o logo e sobressai 3,5 dB em 2–4 kHz. |
| 5 | **0:08.00 → 0:08.90** | Final: a música desce em 1 s de fade. Termina limpo ou corta? | Sem silêncio não planejado; o fade-out é o padrão do `mix.py` (`fade_out_s: 1.0`). |

## Histórico do QA
- **Rodada 0:** 11 falhas. O cue do resultado estava no morph do botão, pequeno demais para contar como movimento. O logo estava marcado como `land`, mas ele surge junto com a saída do card. As teclas estavam a 0,136 s umas das outras e eram atenuadas como grupo. Os heros não sobressaíam no modo `calm`.
- **Rodada 1:** 1 falha. Hero movido para o pico das barras, com `stop_before`; logo como `appear` e support (um hero a cada ~4 s); teclas a 0,18 s; energia `punchy` (−14 LUFS). Sobrou a tecla 5, com 1,3 dB em 1–2 kHz, embaixo da guitarra.
- **Rodada 2:** aprovado. A tecla "keyboard5" (~2 kHz) foi trocada por "keyboard typing 001" (~3,4 kHz).

Créditos: [launch-clip_CREDITS.md](launch-clip_CREDITS.md) · Cue sheet: [launch-clip_cues.json](launch-clip_cues.json) · Gráfico: [launch-clip_qa.png](launch-clip_qa.png)
