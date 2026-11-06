import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveActive, stepIndex } from "../artifacts/african-news/src/lib/rotation.ts";

test("stepping forward wraps from the last story to the first", () => {
  assert.equal(stepIndex(0, 6, 1), 1);
  assert.equal(stepIndex(4, 6, 1), 5);
  assert.equal(stepIndex(5, 6, 1), 0);
});

test("stepping back wraps from the first story to the last", () => {
  assert.equal(stepIndex(3, 6, -1), 2);
  assert.equal(stepIndex(0, 6, -1), 5);
});

test("an empty list has nowhere to step", () => {
  assert.equal(stepIndex(0, 0, 1), 0);
  assert.equal(stepIndex(0, 0, -1), 0);
});

test("the story on show is followed by id when new stories arrive in front", () => {
  assert.equal(resolveActive([10, 11, 12, 13], 12, 2), 2);
  // Two new stories arrive: 12 is now third from the end, still the one on show.
  assert.equal(resolveActive([20, 21, 10, 11, 12, 13], 12, 2), 4);
});

test("before anything is chosen the first story is on show", () => {
  assert.equal(resolveActive([10, 11, 12], null, 0), 0);
});

test("a story that has gone leaves the reader at the same place in the list", () => {
  // 11 was third of four and has dropped out: the story that followed it is now there.
  assert.equal(resolveActive([10, 12, 13], 11, 2), 2);
  // The last story went and the list is shorter: stay on the new last one.
  assert.equal(resolveActive([10, 12], 13, 3), 1);
});

test("an empty list resolves to zero", () => {
  assert.equal(resolveActive([], 5, 3), 0);
});
