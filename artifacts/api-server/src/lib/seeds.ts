import { db } from "@workspace/db";
import { sourcesTable } from "@workspace/db/schema";
import { count } from "drizzle-orm";

// Every rssUrl below was verified working (HTTP 200, valid RSS/Atom with items)
// on 2026-07-19 using a browser-like User-Agent. Sources with rssUrl: null have
// no server-fetchable feed (WAF-blocked or none published) — kept for reference.
export const SOURCES = [
  // Nigeria — guardian.ng, thenationonlineng.net and punchng.com feeds are
  // WAF-blocked or empty; replaced with Daily Trust / ThisDay / Daily Post.
  { name: "Vanguard", country: "Nigeria", homepage: "https://www.vanguardngr.com", rssUrl: "https://www.vanguardngr.com/feed/" },
  { name: "Premium Times", country: "Nigeria", homepage: "https://www.premiumtimesng.com", rssUrl: "https://www.premiumtimesng.com/feed" },
  { name: "BusinessDay Nigeria", country: "Nigeria", homepage: "https://businessday.ng", rssUrl: "https://businessday.ng/feed/" },
  { name: "ThisDay Live", country: "Nigeria", homepage: "https://www.thisdaylive.com", rssUrl: "https://www.thisdaylive.com/feed/" },
  { name: "Daily Trust", country: "Nigeria", homepage: "https://dailytrust.com", rssUrl: "https://dailytrust.com/feed/" },
  { name: "Sahara Reporters", country: "Nigeria", homepage: "https://saharareporters.com", rssUrl: "https://saharareporters.com/rss.xml" },
  { name: "Daily Post Nigeria", country: "Nigeria", homepage: "https://dailypost.ng", rssUrl: "https://dailypost.ng/feed/" },
  { name: "Leadership Nigeria", country: "Nigeria", homepage: "https://leadership.ng", rssUrl: "https://leadership.ng/feed/" },
  // South Africa — News24 feeds are gone (feeds.24.com DNS dead, Arc feed 403);
  // The South African added instead.
  { name: "Business Day SA", country: "South Africa", homepage: "https://www.businessday.co.za", rssUrl: "https://www.businessday.co.za/arc/outboundfeeds/rss/?outputType=xml" },
  { name: "Daily Maverick", country: "South Africa", homepage: "https://www.dailymaverick.co.za", rssUrl: "https://www.dailymaverick.co.za/dmrss/" },
  { name: "Mail & Guardian", country: "South Africa", homepage: "https://mg.co.za", rssUrl: "https://mg.co.za/rss/" },
  { name: "The South African", country: "South Africa", homepage: "https://www.thesouthafrican.com", rssUrl: "https://www.thesouthafrican.com/feed/" },
  // Kenya — the-star.co.ke has no feed; Capital FM moved to capitalfm.africa.
  { name: "Daily Nation", country: "Kenya", homepage: "https://nation.africa", rssUrl: "https://nation.africa/kenya/rss.xml" },
  { name: "The Standard Kenya", country: "Kenya", homepage: "https://www.standardmedia.co.ke", rssUrl: "https://www.standardmedia.co.ke/rss/headlines.php" },
  { name: "Capital FM Kenya", country: "Kenya", homepage: "https://capitalfm.africa", rssUrl: "https://capitalfm.africa/news/feed/" },
  { name: "Business Daily Africa", country: "Kenya", homepage: "https://www.businessdailyafrica.com", rssUrl: "https://www.businessdailyafrica.com/bd/rss.xml" },
  // Egypt — english.ahram.org.eg is WAF-blocked; Daily News Egypt instead.
  { name: "Egypt Independent", country: "Egypt", homepage: "https://www.egyptindependent.com", rssUrl: "https://www.egyptindependent.com/feed/" },
  { name: "Daily News Egypt", country: "Egypt", homepage: "https://www.dailynewsegypt.com", rssUrl: "https://www.dailynewsegypt.com/feed/" },
  // Ghana — citifmonline is dead (3News replaces it); GhanaWeb feed moved to CDN.
  { name: "Ghana Web", country: "Ghana", homepage: "https://www.ghanaweb.com", rssUrl: "https://cdn.ghanaweb.com/feed/newsfeed.xml" },
  { name: "Myjoyonline", country: "Ghana", homepage: "https://www.myjoyonline.com", rssUrl: "https://www.myjoyonline.com/feed/" },
  { name: "3News Ghana", country: "Ghana", homepage: "https://3news.com", rssUrl: "https://3news.com/feed.xml" },
  // Morocco — moroccoworldnews.com is WAF-blocked; Hespress EN instead.
  { name: "Hespress English", country: "Morocco", homepage: "https://en.hespress.com", rssUrl: "https://en.hespress.com/feed" },
  { name: "Le360", country: "Morocco", homepage: "https://en.le360.ma", rssUrl: "https://en.le360.ma/arc/outboundfeeds/rss/?outputType=xml" },
  // Ethiopia — addisstandard.com is WAF-blocked; The Reporter instead.
  { name: "The Reporter Ethiopia", country: "Ethiopia", homepage: "https://www.thereporterethiopia.com", rssUrl: "https://www.thereporterethiopia.com/feed/" },
  { name: "Ethiopian Monitor", country: "Ethiopia", homepage: "https://ethiopianmonitor.com", rssUrl: "https://ethiopianmonitor.com/feed/" },
  // Tanzania — Nation Media sites now serve rss.xml at the site root.
  { name: "The Citizen Tanzania", country: "Tanzania", homepage: "https://www.thecitizen.co.tz", rssUrl: "https://www.thecitizen.co.tz/rss.xml" },
  { name: "Mwananchi", country: "Tanzania", homepage: "https://www.mwananchi.co.tz", rssUrl: "https://www.mwananchi.co.tz/rss.xml" },
  // Uganda — newvision.co.ug has no fetchable feed; Nile Post instead.
  { name: "Nile Post", country: "Uganda", homepage: "https://nilepost.co.ug", rssUrl: "https://nilepost.co.ug/feed" },
  { name: "Daily Monitor Uganda", country: "Uganda", homepage: "https://www.monitor.co.ug", rssUrl: "https://www.monitor.co.ug/rss.xml" },
  // Algeria — aps.dz has no working feed; Echorouk EN instead.
  { name: "Echorouk Online", country: "Algeria", homepage: "https://www.echoroukonline.com", rssUrl: "https://www.echoroukonline.com/feed" },
  // Zimbabwe — Herald moved to heraldonline.co.zw; newsday.co.zw feed is gone.
  { name: "The Herald Zimbabwe", country: "Zimbabwe", homepage: "https://www.heraldonline.co.zw", rssUrl: "https://www.heraldonline.co.zw/feed/" },
  { name: "NewZimbabwe", country: "Zimbabwe", homepage: "https://www.newzimbabwe.com", rssUrl: "https://www.newzimbabwe.com/feed/" },
  // Angola — no outlet with a working server-fetchable feed found.
  { name: "Angola Press Agency", country: "Angola", homepage: "https://www.angop.ao/en", rssUrl: null },
  // Tunisia — africanmanager.com/en feed is dead; French edition works.
  { name: "Tunisia Live", country: "Tunisia", homepage: "https://www.tunisia-live.net", rssUrl: "https://www.tunisia-live.net/feed/" },
  { name: "African Manager", country: "Tunisia", homepage: "https://africanmanager.com", rssUrl: "https://africanmanager.com/feed/" },
  // Senegal — Dakaractu uses the WMaker platform syndication URL.
  { name: "Dakar Actu", country: "Senegal", homepage: "https://www.dakaractu.com", rssUrl: "https://www.dakaractu.com/xml/syndication.rss" },
  { name: "Senego", country: "Senegal", homepage: "https://senego.com", rssUrl: "https://senego.com/feed" },
  // Rwanda — newtimes.co.rw has no working feed; KT Press instead.
  { name: "KT Press", country: "Rwanda", homepage: "https://www.ktpress.rw", rssUrl: "https://www.ktpress.rw/feed/" },
  // Cameroon — cameroon-tribune.cm has no feed; Journal du Cameroun EN instead.
  { name: "Journal du Cameroun", country: "Cameroon", homepage: "https://en.journalducameroun.com", rssUrl: "https://en.journalducameroun.com/feed/" },
  // Zambia — zambiareports moved to .news domain.
  { name: "Lusaka Times", country: "Zambia", homepage: "https://www.lusakatimes.com", rssUrl: "https://www.lusakatimes.com/feed/" },
  { name: "Daily Mail Zambia", country: "Zambia", homepage: "https://www.daily-mail.co.zm", rssUrl: "https://www.daily-mail.co.zm/feed/" },
  { name: "Zambia Reports", country: "Zambia", homepage: "https://zambiareports.news", rssUrl: "https://zambiareports.news/feed/" },
  { name: "Diggers News", country: "Zambia", homepage: "https://diggers.news", rssUrl: "https://diggers.news/feed/" },
  // Malawi
  { name: "Nyasa Times", country: "Malawi", homepage: "https://www.nyasatimes.com", rssUrl: "https://www.nyasatimes.com/feed/" },
  // Libya
  { name: "Libya Herald", country: "Libya", homepage: "https://libyaherald.com", rssUrl: "https://libyaherald.com/feed/" },
  // Liberia — FrontPage Africa moved to fpa.news.
  { name: "FrontPage Africa", country: "Liberia", homepage: "https://fpa.news", rssUrl: "https://fpa.news/feed/" },
  // Burundi
  { name: "Iwacu Burundi", country: "Burundi", homepage: "https://www.iwacu-burundi.org", rssUrl: "https://www.iwacu-burundi.org/feed/" },
  // Lesotho — /feed/ serves HTML; the query-string form works.
  { name: "Lesotho Times", country: "Lesotho", homepage: "https://lestimes.com", rssUrl: "https://lestimes.com/?feed=rss2" },
  // South Sudan
  { name: "Eye Radio", country: "South Sudan", homepage: "https://www.eyeradio.org", rssUrl: "https://www.eyeradio.org/feed/" },
  // Eswatini
  { name: "Times of Eswatini", country: "Eswatini", homepage: "https://times.co.sz", rssUrl: "https://times.co.sz/feed/" },
  // DR Congo — 7sur7.cd feed is dead; Actualité.cd instead.
  { name: "Radio Okapi", country: "DR Congo", homepage: "https://www.radiookapi.net", rssUrl: "https://www.radiookapi.net/feed" },
  { name: "Actualité.cd", country: "DR Congo", homepage: "https://actualite.cd", rssUrl: "https://actualite.cd/feed" },
  // Mozambique
  { name: "Club of Mozambique", country: "Mozambique", homepage: "https://clubofmozambique.com", rssUrl: "https://clubofmozambique.com/feed/" },
  // Botswana — mmegi.bw no longer publishes a feed.
  { name: "Mmegi Online", country: "Botswana", homepage: "https://www.mmegi.bw", rssUrl: null },
  // Namibia — feed unreachable from server-side fetch at last check; kept for retry.
  { name: "The Namibian", country: "Namibia", homepage: "https://www.namibian.com.na", rssUrl: "https://www.namibian.com.na/feed/" },
  // Ivory Coast — news.abidjan.net has no working feed; AIP is the state agency.
  { name: "Connectionivoirienne", country: "Ivory Coast", homepage: "https://connectionivoirienne.net", rssUrl: "https://connectionivoirienne.net/feed/" },
  { name: "AIP Côte d'Ivoire", country: "Ivory Coast", homepage: "https://www.aip.ci", rssUrl: "https://www.aip.ci/feed/" },
  // Sudan — WAF-blocked at last check; kept for retry from other networks.
  { name: "Sudan Tribune", country: "Sudan", homepage: "https://sudantribune.com", rssUrl: "https://sudantribune.com/feed/" },
  // Somalia — feed returned HTTP 500 at last check; kept for retry.
  { name: "Garowe Online", country: "Somalia", homepage: "https://www.garoweonline.com", rssUrl: "https://www.garoweonline.com/en/feed" },
];

export async function seedSourcesIfEmpty(): Promise<void> {
  const result = await db.select({ count: count() }).from(sourcesTable);
  const existing = result[0]?.count ?? 0;

  if (existing > 0) {
    console.log(`[seeds] ${existing} sources already in DB, skipping seed`);
    return;
  }

  console.log("[seeds] Seeding news sources...");
  for (const source of SOURCES) {
    await db
      .insert(sourcesTable)
      .values({
        name: source.name,
        country: source.country,
        homepage: source.homepage,
        rssUrl: source.rssUrl ?? null,
        isActive: true,
        fetchStatus: "pending",
        articlesFetched: 0,
      })
      .onConflictDoNothing();
  }
  console.log(`[seeds] Seeded ${SOURCES.length} news sources`);
}
