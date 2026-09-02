Ports `news-feed-design-spec.md` (dark editorial) onto the `african-news` web
artifact, replacing the light card-based direction — and amends the spec where
implementation showed it was wrong.

## The redesign

- **Tokens & typography (§1/§2).** The spec's nine colours and three faces
  defined verbatim. The artifact referenced ~20 colour tokens, so the orphans
  are aliased onto spec values rather than deleted, keeping surfaces the spec
  doesn't cover coherent. Fraunces / Inter / IBM Plex Mono replace Lora / Plex
  Sans / Plex Serif.
- **Header (§3).** `--paper` with a hairline, brand in the display serif, the
  filled "Live" chip replaced by a pulsing dot and mono label, nav mono and
  uppercase with the active item in `--accent`.
- **Top story (§4).** Card frame dropped for a full-bleed 380px image, the
  spec's exact scrim, and eyebrow / headline / dek / meta over the image.
- **Feed rows (§6).** The biggest structural change: boxed cards replaced by a
  borderless stream — hairline dividers, 104×78 thumbnails, mono tag row,
  headlines truncated on a word boundary at 90 chars.
- **Pulse divider (§5)** at the single top-story/feed boundary.
- **Mobile carousel** brought onto the same composition — below 640px it *is*
  the top story, so none of the §4 work reached it before.

## Accessibility

The token swap inverted assumptions the old components were built on: the
previous `--accent` was dark teal, so hardcoded white foregrounds were safe.
Under the spec's light amber they were not. Fixed, and measured against
rendered pages rather than calculated from the palette:

| Page | Contrast failures before | After |
|---|---|---|
| Home | 58 | 2 |
| `/countries` | 90 | 0 |

The two remaining are the ad placeholder, faint by design before this work.

`--ink-faint` was raised from the spec's `0.35` (2.97:1, below AA) to `0.50`.
Not the `0.58` first proposed: that measured 6.02:1, *brighter* than
`--ink-muted`, which would have inverted the ink ramp. `0.50` is the lowest
alpha clearing AA on both `--paper` and `--paper-raised` while staying below
`--ink-muted`.

## The spec now lives here, and agrees with the code

The spec had been a `.docx` in a Downloads folder, in two versions, with no
history — which is how it drifted from the implementation in the first place.
It is now version-controlled beside the code it governs, with the amendments
applied and the old §8 "Open items" deleted, since every question in it has an
answer:

| File | What it is |
|---|---|
| `docs/news-feed-design-spec.md` | The current spec — §1, §4, §5, §6, §7 amended; §8 is now a conformance section for surfaces the spec doesn't name |
| `docs/spec-deltas.md` | Findings, rulings, and the pre-amendment spec preserved verbatim |
| `docs/spec-amendments.md` | What changed between the two, and why |

Every concrete value in the amended spec was cross-checked against the
implementation — `--ink-faint`, crop focus, thumbnail sizes, top-story height,
the 90-character truncation limit and the derived content column all match, and
"breaking" appears in neither.

Three findings worth calling out:

- **Breaking is cut.** "Top stories" is `ORDER BY published_date DESC LIMIT n`,
  so the top story *is* the newest article — a recency-based breaking flag
  restated its position rather than informing. 12% of recent articles would
  have qualified, no urgency signal exists in the schema or in 100 sampled
  titles, and 5% of timestamps are future-dated. Breaking is a newsroom
  judgement; this product has no newsroom.
- **§7's 900px was already being met.** The feed sits at 932px because the
  sidebar constrains it. The real violation was the lede block spanning the
  full 1272px container, so headlines ran to 1150px up top against 810px
  below. Now one measure, derived from the sidebar rather than hardcoded.
- **Crop focus was framed wrong.** The old §8 asked for focus points "per image
  type", but the variable is crop aggressiveness, not subject. The spec's own
  `top center` tested *worst* at the top story's 2.45:1 crop. Settled at
  `center 30%` in one token.

The surfaces the spec never covered — sidebar, ad slots, ticker, pills, stats
strip, translation chips, read state, pagination, region colours, and four
pages — are now governed by conformance rules rather than enumerated one by
one, so adding a page doesn't require amending the spec unless it needs to
*break* a rule.

## Verification

`tsc --noEmit` clean and `vite build` succeeds at every commit. All routes
render with no console errors: `/`, `/category/:c`, `/country/:c`,
`/countries`, `/search`, `/article/:id`. Loading skeletons measured to match
loaded rows exactly (115px desktop, 121px mobile) so the feed no longer jumps.

## Not covered

- `artifacts/africa-news-mobile` (Expo) is untouched and keeps its own light
  palette, so the two apps now diverge visually.
- `/search` and `/country/:name` render and pass the contrast audit but were
  not reviewed against the spec's intent.
- The contrast audit was ad hoc and is not committed, so the figures above will
  drift as the site changes.
