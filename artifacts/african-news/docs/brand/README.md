# Brand assets

Logo test branch, 6 November 2026. Everything here is derived from one supplied image, `logo-source.png` (1024 x 1024 raster, off-white background). There is no vector original.

## Colours

Sampled from the source image.

| Use | Hex | Contrast on paper (#F7F5F0) |
|---|---|---|
| Map orange | #D5620D | 3.45:1. Fine for the mark and large graphics. Do not use for text. |
| Stripe green | #164E23 | Mark only |
| Wordmark green | #0E471C | 9.95:1 |

Orange on the site's ink (#1A1916) is 4.67:1.

## Files

| File | Where it is used | How it was made |
|---|---|---|
| `public/images/logo-mark.png` | Header, mark only | Cut out of the source, background removed, 3x of 36px tall |
| `public/images/logo-wordmark.png` | Header, beside the mark | Same cut-out, scaled to 0.83 so the lettering reads at header size |
| `public/images/logo-stacked.png` | Footer | The original stacked lockup, background removed |
| `public/favicon.svg` | Browser tab (modern browsers) | The mark, traced to vector and centred in a square |
| `public/favicon.ico` | Browser tab (fallback), 16, 32 and 48px | Rendered from the traced mark |
| `public/apple-touch-icon.png` | iOS home screen, 180px | Mark on paper at 66% height (iOS fills transparency with black) |
| `public/icon-192.png`, `icon-512.png` | Web manifest | Mark on paper at 70% height |
| `public/icon-maskable-512.png` | Web manifest, Android | Mark at 52% height, inside the safe circle |
| `public/opengraph.jpg` | Link previews, 1280 x 720 | Stacked lockup centred on paper |
| `../africa-news-mobile/assets/images/icon.png` | Mobile app icon and splash, 1024px | Mark on paper at 62% height |
| `docs/brand/logo-mark-traced.svg` | Reference | Vector trace of the map mark |

## Known limits

- The wordmark exists only as raster pixels, about 580px wide in the source. It is sharp at header and footer sizes and soft if enlarged much beyond 1.3x. A trace of the lettering came out lumpy and was dropped. A vector original, or the typeface name, would fix this.
- At 16px the three stripes blur into one band. On a dark browser tab the green stripes nearly disappear.
- The orange is below 4.5:1 on paper, so it cannot carry text.

## Still on the old name or the old logo

The logo reads "African News Feed". These still say "AfricaNews": the page title and Open Graph tags in `index.html`, `SITE_NAME` in `api-server/src/lib/shareMeta.ts`, the newsletter sender and copy in `api-server/src/lib/newsletter.ts`, `public/site.webmanifest`, and the mobile `app.json`. The newsletter header is plain text, not an image. The spec documents in this folder's parent still describe the old pulse-line logo and `--brand-amber`, which nothing uses now.
