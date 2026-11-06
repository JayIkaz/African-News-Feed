# Brand assets

African News Feed logo, 6 November 2026. The map mark comes from a supplied image, `logo-source.png` (1024 x 1024 raster, off-white background, no vector original). The mark was traced to vector. The name beside it is typeset in DM Serif Display and converted to outlines, so every logo file is vector and none depends on a font.

## Colours

Sampled from the source image.

| Use | Hex | Contrast on paper (#F7F5F0) |
|---|---|---|
| Map orange | #D5620D | 3.45:1. Fine for the mark and large graphics. Do not use for text. |
| Green (stripes and name) | #0E471C | 9.95:1 |

Orange on the site's ink (#1A1916) is 4.67:1.

## Files

| File | Where it is used | Notes |
|---|---|---|
| `public/images/logo-horizontal.svg` | Static copy of the header logo, for anywhere that is not the site header | Mark, then the name. The stacked lockup is too small to read in a 56px bar. |
| `public/images/logo-stacked.svg` | Site footer | Name centred under the mark |
| `public/images/logo-mark.svg` | Reference | Mark only, traced from the source |
| `public/images/logo-horizontal.png`, `logo-stacked.png` | Email and social, where SVG is not supported | 1200px wide, transparent background |
| `public/favicon.svg`, `favicon.ico` | Browser tab | Mark centred in a square. The ico holds 16, 32 and 48px. |
| `public/apple-touch-icon.png` | iOS home screen, 180px | Mark on paper at 66% height (iOS fills transparency with black) |
| `public/icon-192.png`, `icon-512.png` | Web manifest | Mark on paper at 70% height |
| `public/icon-maskable-512.png` | Web manifest, Android | Mark at 52% height, inside the safe circle |
| `public/opengraph.jpg` | Link previews, 1280 x 720 | Stacked lockup centred on paper |
| `../africa-news-mobile/assets/images/icon.png` | Mobile app icon and splash, 1024px | Mark on paper at 62% height |

## Typeface

The name is DM Serif Display (400, its only weight), released under the SIL Open Font License 1.1. The letters were shaped with HarfBuzz (kerning on) and drawn as outlines at a cap height of 40% of the mark's height in the horizontal lockup. To change the typeface, retypeset the outlines. The mark and icons do not change. Six options were compared on 6 November; the others were Fraunces 700 and 800, Playfair Display 800, Source Serif 4 700 and Plus Jakarta Sans 800.

## Animation

The header logo is inline SVG (`src/components/brand/BrandLogo.tsx`, generated from the same outlines as `logo-horizontal.svg`) so each letter can move. The map fades up, then the 15 letters rise one after another, in about 1.1 seconds, once per page load. Hovering or focusing the logo sends a small ripple through the letters. Both are switched off in `index.css` for visitors who ask for reduced motion. The files in `public/images` are static.

## Known limits

- The mark is a trace of an AI-looking raster, so its edges follow the source's slightly irregular outline.
- At 16px the three stripes blur into one band. On a dark browser tab the green stripes nearly disappear.
- The orange is below 4.5:1 on paper, so it cannot carry text.

## Still on the old logo

The spec documents in `docs/` describe the previous pulse-line logo and the `--brand-amber` colour, which nothing uses now. `public/images/logo-icon.png` is an older monogram that nothing uses.
