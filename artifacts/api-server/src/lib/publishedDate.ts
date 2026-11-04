// The date to store for a story, from the date text in its feed.
//
// Two things go wrong with feed dates, and both put a story at the top of the
// site for the wrong reason, because the lists are sorted by this date:
//
//  - A publisher labels its own time zone as GMT, so every date is hours out.
//  - A date is wrong outright (the wrong month, a scheduled post). A story dated
//    a month ahead leads the home page for a month.
//
// A story cannot have been published after we fetched it, so a date later than
// the fetch is pulled back to the fetch time. The time zone problem is fixed
// per publisher, below.

const MINUTE_MS = 60 * 1000;

// Publishers whose feed clock is known to be wrong: the minutes to add to each
// date in the feed. Keyed by the publisher's website host, without "www.".
//
// Daily Maverick labels South African time (UTC+2, no daylight saving) as GMT,
// so its dates run two hours ahead. Over the 14 days to 4 November 2026, 126 of
// its 387 stories were dated more than five minutes after we fetched them, by at
// most 118 minutes, and no other publisher had more than one such story. If
// Daily Maverick corrects its feed, remove this entry: the dates would otherwise
// run two hours early.
const FEED_CLOCK_OFFSET_MINUTES: ReadonlyMap<string, number> = new Map([["dailymaverick.co.za", -120]]);

function hostOf(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
}

// Minutes to add to the dates in this publisher's feed (0 for most).
export function clockOffsetMinutes(source: { homepage?: string | null; rssUrl?: string | null }): number {
  for (const url of [source.homepage, source.rssUrl]) {
    const host = hostOf(url);
    const offset = host ? FEED_CLOCK_OFFSET_MINUTES.get(host) : undefined;
    if (offset !== undefined) return offset;
  }
  return 0;
}

export interface ResolvedDate {
  date: Date;
  // The feed gave a date later than the fetch, and it was pulled back.
  capped: boolean;
}

// `raw` is the date text from the feed. A missing or unreadable date is the
// fetch time. Otherwise the publisher's clock is corrected by `offsetMinutes`
// and the result is held to the fetch time at the latest.
export function resolvePublishedDate(raw: string | undefined, fetchedAt: Date, offsetMinutes = 0): ResolvedDate {
  const parsed = raw ? new Date(raw) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return { date: fetchedAt, capped: false };

  const corrected = new Date(parsed.getTime() + offsetMinutes * MINUTE_MS);
  if (corrected.getTime() > fetchedAt.getTime()) return { date: fetchedAt, capped: true };
  return { date: corrected, capped: false };
}
