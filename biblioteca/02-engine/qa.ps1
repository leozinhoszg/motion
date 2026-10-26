# Checagens do loop de crítica (curso Movez, seção 11), versão Windows/PowerShell.
#   .\qa.ps1                       contact sheet, strip, teste de celular e emenda do loop de out/final.mp4
#   .\qa.ps1 -Video out\silent.mp4 -StripAt 4.1
#   .\qa.ps1 -Determinism          renderiza 5 s duas vezes com --sub 1 e compara os hashes
#   .\qa.ps1 -Mix audio\mix.wav    junta out/silent.mp4 + áudio normalizado a -14 LUFS em out/final.mp4
#   .\qa.ps1 -Frames 'opening=0.3,product=4.3,closing=9.5'   frames de revisão nomeados em out\review_<nome>.png
#   .\qa.ps1 -Cover 5.5            capa em resolução cheia em out\poster.png
param(
  [string]$Video = 'out\final.mp4',
  [double]$StripAt = 4.1,
  [switch]$Determinism,
  [string]$Mix,
  [string]$Frames,
  [double]$Cover = -1
)
$ErrorActionPreference = 'Stop'
$ff = Join-Path $env:LOCALAPPDATA 'Microsoft\WinGet\Links\ffmpeg.exe'
if (-not (Test-Path $ff)) { $ff = 'ffmpeg' }
New-Item -ItemType Directory -Force out | Out-Null
$inv = [Globalization.CultureInfo]::InvariantCulture

if ($Frames -or $Cover -ge 0) {
  if ($Frames) {
    foreach ($pair in $Frames.Split(',')) {
      $name, $at = $pair.Split('=')
      & $ff -y -loglevel error -ss $at.Trim() -i $Video -frames:v 1 -vf 'scale=540:-1' "out\review_$($name.Trim()).png"
      Write-Output "out\review_$($name.Trim()).png  (t=$($at.Trim())s)"
    }
  }
  if ($Cover -ge 0) {
    & $ff -y -loglevel error -ss $Cover.ToString($inv) -i $Video -frames:v 1 out\poster.png
    Write-Output "out\poster.png  (t=$($Cover.ToString($inv))s)"
  }
  return
}

if ($Mix) {
  & $ff -y -loglevel error -i out\silent.mp4 -i $Mix -c:v copy -c:a aac -b:a 192k `
    -af 'loudnorm=I=-14:TP=-1:LRA=11' -shortest out\final.mp4
  Write-Output 'out\final.mp4 (áudio a -14 LUFS)'
  return
}

if ($Determinism) {
  $hashes = foreach ($i in 1, 2) {
    node render.mjs --dur 5 --fps 60 --sub 1 --out "out\det$i.mp4" | Out-Null
    (Get-FileHash "out\det$i.mp4" -Algorithm MD5).Hash
  }
  if ($hashes[0] -eq $hashes[1]) { Write-Output "DETERMINÍSTICO ($($hashes[0]))" }
  else { Write-Output "NÃO determinístico: $($hashes -join ' != ')"; exit 1 }
  return
}

& $ff -y -loglevel error -i $Video -vf 'fps=2,scale=270:-1,tile=6x5' -frames:v 1 out\contact.png
& $ff -y -loglevel error -ss $StripAt -i $Video -vf 'scale=320:-1,tile=12x1' -frames:v 1 out\strip.png
& $ff -y -loglevel error -i $Video -vf 'fps=1,scale=360:-1,tile=5x3' -frames:v 1 out\phone.png
& $ff -y -loglevel error -stream_loop 1 -i $Video -c copy out\loop_check.mp4
Write-Output 'out\contact.png  out\strip.png  out\phone.png  out\loop_check.mp4'
