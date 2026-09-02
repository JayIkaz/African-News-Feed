# AfricaNews — visual design spec (dark editorial)

This supersedes the earlier light-palette, card-based version of this spec. The site has moved to a dark, high-contrast editorial layout inspired by The Intercept, borderless feed rows instead of boxed cards, reserving colour for category/urgency signals rather than decoration.

> **Revision — amended after implementation.** Sections 1, 4, 6, 7 and 8 were changed once the direction was built against the real product. The former §8 "Open items" is gone: every question in it has an answer, recorded below. Contrast figures are measured against rendered pages, not calculated from the palette in isolation. The reasoning and evidence behind each change are in [`spec-deltas.md`](./spec-deltas.md).

## 1. Colour tokens

| Token | Value | Contrast on `--paper` | Use |
|---|---|---|---|
| `--paper` | `#14132B` | — | Page background (deep indigo-black, not pure black) |
| `--paper-raised` | `#1D1B3D` | — | The one raised surface: image placeholder/loading fill, and anything that must read as lifted off the page — search field, dropdown panel, tag chip, skeleton |
| `--ink` | `#F2F1ED` | 16.05:1 | Primary text (warm off-white, not stark white) |
| `--ink-muted` | `rgba(242,241,237,0.55)` | 5.53:1 | Secondary text — deks, summaries |
| `--ink-faint` | `rgba(242,241,237,0.50)` | 4.78:1 | Tertiary text — metadata, timestamps, country tags |
| `--accent` | `#E8A33D` | 8.41:1 | Category labels, active nav state, hover highlight on headlines |
| `--live` | `#E94F37` | 4.87:1 | Live indicators only. Reserve for genuine urgency, never decorative |
| `--line` | `rgba(242,241,237,0.12)` | — | Hairline dividers between feed rows and header border |
| `--line-strong` | `rgba(242,241,237,0.28)` | — | Divider colour on hover |

No card backgrounds, borders, shadows, or rounded corners in this direction. Structure comes from hairline dividers and spacing, not boxes.

**The three ink levels are ordered and must stay ordered.** `--ink` > `--ink-muted` > `--ink-faint`. Any future change has to preserve that ranking — raising `--ink-faint` past `--ink-muted` makes timestamps louder than summaries, which reads as a bug even when each value passes contrast on its own.

**Text tokens must clear 4.5:1 on both `--paper` and `--paper-raised`.** Tags, dropdown items and search text sit on the raised fill, so a value that passes only against the page background is not sufficient. `--ink-faint` at 0.50 gives 4.78:1 on `--paper` and 4.61:1 on `--paper-raised`.

**`--live` is a text and marker colour, not a fill.** Use it for the pulsing dot and the "Breaking" wordmark on the ticker. Do not use it as a background: white on `#E94F37` measures 3.72:1 and fails AA, and a full-bleed red surface contradicts the rule about reserving colour for urgency rather than decoration. If a red fill is ever wanted it needs its own paired foreground token, and white is not it.

## 2. Typography

- **Display (`--font-display`)**: Fraunces — used for the site name, the top-story headline, and every feed-row headline. Kept serif deliberately so the dark layout reads as editorial rather than a generic dark-mode UI toggle.
- **Body (`--font-body`)**: Inter — deks and any longer-form copy.
- **Mono (`--font-mono`)**: IBM Plex Mono — nav items, eyebrows, tags, timestamps. Always uppercase, letter-spacing ~0.05–0.08em.

## 3. Header

- Background: `--paper`, 1px bottom border in `--line`
- Site name in `--font-display`, 20px, weight 700
- Live indicator: a small `--live` dot with a CSS pulse animation (`@keyframes`, 1.8s ease-in-out, opacity/scale) next to a mono "Live" label
- Nav items: mono, uppercase, `--ink-muted`; active item switches to `--accent` with a 1px bottom border in `--accent`

## 4. Top story

- Full-bleed image, fixed height (380px desktop / 300px mobile), `object-fit: cover`
- **Crop focus**: `object-position: center 30%` — the house value, applied to every article image at every size. Biased slightly above centre so faces survive the crop, without the waste of `top center`, which this spec previously specified and which kept sky while cutting the subject on landscape and event photography.
- Scrim: gradient from near-transparent at the top to `rgba(10,9,25,0.95)` at the bottom, mandatory whenever text sits over the image
- Eyebrow: mono, uppercase, `--accent`, showing the category
- Headline: `--font-display`, 32px desktop / 24px mobile, weight 600
- Dek: `--font-body`, 14px, `--ink-muted`, upright (not italic)
- Metadata line (country · time · source): mono, uppercase, `--ink-faint`

Below 640px the top story is presented as a swipeable carousel. It carries this same composition, minus the dek: the scrim only reaches full strength at the very bottom, which works over 380px but leaves a dek sitting on bright image detail at 300px.

