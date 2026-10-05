#!/usr/bin/env node
// Counts inline style objects (`style={{`) in the web app's source and fails
// when the count is above the budget in artifacts/african-news/inline-style-budget.json.
//
// Why: inline styles cannot be restyled from the stylesheet, cannot carry a
// hover or focus state, and hide the design tokens. The count is a ratchet. It
// may go down; a pull request that raises it fails. When a change lowers it,
// lock the gain in with `pnpm run check:inline-styles -- --update`.
//
// Only the literal `style={{` is counted. `style={someVariable}` passes a
// style through and is not what the budget is about.
//
//   node scripts/check-inline-styles.mjs            check
//   node scripts/check-inline-styles.mjs --update   lower the budget to the current count

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const PATTERN = /style=\{\{/g;

// Returns the total and a count per file, for every .tsx file under `dir`.
export function countInlineStyles(dir) {
  const perFile = {};
  const walk = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith(".tsx")) {
        const n = (readFileSync(path, "utf8").match(PATTERN) ?? []).length;
        if (n > 0) perFile[relative(dir, path)] = n;
      }
    }
  };
  walk(dir);
  const total = Object.values(perFile).reduce((sum, n) => sum + n, 0);
  return { total, perFile };
}

// What the check decides, apart from reading files and exiting.
export function judge(count, budget) {
  if (count > budget) return "over";
  if (count < budget) return "under";
  return "at";
}

function main() {
  const root = join(dirname(fileURLToPath(import.meta.url)), "..");
  const app = join(root, "artifacts", "african-news");
  const budgetFile = join(app, "inline-style-budget.json");
  const budget = JSON.parse(readFileSync(budgetFile, "utf8")).max;
  const { total, perFile } = countInlineStyles(join(app, "src"));

  if (process.argv.includes("--update")) {
    if (total > budget) {
      console.error(`Not raising the budget: ${total} inline styles is above ${budget}.`);
      process.exit(1);
    }
    writeFileSync(budgetFile, JSON.stringify({ max: total }, null, 2) + "\n");
    console.log(`Budget is now ${total} (was ${budget}).`);
    return;
  }

  const verdict = judge(total, budget);
  if (verdict === "over") {
    console.error(`Inline styles: ${total}, budget ${budget}. This change adds ${total - budget}.`);
    console.error("Use a CSS class in src/index.css, tied to the tokens, instead of style={{ }}.");
    console.error("Files with the most inline styles:");
    Object.entries(perFile)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .forEach(([file, n]) => console.error(`  ${String(n).padStart(3)}  ${file}`));
    process.exit(1);
  }
  if (verdict === "under") {
    console.log(`Inline styles: ${total}, budget ${budget}. Lock in the gain: pnpm run check:inline-styles -- --update`);
    // Shows as an annotation on the pull request in GitHub Actions.
    if (process.env.GITHUB_ACTIONS) console.log(`::notice::Inline styles fell to ${total} (budget ${budget}). Run pnpm run check:inline-styles -- --update.`);
  } else {
    console.log(`Inline styles: ${total}, at the budget of ${budget}.`);
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) main();
