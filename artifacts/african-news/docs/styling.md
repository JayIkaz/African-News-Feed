# Styling the web app

Style with CSS classes in `src/index.css`, tied to the tokens (`--ink`,
`--paper`, `--accent`, `--font-headline`, and so on), or with the Tailwind theme
classes that map to them. Do not add `style={{ ... }}`.

Why: an inline style cannot carry a hover or focus state, cannot change at a
breakpoint, and hides the token it should have used. A hover written as
`onMouseEnter` also never runs for the keyboard or for touch.

- A hover, focus or active state goes in the stylesheet (`:hover`,
  `:focus-visible`), never in an event handler that sets `style`.
- A value that comes from data, such as a width from a count, may stay inline.
  Keep it to that value.
- Convert a file's inline styles when you are already changing the file.

The count of `style={{` is held by a check that runs in CI
(`pnpm run check:inline-styles`). It fails when the count is above the budget in
`inline-style-budget.json`. When a change lowers the count, lock it in with
`pnpm run check:inline-styles -- --update`. The budget only goes down.

Headings use `--font-headline` (Fraunces). The Tailwind `font-serif` class is
mapped to it.
