// Moving through a short list of stories that rotates by itself.

// The index one step on from `index`, wrapping at both ends.
export function stepIndex(index: number, count: number, delta: 1 | -1): number {
  if (count <= 0) return 0;
  return (((index + delta) % count) + count) % count;
}

// The index of the story on show, found by id. The list is fetched again every
// few minutes and new stories arrive at the front, so an index alone would
// slide the reader onto a different story. When the story is no longer in the
// list (its picture failed, or it fell out of the newest few) the reader keeps
// their place in the list, which is now the story that followed it.
export function resolveActive(ids: readonly number[], activeId: number | null, lastIndex: number): number {
  if (ids.length === 0) return 0;
  const found = activeId === null ? -1 : ids.indexOf(activeId);
  if (found >= 0) return found;
  return Math.min(Math.max(lastIndex, 0), ids.length - 1);
}
