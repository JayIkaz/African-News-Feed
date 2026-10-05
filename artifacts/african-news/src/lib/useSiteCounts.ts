import { useListCountries, useListSources } from "@workspace/api-client-react";

// Counts shown in copy come from the API, never typed into a component.
// - activeSources: sources that are switched on and have a feed, which is what
//   the ingestion job reads. The Sources page lists all of them. (The countries
//   endpoint also counts switched-off sources, so it overstates.)
// - deliveredSources: the active ones that have delivered at least one story.
//   A publisher with no story on the site is not one the site "has", so this
//   is the group every public count of publishers uses (sourceCount).
// - countries: rows from the countries endpoint, the countries with stories
export function useSiteCounts() {
  const sources = useListSources();
  const countries = useListCountries();

  const activeSources = (sources.data ?? []).filter(s => s.isActive && !!s.rssUrl);
  const deliveredSources = activeSources.filter(s => s.articleCount > 0);
  const loading = sources.isLoading || countries.isLoading;
  const failed = sources.isError || countries.isError;

  return {
    activeSources,
    deliveredSources,
    sourceCount: deliveredSources.length,
    countryCount: countries.data?.length ?? 0,
    loading,
    ready: !loading && !failed && deliveredSources.length > 0 && (countries.data?.length ?? 0) > 0,
  };
}
