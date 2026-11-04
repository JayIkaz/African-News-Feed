// Options for a list of stories that should keep up with the feed.
//
// New stories arrive a few times a day, when the ingestion job runs. A page left
// open used to show the list it loaded with until it was reloaded, and the
// "updated" line above it (which checks every five minutes) could say a recent
// time over a list that was hours old.
//
// The list is fetched again every five minutes while the tab is in front, and
// when the reader returns to the tab after more than five minutes away (the
// app-wide stale time). Fetching again costs one request that the edge cache
// usually answers, and when nothing has changed the page is not touched.
export const LIVE_LIST = {
  refetchInterval: 5 * 60 * 1000,
  refetchOnWindowFocus: true,
} as const;
