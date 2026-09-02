# Spec deltas — dark editorial redesign

Findings from implementing `news-feed-design-spec.md` (dark editorial) against
the `african-news` web artifact. Written for whoever maintains the spec.

Everything here is either something the spec asks for that the product cannot
currently deliver, something the spec does not cover that the product
nonetheless contains, or a deliberate deviation made during implementation.
Contrast ratios were measured against rendered pages, not calculated from the
palette in isolation.

Branch: `redesign/dark-editorial`.

---

## 1. Blocking: "breaking" has no data source

§4 specifies a `--live` eyebrow when the top story is breaking. §6 specifies a
`--live` breaking tag that *replaces* the category tag in a feed row. Neither
could be built as written, because the `Article` schema has no breaking flag:

```
id, title, summary, author, sourceId, sourceName, country, category,
publishedDate, url, createdAt, imageUrl, aiSummary, language, titleEn, summaryEn
```

The reference implementation's `breaking: true` is hand-written mock data, so
this gap is invisible when reading the spec alongside it.

**Shipped as:** derived from `publishedDate` — a story is breaking for its
first 60 minutes — behind a single helper (`src/lib/breaking.ts`). Both call
sites already read from it, so a real field is a one-line change.

**Needs a decision:** add `isBreaking` to the API, keep the recency heuristic
(and if so, ratify the window), or drop the breaking variant from the spec.
60 minutes is a placeholder chosen to match the reference mock, where a
14-minute story is breaking and a 2-hour story is not. It is not a considered
editorial rule.

---

## 2. `--ink-faint` fails WCAG AA

`--ink-faint` (`rgba(242,241,237,0.35)`) measures **2.97:1** on `--paper`,
against the 4.5:1 AA threshold for normal-size text. §4 and §6 apply it to
every timestamp, country tag and metadata line, so this is not an edge case —
it is the single largest source of contrast failures on the site.

Measured on `--paper`:

| Token | Ratio | AA (normal text) |
|---|---|---|
| `--ink` | 16.05:1 | pass |
| `--accent` | 8.41:1 | pass |
| `--ink-muted` | 5.53:1 | pass |
| `--live` | 4.87:1 | pass |
| `--ink-faint` | **2.97:1** | **fail** |

The rest of the ramp is healthy — this is one value, not a palette-wide
problem.

**RESOLVED — spec owner ruled to raise it.** `--ink-faint` is now
`rgba(242,241,237,0.50)`, measuring **4.78:1 on `--paper`** and **4.61:1 on
`--paper-raised`**.

The value is 0.50, not the ~0.58 first proposed, for two reasons found while
implementing it:

- 0.58 measures 6.02:1 — *brighter* than `--ink-muted` at 5.53:1. It would
  have inverted the ramp, making tertiary text louder than secondary.
- The value must also clear AA on `--paper-raised`, where tags and dropdown
  text sit. That rules out 0.48, which passes on `--paper` (4.50) but fails on
  raised (4.36).

0.50 is the lowest alpha that clears AA on both surfaces while staying below
`--ink-muted`, so it preserves as much of the intended faintness as the
threshold allows.

**Spec §1 should be updated** to carry 0.50 as the `--ink-faint` value.

Effect: home page contrast failures went from 58 to 2, and `/countries` from
90 to 0. The two remaining are the ad placeholder (see §7 below).

---

## 3. White on `--live` fails AA

The spec's `--live` (`#E94F37`) is brighter than the palette it replaced. Any
white text on it measures **3.72:1**. The breaking ticker was white-on-`--live`
across its full width.

**Shipped as:** the ticker no longer uses `--live` as a surface. Urgency is
carried by a pulsing `--live` dot and wordmark, with headlines as `--ink` on
`--paper` (16:1). This also brought the ticker in line with §1's "reserve
colour for signals, never decorative" — a full-bleed red bar above a `--paper`
header read as decoration.

**Worth adding to the spec:** an explicit note that `--live` is a *text and
marker* colour, not a fill. If it is ever intended as a surface, it needs a
paired foreground token, and white is not it.

---

## 4. The spec describes a narrower product than exists

This is the largest gap, and the one most likely to cause friction later.

§7 specifies a single-column feed at a 900px maximum, centred. The artifact is
a 1320px two-column layout with a persistent sidebar. The spec has no sidebar,
and more broadly makes no mention of:

- the article sidebar (trending, browse-by-region, newsletter)
- advertising slots — desktop leaderboard and mobile banner
- the breaking-news ticker
- the category pill filter bar
- the stats strip (countries / sources / articles indexed)
- translation chips (non-English sources, cached English titles)
- read-history state — dimming and the read marker
- pagination
- region colours used for country wayfinding
- the `/countries`, `/country/:name`, `/search` and `/article/:id` pages

