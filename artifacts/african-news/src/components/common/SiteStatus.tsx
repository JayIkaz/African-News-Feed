import { formatDistanceToNowStrict } from "date-fns";
import { useLastUpdated } from "@/lib/useLastUpdated";
import { useSiteCounts } from "@/lib/useSiteCounts";

const plural = (n: number, one: string, many: string) => `${n.toLocaleString()} ${n === 1 ? one : many}`;

// One line above the stream: how much the site covers and how fresh it is.
// Every figure is read from the API. While they load a bar holds the place;
// if they cannot be read the line is left out, not guessed. The "updated"
// clause is dropped on its own when no fetch time is known.
export function SiteStatus() {
  const { countryCount, sourceCount, loading, ready } = useSiteCounts();
  const updated = useLastUpdated();

  if (loading) {
    return (
      <p className="an-site-status" aria-hidden="true">
        <span className="an-skeleton an-inline-skeleton an-inline-skeleton--wide" />
      </p>
    );
  }
  if (!ready) return null;

  const seconds = updated ? (Date.now() - updated.getTime()) / 1000 : 0;
  const when = updated ? (seconds < 60 ? "just now" : formatDistanceToNowStrict(updated, { addSuffix: true })) : null;

  return (
    <p className="an-site-status">
      {plural(countryCount, "country", "countries")}, {plural(sourceCount, "source", "sources")}
      {updated && when && (
        <>, updated <time dateTime={updated.toISOString()} title={updated.toLocaleString("en-GB")}>{when}</time></>
      )}
    </p>
  );
}
