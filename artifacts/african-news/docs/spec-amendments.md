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

## Proposed edits to §4 and §6 — remove the breaking state

**In §4, replace the eyebrow line:**

> - Eyebrow: mono, uppercase, `--accent`

**In §6, delete the "Breaking override" bullet entirely.**

### Why

There is no signal in this system for what is breaking, and the proxy that was
standing in for one was actively misleading:

- **"Top stories" is `ORDER BY published_date DESC LIMIT n`.** There is no
  ranking or editorial weight — the top story simply *is* the newest article.
  A recency-based breaking flag is therefore almost always true for it, so the
  badge restates the story's position rather than telling the reader anything.
- **12% of recent articles are under 60 minutes old.** One row in eight would
  carry a breaking tag, which is not what the word means.
- **No urgency signal exists anywhere.** Not in the `articles` table (no
  priority or breaking column) and not in the copy: across 100 sampled
  articles, zero titles contained "breaking", "UPDATE", "LIVE" or "JUST IN".
  The uppercase prefixes sources do use — ANALYSIS, SPOTLIGHT, FUNDING CLIFF —
  are section labels, not urgency markers.
- **`publishedDate` is not reliable enough to carry a visual state.** 5% of
  sampled articles were future-dated, one by 56 minutes.

Breaking is a newsroom judgement. This product aggregates on a schedule and has
no newsroom, so it cannot make that judgement honestly. `--live` keeps the two
uses that are true: the header's live dot and the ticker label, both of which
say *the feed is live*, not *this story is urgent*.

If an editorial signal ever exists — a curated flag, or a source that marks
urgency in its feed — this can come back. It needs a real input, not a proxy.

---

## Proposed edit to §4 — crop focus

**Replace:**

> `background-size: cover`, `background-position: top center`

**With:**

> `object-fit: cover`, `object-position: center 30%` — the house crop focus,
> applied to every article image at every size.

### Why

This also closes the §8 open item asking for "crop-focus points per image
type". Testing showed the framing was wrong: the variable is **how aggressive
the crop is**, not what the subject is.

- At the top story's ~2.45:1 crop, `top center` was the worst of the options
  tested against real source images — it kept sky and cut the subject on
  landscape and event photography.
- At the feed row's 104×78 the choices are near-indistinguishable, because that
  crop is close to source ratio and discards very little.
- `center 30%` biases slightly above centre, which suits faces, without `top`'s
  waste. It held the subject on every image tested.

A single value is deliberate: 91% of articles carry a source image with unknown
framing, and there is no per-image focus metadata to key off. Implemented as
one token (`--crop-focus`) so it is a single point of change.

---

## Proposed new §9 — surfaces this spec does not specify

> ## 9. Surfaces this spec does not specify
>
> This document specifies the header, top story, feed and their supporting
> elements. The product contains more than that. Anything not specified above
> must still conform to the following — the absence of a named treatment is not
> licence to invent one.
>
> 1. **Colour comes only from §1.** No new colours, no one-off hex values, no
>    ad-hoc opacity variants of a token.
> 2. **Use the three ink levels in their order** — `--ink` for primary,
>    `--ink-muted` for secondary, `--ink-faint` for tertiary. Do not introduce a
>    fourth level.
> 3. **Structure comes from hairlines and spacing.** No card fills, borders,
>    shadows, or rounded corners beyond the 3px used on thumbnails.
> 4. **Type roles are fixed.** Display serif for headlines; body sans for deks
>    and running copy; mono, uppercase, letter-spaced for labels, tags,
>    metadata and timestamps.
> 5. **`--live` signals urgency only**, as text or marker, never as a fill.
> 6. **`--paper-raised` is the only raised surface.** Anything that must read
>    as lifted off the page uses it.
> 7. **All text clears 4.5:1** on whichever of `--paper` or `--paper-raised` it
>    sits on.
>
> Surfaces currently in the product and covered only by these rules: the
> article sidebar, advertising slots, the breaking-news ticker, the category
> pill bar, the stats strip, translation chips, read-history state, pagination,
> region wayfinding colours, and the `/countries`, `/country/:name`, `/search`
> and `/article/:id` pages.
>
> Adding a surface does not require amending this spec, provided it conforms.
> Amend it when a surface genuinely needs to break one of these rules — and say
> which rule, and why.

### Why this rather than specifying each surface

Ten-plus surfaces enumerated individually would go stale the first time a page
is added, and would make the spec a component catalogue rather than a design
direction. Rules scale; inventories do not. The inventory is included anyway so
a future reader can tell these surfaces were considered rather than forgotten.

---

## Nothing left open

All three items previously listed here are resolved: the breaking state is cut,
the unspecified surfaces are governed by §9, and crop focus is settled at
`center 30%`. The spec's own §8 can be deleted — every question in it now has
an answer above.
