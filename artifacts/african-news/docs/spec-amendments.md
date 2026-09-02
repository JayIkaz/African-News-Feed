# Draft amendments to `news-feed-design-spec.md`

Replacement text for §1 and §7, following the spec-owner rulings recorded in
[`spec-deltas.md`](./spec-deltas.md). Written to drop into the spec as-is.

Contrast ratios are measured against rendered pages on `--paper` (`#14132B`),
not calculated from the palette in isolation.

---

## Proposed replacement for §1

> ## 1. Colour tokens
>
> | Token | Value | Contrast on `--paper` | Use |
> |---|---|---|---|
> | `--paper` | `#14132B` | — | Page background (deep indigo-black, not pure black) |
> | `--paper-raised` | `#1D1B3D` | — | The one raised surface: image placeholder/loading fill, and any element that must read as lifted off the page — search field, dropdown panel, tag chip, skeleton |
> | `--ink` | `#F2F1ED` | 16.05:1 | Primary text (warm off-white, not stark white) |
> | `--ink-muted` | `rgba(242,241,237,0.55)` | 5.53:1 | Secondary text — deks, summaries |
> | `--ink-faint` | `rgba(242,241,237,0.50)` | 4.78:1 | Tertiary text — metadata, timestamps, country tags |
> | `--accent` | `#E8A33D` | 8.41:1 | Category labels, active nav state, hover highlight on headlines |
> | `--live` | `#E94F37` | 4.87:1 | Breaking/live indicators only. Reserve for genuine urgency, never decorative |
> | `--line` | `rgba(242,241,237,0.12)` | — | Hairline dividers between feed rows and header border |
> | `--line-strong` | `rgba(242,241,237,0.28)` | — | Divider colour on hover |
>
> No card backgrounds, borders, shadows, or rounded corners in this direction.
> Structure comes from hairline dividers and spacing, not boxes.
>
> **The three ink levels are ordered and must stay ordered.** `--ink` >
> `--ink-muted` > `--ink-faint`. Any future change to one has to preserve that
> ranking — raising `--ink-faint` past `--ink-muted` makes timestamps louder
> than summaries, which reads as a bug even when each value passes contrast on
> its own.
>
> **Text tokens must clear 4.5:1 on both `--paper` and `--paper-raised`.**
> Tags, dropdown items and search text sit on the raised fill, so a value that
> passes only on the page background is not sufficient. `--ink-faint` at 0.50
> gives 4.78:1 on `--paper` and 4.61:1 on `--paper-raised`.
>
> **`--live` is a text and marker colour, not a fill.** Use it for the pulsing
> dot, the "Breaking" wordmark, and the breaking tag. Do not use it as a
> background: white on `#E94F37` measures 3.72:1 and fails AA, and a
> full-bleed red surface contradicts the rule above about reserving colour for
> urgency rather than decoration. If a red fill is ever wanted, it needs its
> own paired foreground token, and white is not it.

### What changed and why

- **`--ink-faint` 0.35 → 0.50.** At 0.35 it measured 2.97:1, below the 4.5:1
  WCAG AA threshold for normal text — and §4/§6 apply it to every timestamp,
  country tag and metadata line, making it the single largest source of
  contrast failures on the site. 0.50 is the lowest alpha that clears AA on
  both surfaces while staying below `--ink-muted`, so it keeps as much of the
  intended faintness as the threshold allows.
- **`--paper-raised` use broadened.** The spec defined it only as the image
  placeholder fill, but a dark layout needs a raised surface and no other token
  provides one. The implementation already uses it for the search field,
  dropdown, tag chips and skeletons; this documents that rather than leaving it
  as an undeclared deviation.
- **Two new rules added** — ink ordering, and the dual-surface contrast floor.
  Both are constraints the original palette silently violated.
- **`--live` clarified** as text/marker only.

---

## Proposed replacement for §7

> ## 7. Grid and breakpoints
>
> - **Content column:** a single-column feed with a maximum measure of ~900px.
>   Where a sidebar is present the column is the remaining width beside it, not
>   a centred 900px page.
> - **One measure down the page.** Every block in the main column — top story,
>   pulse divider, any ad slot, category filters, and the feed itself — sits on
>   the same column and the same left edge. Nothing spans wider than the feed,
>   including the top story. A hero that runs full-bleed while the rows beneath
>   it sit narrower makes the reader change scanning width mid-page.
> - **Derive, don't hardcode.** The content column is defined relative to the
>   sidebar (`calc(100% - <sidebar + gap>)`), so the two stay aligned when
>   either changes. A fixed 900px drifts out of alignment the first time the
>   sidebar is resized.
> - **Tablet (≤1024px):** the sidebar stacks below the content. The content
>   column rule lifts with it, so everything returns to full container width
>   together.
> - **Mobile (≤640px):** thumbnails shrink to 72px × 72px, top-story height
>   drops to 300px, headline sizes step down as above.

### What changed and why

The original text specified a centred 900px single column with no sidebar. The
product has a persistent sidebar carrying trending stories, region navigation
and the newsletter signup, plus ad slots — so the spec as written could only be
satisfied by removing revenue and engagement surface, which is a product
decision rather than a visual one.

Measurement showed the disagreement was narrower than it read. The feed was
already at 932px, because the sidebar grid constrains it — the spec's reading
measure was being met by accident. The actual violation was the lede block
spanning the full 1272px container, so row headlines ran to 1150px at the top
of the page against 810px for identical rows below it.

The amendment keeps what §7 was really asking for — a comfortable, consistent
reading measure — and drops the part that was never true of this product.

---

## Still open

Not covered by these amendments, and still needing a decision:

- **§4/§6 "breaking" has no data source.** The `Article` schema has no
  `isBreaking` field; the state is currently derived from a 60-minute recency
  window. Either the API grows a field, the spec ratifies the heuristic and its
  window, or the breaking variant is cut. See `spec-deltas.md` §1.
- **The spec is silent on** the sidebar, ad slots, ticker, category pills,
  stats strip, translation chips, read-history state, pagination, region
  colours, and the `/countries`, `/country/:name`, `/search` and `/article/:id`
  pages. §7 above now acknowledges the sidebar exists, but none of these have
  specified treatments.
- **Crop-focus points per image type** — unchanged from the previous spec,
  still unresolved. Everything currently uses `object-position: top center`,
  which suits landscape and event photography and crops portrait subjects
  badly.