Several of these are revenue or engagement surface. Conforming literally to §7
would mean removing the sidebar and reflowing ads, which is a product decision,
not a visual one.

**RESOLVED — spec owner ruled to keep the sidebar and hold one content
measure.** Measurement showed the conflict was narrower than it looked. At a
1440px viewport:

| Element | Before | After |
|---|---|---|
| Latest-news feed column | 932px | 932px |
| Top story + its two rows | **1272px** | **932px** |
| Sidebar | 300px | 300px |

The feed was *already* at the spec's reading measure — the sidebar grid
constrains it to 932px. The real §7 violation was the lede block, which spanned
the full container: the top story at 1272px, with row headlines running to
1150px against 810px for identical rows further down. The page carried two
different measures stacked on each other.

The lede block (top stories, pulse divider, ad, pills) is now held to the same
column via `.an-lede-column`, derived as `calc(100% - 340px)` from the sidebar
width and gap rather than hardcoded to 932px, so the two stay aligned at every
viewport instead of drifting. Below 1025px the sidebar stacks and the rule
lifts, so both go full width together. Verified: widths identical and left
edges 0px apart at 1440px and at 1000px.

**Spec §7 should be updated** to describe a ~900px *content column* beside a
sidebar, rather than a 900px page. The measure the spec asks for is what the
site now delivers; the "single column, centred" phrasing is what it never did.

---

## 5. Deviations made during implementation

Each of these was a judgement call. Flagging them so they can be ratified or
reversed.

**Token aliases.** The spec defines nine colours; the artifact referenced about
twenty. The orphans (`--paper-2/3`, `--surface-1/2`, `--ink-2/3/4`, the mint
and yellow families, `--anchor`, `--region-*`) are aliased onto spec values in
`:root` rather than deleted, so components the spec does not cover keep
rendering coherently. No new colours were introduced.

**Region colours are the one exception.** The five `--region-*` wayfinding
colours have no spec equivalent and were unreadable on `--paper` at their light
theme values. Hues are unchanged; luminance was lifted. If the spec wants
colour reserved strictly for category and urgency, these should collapse to
`--accent` — at the cost of losing the visual distinction between regions.

**`--paper-raised` was extended.** §1 defines it only as the image
placeholder fill. It is also used for the search field, dropdown, tag chips and
skeletons, because a dark layout needs a raised surface and the spec names no
other.

**Category tag colours were collapsed.** The artifact had eight per-category
tag colours. All now render as `--accent` on `--paper-raised`, since §1 reserves
colour for signal and the category name is itself the signal.

**The mobile carousel carries no dek.** Below 640px the carousel *is* the top
story, so it follows §4's composition — but without the dek. The spec's scrim
only reaches full strength at the very bottom, which works over 380px but left
a dek sitting on bright image detail at 300px, where it tested unreadable.
Dropping the least essential element beat weakening a scrim value the spec
fixes exactly.

**Fonts.** `index.html` now loads Fraunces / Inter / IBM Plex Mono, replacing
Lora / IBM Plex Sans / IBM Plex Serif. Strictly required for §2.

---

## 6. Input to the spec's own §8 open items

**"Should breaking stories show both the breaking tag and the category tag?"**
In the built row, no — the breaking tag replaces the category tag as §6
specifies, and at 104×78 with a two-line headline there is genuinely no room
for both without crowding. Worth noting the current cost: when a story is
breaking, its category becomes invisible in the feed. The country tag still
shows, so the row is not without context.

**"Crop-focus points per image type."** Still unresolved. Everything uses
`object-position: top center` per §4. This is right for landscape and event
photography and wrong for portrait subjects, where it crops foreheads.

**"Should the pulse divider appear elsewhere?"** Implemented at exactly one
boundary, as specified, and it works — it reads as a signature. Recommend
keeping it unique. It is a single component (`PulseDivider`), so adding
instances later is trivial if that changes.

---

## 7. Not verified

- Visual regression across `/search`, `/country/:name` — these render and pass
  the contrast audit, but have not been reviewed against the spec's intent.
- The Expo app in `artifacts/africa-news-mobile` has parallel components
  (`ArticleCard`, `TopStoryCarousel`, `BreakingTicker`) and was untouched — no
  file outside `artifacts/african-news` changed on this branch. It carries its
  own light palette in `constants/colors.ts`, unrelated to either version of
  this spec, so the two apps now diverge visually.
- No automated contrast test exists. The audit used to produce the numbers here
  was ad hoc and is not committed; the figures will drift as the site changes.
