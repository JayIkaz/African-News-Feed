import { AppLayout } from "@/components/layout/AppLayout";
import { usePageMeta } from "@/lib/usePageMeta";
import { CONTACT_EMAIL } from "@/lib/site";

// This page must describe what the site does today. When behaviour changes,
// change the matching paragraph in the same pull request:
//  - ads go live: add an Advertising section (network, cookies, how readers
//    accept or decline) and a consent banner, and rewrite "Cookies" and
//    "Technical data" to match
//  - the image fixes (P0-6, P3-1) ship: delete the thumbnails paragraph
//  - a regular newsletter starts: say what is sent and how often
export default function Privacy() {
  usePageMeta({
    title: "Privacy policy | AfricaNews",
    description: "What AfricaNews stores about you, who handles it, and how to ask us to change or delete it.",
  });

  return (
    <AppLayout>
      <div className="an-page">
        <h1>Privacy policy</h1>
        <p className="an-page-meta">Last updated: 3 October 2026</p>

        <h2>Who we are</h2>
        <p>
          AfricaNews (africannewsfeed.news) is operated by Auvane Limited, trading as Aukizan, a company registered in England and Wales (company number 13726607, registered office 61 Bridge Street, Kington, United Kingdom, HR5 3DJ). Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> with any question about this page. We handle personal data under the UK GDPR and the Data Protection Act 2018.
        </p>

        <h2>What we collect</h2>
        <p>
          Email address. If you subscribe to the newsletter, we store your address and the time you signed up, and we send you a welcome email that includes an unsubscribe link. We do not send a regular newsletter at present, and we will update this page before we start. We hold your address on the basis of your consent, which you can withdraw at any time.
        </p>
        <p>
          Technical data. When your browser loads the site, our hosting provider, Vercel, receives your IP address, your browser type and the pages you ask for. It uses them to deliver the site and keep it secure. We do not run analytics or advertising trackers on the site.
        </p>
        <p>
          Reading history. The stories you open are remembered in your browser's local storage so we can grey them out. The list stays on your device and is not sent to us. Clearing your browser data deletes it.
        </p>

        <h2>Cookies</h2>
        <p>AfricaNews sets no cookies of its own.</p>

        <h2>Other companies that handle data</h2>
        <p>Vercel hosts the site and its API.</p>
        <p>
          Resend sends our emails. When you subscribe, your email address is passed to Resend so it can deliver the welcome email.
        </p>
        <p>
          DeepL translates stories on request. When you translate a story, its title and summary are sent to DeepL, and the English text is saved with the story. Nothing about you is sent.
        </p>
        <p>
          Story thumbnails load from the publisher's own server, or from the stock-photo service loremflickr.com when a story has no image, so those services see your request.
        </p>

        <h2>How long we keep data</h2>
        <p>We keep your email address until you unsubscribe or ask us to delete it.</p>

        <h2>Your choices</h2>
        <p>
          You can ask us what we hold about you, ask us to correct or delete it, and ask us to stop emailing you. Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>. You can withdraw your consent at any time by unsubscribing or by writing to us. If you are unhappy with how we handle your data, you can complain to the Information Commissioner's Office at <a href="https://ico.org.uk" target="_blank" rel="noopener noreferrer">ico.org.uk</a>.
        </p>

        <h2>Changes</h2>
        <p>We will post any change on this page and update the date at the top.</p>
      </div>
    </AppLayout>
  );
}
