import { useListCountries, useListSources } from "@workspace/api-client-react";

// Counts shown in copy come from the API, never typed into a component.
// - sources: active sources that have a feed, which is what the hourly job reads
//   (the countries endpoint also counts switched-off sources, so it overstates)
// - countries: rows from the countries endpoint, the countries with stories
export function useSiteCounts() {
  const sources = useListSources();
  const countries = useListCountries();

  const activeSources = (sources.data ?? []).filter(s => s.isActive && !!s.rssUrl);
  const loading = sources.isLoading || countries.isLoading;
  const failed = sources.isError || countries.isError;

  return {
    activeSources,
    sourceCount: activeSources.length,
    countryCount: countries.data?.length ?? 0,
    loading,
    ready: !loading && !failed && activeSources.length > 0 && (countries.data?.length ?? 0) > 0,
  };
}
