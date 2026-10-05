import assert from "node:assert/strict";
import { test } from "node:test";
import { groupByTime, timeBucket } from "../artifacts/african-news/src/lib/timeGroups.ts";

// Monday 5 October 2026, 15:30 in the machine's own time zone. Every date below
// is built from local parts, so the tests give the same answers in any zone.
const now = new Date(2026, 9, 5, 15, 30, 0);
const minsAgo = (m) => new Date(now.getTime() - m * 60000);
const local = (y, mo, d, h = 12, mi = 0) => new Date(y, mo - 1, d, h, mi);
const label = (date, at = now) => timeBucket(date, at).label;

test("under an hour old is the last hour, an hour or more is earlier today", () => {
  assert.equal(label(minsAgo(0)), "Last hour");
  assert.equal(label(minsAgo(59)), "Last hour");
  assert.equal(label(minsAgo(60)), "Earlier today");
  assert.equal(label(local(2026, 10, 5, 0, 5)), "Earlier today");
});

test("a story dated in the future counts as the last hour", () => {
  assert.equal(label(minsAgo(-5)), "Last hour");
  assert.equal(label(minsAgo(-2 * 24 * 60)), "Last hour");
});

test("yesterday is the calendar day before, in local time", () => {
  assert.equal(label(local(2026, 10, 4, 23, 59)), "Yesterday");
  assert.equal(label(local(2026, 10, 4, 0, 0)), "Yesterday");
});

test("older stories get their date, with the year only when it is not this year", () => {
  assert.equal(label(local(2026, 10, 3, 9)), "Saturday 3 October");
  assert.equal(label(local(2025, 12, 31, 9)), "Wednesday 31 December 2025");
});

test("the last hour crosses midnight; an hour and a half does not", () => {
  const justAfterMidnight = new Date(2026, 9, 6, 0, 30);
  assert.equal(label(new Date(2026, 9, 5, 23, 45), justAfterMidnight), "Last hour");
  assert.equal(label(new Date(2026, 9, 5, 23, 0), justAfterMidnight), "Yesterday");
});

test("groups are runs of the same bucket, in the order given", () => {
  const items = [
    { id: 1, d: minsAgo(10) }, { id: 2, d: minsAgo(50) }, { id: 3, d: minsAgo(120) }, { id: 4, d: "not a date" },
    { id: 5, d: local(2026, 10, 4, 20) }, { id: 6, d: local(2026, 10, 3, 20) }, { id: 7, d: local(2026, 10, 3, 8) },
  ].map((i) => ({ ...i, d: i.d instanceof Date ? i.d.toISOString() : i.d }));
  const groups = groupByTime(items, (i) => i.d, now);
  assert.deepEqual(groups.map((g) => g.label), ["Last hour", "Earlier today", "Yesterday", "Saturday 3 October"]);
  assert.deepEqual(groups.map((g) => g.items.map((i) => i.id)), [[1, 2], [3, 4], [5], [6, 7]]);
});

test("a story with no readable date joins the group above it, or an Undated group at the top", () => {
  const first = groupByTime([{ d: "" }, { d: minsAgo(5).toISOString() }], (i) => i.d, now);
  assert.deepEqual(first.map((g) => [g.label, g.items.length]), [["Undated", 1], ["Last hour", 1]]);
});

test("a bucket that comes back out of order gets a heading of its own and a unique key", () => {
  const items = [{ d: minsAgo(5) }, { d: minsAgo(200) }, { d: minsAgo(6) }].map((i) => ({ d: i.d.toISOString() }));
  const groups = groupByTime(items, (i) => i.d, now);
  assert.deepEqual(groups.map((g) => g.key), ["last-hour", "earlier-today", "last-hour-2"]);
});

test("an empty list has no groups", () => {
  assert.deepEqual(groupByTime([], (i) => i, now), []);
});
