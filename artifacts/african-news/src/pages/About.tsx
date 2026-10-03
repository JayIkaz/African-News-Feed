import { AppLayout } from "@/components/layout/AppLayout";
import { usePageMeta } from "@/lib/usePageMeta";
import { useSiteCounts } from "@/lib/useSiteCounts";
import { CONTACT_EMAIL, ADVERTISE_EMAIL } from "@/lib/site";

export default function About() {
  usePageMeta({
    title: "About | AfricaNews",
    description: "AfricaNews collects headlines from African news publishers in one stream, newest first, with a link to the publisher for every story.",
  });
  const { sourceCount, countryCount, loading, ready } = useSiteCounts();

  const skeleton = <span className="an-skeleton an-inline-skeleton" aria-hidden="true" />;

  return (
    <AppLayout>
      <div className="an-page">
        <h1>About AfricaNews</h1>
        <p>
          AfricaNews collects headlines from{" "}
          {ready ? <>{sourceCount} African news publishers in {countryCount} countries</> : loading ? <>{skeleton} African news publishers in {skeleton} countries</> : <>African news publishers across the continent</>}{" "}
          and shows them in one stream, newest first. Every story links to the publisher that wrote it. We do not write, edit or rank the news.
        </p>

        <h2>How it works</h2>
        <p>
          Every hour, a script reads each publisher's public news feed and stores the headline, a short summary, the time of publication and the link. The stream shows them in the order they were published. Nobody chooses which stories appear.
        </p>

        <h2>Languages</h2>
        <p>
          Most stories are in English. Some are in French, Portuguese or Arabic, and you can translate those into English with one tap. DeepL produces the translations by machine, so they can contain errors.
        </p>

        <h2>Coverage</h2>
        <p>
          Some regions publish far more online than others, and the stream reflects that. A quiet stretch for a country usually means its publishers posted little, and says nothing about whether anything happened.
        </p>

        <h2>Who runs it</h2>
        <p>
          AfricaNews is operated by Auvane Limited, trading as Aukizan, a company registered in England and Wales (company number 13726607). Its registered office is 61 Bridge Street, Kington, United Kingdom, HR5 3DJ. AfricaNews exists to put what African publishers report in one place, so you can follow the continent without visiting dozens of sites.
        </p>

        <h2>Contact</h2>
        <p>
          Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with any question. Publishers who want a source removed, corrected or added can write to the same address. Advertising enquiries go to <a href={`mailto:${ADVERTISE_EMAIL}`}>{ADVERTISE_EMAIL}</a>.
        </p>
      </div>
    </AppLayout>
  );
}
