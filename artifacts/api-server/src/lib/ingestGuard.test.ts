import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseMinInterval, shouldSkipRun } from "./ingestGuard";

const NOW = new Date("2026-11-04T18:30:00Z");
const ago = (minutes: number) => new Date(NOW.getTime() - minutes * 60 * 1000);

describe("parseMinInterval", () => {
  it("reads a positive number of minutes", () => {
    assert.equal(parseMinInterval("25"), 25);
    assert.equal(parseMinInterval("7.5"), 7.5);
  });

  it("means no floor for anything else", () => {
    for (const value of [undefined, "", "0", "-5", "abc", "NaN", "Infinity"]) {
      assert.equal(parseMinInterval(value), 0, String(value));
    }
  });
});

describe("shouldSkipRun", () => {
  it("skips when the last fetch was inside the floor", () => {
    assert.equal(shouldSkipRun(ago(10), NOW, 25), true);
    assert.equal(shouldSkipRun(ago(24.9), NOW, 25), true);
  });

  it("runs when the last fetch was at or beyond the floor", () => {
    assert.equal(shouldSkipRun(ago(25), NOW, 25), false);
    assert.equal(shouldSkipRun(ago(300), NOW, 25), false);
  });

  it("runs when nothing has been fetched yet", () => {
    assert.equal(shouldSkipRun(null, NOW, 25), false);
    assert.equal(shouldSkipRun(undefined, NOW, 25), false);
  });

  it("never skips without a floor, whatever the last fetch", () => {
    assert.equal(shouldSkipRun(ago(0), NOW, 0), false);
    assert.equal(shouldSkipRun(ago(1), NOW, 0), false);
  });

  it("treats a fetch time in the future as recent", () => {
    assert.equal(shouldSkipRun(new Date(NOW.getTime() + 60 * 1000), NOW, 25), true);
  });
});
