import { useListCountries } from "@workspace/api-client-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { usePageMeta } from "@/lib/usePageMeta";
import { useSiteCounts } from "@/lib/useSiteCounts";
import { ADVERTISE_EMAIL } from "@/lib/site";

// Every figure on this page is read from the API. Audience size, reader
// demographics and read times are not here because the site does not measure
// them. If analytics are added later, quote them only with their source.
export default function Advertise() {
  usePageMeta({
    title: "Advertise | AfricaNews",
    description: "Where adverts appear on AfricaNews, how they are labelled, and how to get in touch.",
  });
  const { sourceCount, countryCount, loading, ready } = useSiteCounts();
  const { data: countries } = useListCountries();
  const articleCount = (countries ?? []).reduce((sum, c) => sum + c.articleCount, 0);

  const skeleton = (wide = false) => <span className={`an-skeleton an-inline-skeleton${wide ? " an-inline-skeleton--wide" : ""}`} aria-hidden="true" />;

  return (
    <AppLayout>
      <div className="an-page">
        <h1>Advertise on AfricaNews</h1>
        <p>
          AfricaNews shows headlines from{" "}
          {ready ? (
            <>{sourceCount} African news publishers in {countryCount} countries, and has collected {articleCount.toLocaleString()} stories so far.</>
          ) : loading ? (
            <>{skeleton()} African news publishers in {skeleton()} countries, and has collected {skeleton(true)} stories so far.</>
          ) : (
            <>African news publishers in one stream.</>
          )}{" "}
          Adverts sit beside those headlines and are always labelled.
        </p>

        <h2>Where adverts appear</h2>
        <ul className="an-page-list">
          <li>
            <strong>Right-hand column, 300 × 250.</strong> The top of the right-hand column on the home, category, country and publisher pages, beside the stories. On a phone it comes after the list of stories.
          </li>
          <li>
            <strong>Between stories, full width.</strong> One row after the tenth story of the home page feed, 728 × 90 on a desktop screen and 320 × 100 on a phone.
          </li>
        </ul>
        <p>Both placements are available now.</p>

        <h2>How adverts are shown</h2>
        <p>
          Every advert carries the label "Advertisement". None appears above the first headline. Stories are ordered by the time their publisher posted them, and nobody can pay to move one.
        </p>

        <h2>What we can tell you</h2>
        <p>
          This page quotes only figures the site counts for itself. We do not publish audience size or reader demographics. Write to us and we will tell you what we can measure at the time you ask.
        </p>

        <h2>Get in touch</h2>
        <p>
          Write to <a href={`mailto:${ADVERTISE_EMAIL}`}>{ADVERTISE_EMAIL}</a> with the placement you want, your dates and the size of your advert. We will reply with availability and terms.
        </p>
      </div>
    </AppLayout>
  );
}
