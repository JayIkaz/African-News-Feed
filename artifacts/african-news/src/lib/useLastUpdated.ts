import { useEffect, useState } from "react";
import { getGetIngestionStatusQueryKey, useGetIngestionStatus } from "@workspace/api-client-react";

// When the hourly job last fetched a publisher: the newest lastFetched across
// every source, from the ingestion status endpoint. Null until it is known,
// and null if the endpoint fails or no source has a time, so the page leaves
// the claim out rather than guessing one.
export function useLastUpdated(): Date | null {
  const status = useGetIngestionStatus({
    query: {
      queryKey: getGetIngestionStatusQueryKey(),
      refetchInterval: 5 * 60 * 1000,
      staleTime: 60 * 1000,
    },
  });

  // Re-render once a minute so "14 minutes ago" does not stand still.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((n) => n + 1), 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  const times = (status.data ?? [])
    .map((s) => (s.lastFetched ? Date.parse(s.lastFetched) : NaN))
    .filter((t) => !Number.isNaN(t));
  return times.length > 0 ? new Date(Math.max(...times)) : null;
}
