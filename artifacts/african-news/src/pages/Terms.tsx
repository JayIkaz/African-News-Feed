import { AppLayout } from "@/components/layout/AppLayout";
import { usePageMeta } from "@/lib/usePageMeta";
import { CONTACT_EMAIL } from "@/lib/site";

// When ads go live, add an Advertising section: ads are labelled as
// advertisements, advertisers are responsible for their own content, and
// showing an ad does not mean we endorse it. Have a lawyer read this page
// before then.
export default function Terms() {
  usePageMeta({
    title: "Terms of use | AfricaNews",
    description: "The terms for using AfricaNews, a news aggregator that links to publishers' own stories.",
  });

  return (
    <AppLayout>
      <div className="an-page">
        <h1>Terms of use</h1>
        <p className="an-page-meta">Last updated: 3 October 2026</p>

        <h2>Using AfricaNews</h2>
        <p>
          AfricaNews is a news aggregator. By using the site you agree to these terms. If you do not agree, please do not use it.
        </p>

        <h2>What we show</h2>
        <p>
          We show headlines, short summaries and thumbnails taken from publishers' public feeds, with a link to the original story. The stories belong to their publishers. We do not claim ownership of them and we do not endorse what they say.
        </p>

        <h2>Accuracy</h2>
        <p>
          We display what publishers send and we do not check it for accuracy. The order of stories follows the time of publication and says nothing about importance. Machine translations can be wrong. Do not rely on the site for legal, financial or medical decisions.
        </p>

        <h2>Your use of the site</h2>
        <p>
          Use the site for lawful reading. Do not scrape it at volume, overload it, or try to reach parts of it you are not meant to use.
        </p>

        <h2>Publishers' requests</h2>
        <p>
          If you publish a source shown here and want it removed or changed, write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. We aim to reply within 5 working days.
        </p>

        <h2>Liability</h2>
        <p>
          The site is provided as it is. To the extent the law allows, we are not liable for loss arising from your use of the site or from your reliance on content written by others. Nothing in these terms limits liability that the law does not allow us to limit, including for death or personal injury caused by negligence, or for fraud.
        </p>

        <h2>Governing law</h2>
        <p>These terms are governed by the law of England and Wales, and the courts of England and Wales have jurisdiction.</p>

        <h2>Changes</h2>
        <p>We may update these terms. If you keep using the site after a change, you accept the new version.</p>
      </div>
    </AppLayout>
  );
}