## 5. Pulse divider (signature element)

A thin SVG waveform line sits between the top story and the feed, echoing the AfricaNews pulse-through-Africa-silhouette logo. Stroke colour `rgba(242,241,237,0.18)`, 1px weight. This replaces a plain hairline rule at this one structural boundary — it is not repeated elsewhere, so it stays a signature rather than becoming decoration.

**It stays unique to this boundary.** Built and reviewed in place; repeating it would turn a signature into a motif.

## 6. Latest news feed

Borderless row list, not boxed cards. This is the single biggest structural change from the previous spec.

- **Row layout**: thumbnail (104px × 78px desktop, 72px × 72px mobile) on the left, content to the right, flex gap 18px
- **Divider**: 1px `--line` under every row; on hover, brightens to `--line-strong` and the headline text shifts to `--accent`
- **Tag row**: category tag (mono, `--accent`) and country tag (mono, `--ink-faint`) sit side by side above the headline
- **Headline**: `--font-display`, 17px desktop / 15px mobile, weight 600, clamped to 2 lines
- **Truncation**: do not rely on CSS `line-clamp` alone for the cut point, since it can break mid-word. Run headline/summary text through a helper that finds the last full word before the character limit (currently 90 characters for feed-row headlines), then apply the ellipsis there
- **Timestamp**: mono, `--ink-faint`, below the headline
- **Loading state**: skeleton rows must occupy the same height as a loaded row, or the feed jumps when data arrives

### On "breaking"

Earlier drafts specified a `--live` breaking tag replacing the category tag in the row, and a `--live` eyebrow on the top story. **Both are removed.** This product aggregates on a schedule and has no newsroom, so it has no way to know what is breaking:

- "Top stories" is the *N* most recently published articles — no ranking. The top story therefore *is* the newest article, so a recency-based flag restates its position rather than informing.
- 12% of recent articles are under an hour old, so one row in eight would carry the tag.
- No urgency signal exists in the data: the article schema has no such field, and across 100 sampled titles none contained "breaking", "update", "live" or "just in". The uppercase prefixes sources use (ANALYSIS, SPOTLIGHT) are section labels.
- Published timestamps are not reliable enough to drive a visual state — 5% of sampled articles were future-dated.

This can return if a real editorial signal ever exists. It needs an input, not a proxy.

## 7. Grid and breakpoints

- **Content column**: a single-column feed with a maximum measure of ~900px. Where a sidebar is present the column is the remaining width beside it, not a centred 900px page.
- **One measure down the page.** Every block in the main column — top story, pulse divider, any ad slot, category filters, and the feed itself — sits on the same column and the same left edge. Nothing spans wider than the feed, including the top story. A hero that runs full-bleed while the rows beneath it sit narrower makes the reader change scanning width mid-page.
- **Derive, don't hardcode.** Define the content column relative to the sidebar (`calc(100% - <sidebar + gap>)`) so the two stay aligned when either changes. A fixed 900px drifts out of alignment the first time the sidebar is resized.
- **Tablet (≤1024px)**: the sidebar stacks below the content, and the content-column rule lifts with it so everything returns to full container width together.
- **Mobile (≤640px)**: thumbnails shrink to 72px × 72px, top-story height drops to 300px, headline sizes step down as above.

## 8. Surfaces this spec does not specify

This document specifies the header, top story, feed and their supporting elements. The product contains more than that. Anything not specified above must still conform to the following — the absence of a named treatment is not licence to invent one.

1. **Colour comes only from §1.** No new colours, no one-off hex values, no ad-hoc opacity variants of a token.
2. **Use the three ink levels in their order** — `--ink` primary, `--ink-muted` secondary, `--ink-faint` tertiary. Do not introduce a fourth.
3. **Structure comes from hairlines and spacing.** No card fills, borders, shadows, or rounded corners beyond the 3px used on thumbnails.
4. **Type roles are fixed.** Display serif for headlines; body sans for deks and running copy; mono, uppercase, letter-spaced for labels, tags, metadata and timestamps.
5. **`--live` signals urgency only**, as text or marker, never as a fill.
6. **`--paper-raised` is the only raised surface.** Anything that must read as lifted off the page uses it.
7. **All text clears 4.5:1** on whichever of `--paper` or `--paper-raised` it sits on.

Surfaces currently in the product and covered only by these rules: the article sidebar, advertising slots, the breaking-news ticker, the category pill bar, the stats strip, translation chips, read-history state, pagination, region wayfinding colours, and the `/countries`, `/country/:name`, `/search` and `/article/:id` pages.

Adding a surface does not require amending this spec, provided it conforms. Amend it when a surface genuinely needs to break one of these rules — and say which rule, and why.
