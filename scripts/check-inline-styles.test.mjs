import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { countInlineStyles, judge } from "./check-inline-styles.mjs";

function sample(files) {
  const dir = mkdtempSync(join(tmpdir(), "inline-styles-"));
  for (const [name, text] of Object.entries(files)) {
    const path = join(dir, name);
    mkdirSync(join(path, ".."), { recursive: true });
    writeFileSync(path, text);
  }
  return dir;
}

test("counts every style={{ in .tsx files, in nested folders", () => {
  const dir = sample({
    "A.tsx": `<div style={{ color: "red" }}><p style={{ margin: 0 }} /></div>`,
    "deep/B.tsx": `<span style={{ top: 1 }} />`,
    "C.tsx": `<span className="x" />`,
  });
  const { total, perFile } = countInlineStyles(dir);
  assert.equal(total, 3);
  assert.deepEqual(perFile, { "A.tsx": 2, "deep/B.tsx": 1 });
});

test("ignores style passed through as a variable, other file types and comments about styles", () => {
  const dir = sample({
    "A.tsx": `<Comp style={style} /><Other style={props.style} />`,
    "b.ts": `const x = { style: {{ a: 1 }} }; // style={{`,
    "c.css": `/* style={{ */`,
  });
  assert.equal(countInlineStyles(dir).total, 0);
});

test("judge: over fails, under and at pass", () => {
  assert.equal(judge(159, 158), "over");
  assert.equal(judge(157, 158), "under");
  assert.equal(judge(158, 158), "at");
});
