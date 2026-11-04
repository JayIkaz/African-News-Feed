// A floor on how often scheduled ingestion runs.
//
// GitHub starts scheduled runs when it has capacity, and between 15 October and
// 4 November 2026 it started the hourly job 100 times in 20 days, a median of
// 4.9 hours apart. The workflow therefore asks for a run every 15 minutes, in
// the hope that more of the requests are honoured. If they all were, the job
// would fetch every publisher four times an hour, which is more than the
// publishers or the database need.
//
// So a scheduled run first looks at when any publisher was last fetched, and
// ends at once if that was less than the floor ago. A manual run is not held
// back (the workflow sets the floor to 0 for it).

// The floor in minutes from an environment value. Anything that is not a
// positive number means no floor.
export function parseMinInterval(value: string | undefined): number {
  const minutes = Number(value);
  return Number.isFinite(minutes) && minutes > 0 ? minutes : 0;
}

// True when the newest fetch is within `minIntervalMinutes` of `now`. With no
// fetch on record, or no floor, the run goes ahead. A fetch time in the future
// (a clock difference) counts as recent.
export function shouldSkipRun(lastFetched: Date | null | undefined, now: Date, minIntervalMinutes: number): boolean {
  if (minIntervalMinutes <= 0 || !lastFetched) return false;
  return now.getTime() - lastFetched.getTime() < minIntervalMinutes * 60 * 1000;
}
