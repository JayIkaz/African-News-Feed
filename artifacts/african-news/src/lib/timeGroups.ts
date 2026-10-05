import { differenceInCalendarDays, format, isValid } from "date-fns";

// Stories grouped by how long ago they were published, in the reader's own
// time zone: "Last hour", "Earlier today", "Yesterday", then one group per
// calendar day ("Saturday 3 October").
//
// A story is in the last hour when it is under 60 minutes old, even if that
// crosses midnight, and a story dated in the future (a publisher's clock or time
// zone is wrong) counts as the last hour too. Everything else is sorted by the
// calendar day it fell on.

export interface TimeGroup<T> {
  // Unique within one list, safe to use as an element id.
  key: string;
  label: string;
  items: T[];
}

const HOUR_MS = 60 * 60 * 1000;

export function timeBucket(published: Date, now: Date): { id: string; label: string } {
  if (now.getTime() - published.getTime() < HOUR_MS) return { id: "last-hour", label: "Last hour" };
  const days = differenceInCalendarDays(now, published);
  if (days <= 0) return { id: "earlier-today", label: "Earlier today" };
  if (days === 1) return { id: "yesterday", label: "Yesterday" };
  const sameYear = published.getFullYear() === now.getFullYear();
  return {
    id: format(published, "yyyy-MM-dd"),
    label: format(published, sameYear ? "EEEE d MMMM" : "EEEE d MMMM yyyy"),
  };
}

// Consecutive stories with the same bucket form one group, so the order of the
// list is never changed. The API sorts newest first, which keeps each bucket in
// one run; if a list ever arrives out of order the bucket simply appears again
// under a heading of its own. A story whose date cannot be read stays in the
// group above it (or, at the very top, in a group called "Undated").
export function groupByTime<T>(
  items: T[],
  getDate: (item: T) => string | null | undefined,
  now: Date,
): TimeGroup<T>[] {
  const groups: TimeGroup<T>[] = [];
  const seen = new Map<string, number>();
  let currentId: string | null = null;

  for (const item of items) {
    const raw = getDate(item);
    const date = raw ? new Date(raw) : null;
    const bucket = date && isValid(date) ? timeBucket(date, now) : null;

    const current = groups[groups.length - 1];
    if (current && (bucket === null || bucket.id === currentId)) {
      current.items.push(item);
      continue;
    }

    const next = bucket ?? { id: "undated", label: "Undated" };
    const count = (seen.get(next.id) ?? 0) + 1;
    seen.set(next.id, count);
    groups.push({ key: count === 1 ? next.id : `${next.id}-${count}`, label: next.label, items: [item] });
    currentId = next.id;
  }
  return groups;
}
