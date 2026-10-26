# py beats.py song.wav beats.json   (a animação lê esse arquivo)
# Curso Movez, seção 09. No Windows, passe o arquivo de saída em vez de usar ">":
# o redirecionamento do PowerShell grava com BOM/UTF-16 e quebra o JSON.parse.
import sys, json, numpy as np, librosa

y, sr = librosa.load(sys.argv[1], sr=None, mono=True)
tempo, frames = librosa.beat.beat_track(y=y, sr=sr, units="frames")
beats = librosa.frames_to_time(frames, sr=sr).round(3).tolist()

onset = librosa.onset.onset_strength(y=y, sr=sr)
peaks = librosa.util.peak_pick(onset, pre_max=3, post_max=3, pre_avg=3,
                               post_avg=5, delta=0.5, wait=10)
data = {
    "bpm": float(np.atleast_1d(tempo)[0]),
    "beats": beats,                                   # mudanças de estado aqui
    "downbeats": beats[::4],                          # momentos grandes aqui
    "hits": librosa.frames_to_time(peaks, sr=sr).round(3).tolist(),  # SFX aqui
}
if len(sys.argv) > 2:
    with open(sys.argv[2], "w", encoding="utf-8") as f:
        json.dump(data, f, indent=1)
else:
    json.dump(data, sys.stdout, indent=1)
