# Vidéo de lancement (motion design en code)

Vidéo verticale de 20 s (1080 × 1920, 30 i/s), entièrement générée par le code de ce dossier.

- `film.html` : l'animation. `render(t)` dessine l'image au temps `t` (secondes). Textes, couleurs et timings sont en haut de chaque scène.
- `music.py` : la bande-son (piano, nappes, souffles, montée, impact), synthétisée avec numpy, donc libre de droits. Produit `music.wav`.
- `renderer.cjs` : rend les 600 images avec Playwright et les encode avec ffmpeg.

```bash
cd video
python3 music.py                      # → music.wav
node renderer.cjs stills 3 7.5 13     # images de contrôle still-*.png
node renderer.cjs full silent.mp4     # vidéo sans son
ffmpeg -i silent.mp4 -i music.wav -c:v copy -c:a aac -b:a 256k -shortest lancement.mp4
```

Pour ajouter la voix off : l'importer dans un monteur (CapCut, Premiere) au-dessus de `lancement.mp4`, en baissant la musique de 6 à 8 dB sous la voix. Texte et calage dans `docs/video-promo-20s.md`.
