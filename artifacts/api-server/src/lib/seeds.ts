import { db } from "@workspace/db";
import { sourcesTable } from "@workspace/db/schema";
import { count } from "drizzle-orm";

const SOURCES = [
  { name: "The Guardian Nigeria", country: "Nigeria", homepage: "https://guardian.ng", rssUrl: "https://guardian.ng/feed/" },
  { name: "Vanguard", country: "Nigeria", homepage: "https://www.vanguardngr.com", rssUrl: "https://www.vanguardngr.com/feed/" },
  { name: "Punch", country: "Nigeria", homepage: "https://punchng.com", rssUrl: "https://punchng.com/feed/" },
  { name: "Premium Times", country: "Nigeria", homepage: "https://www.premiumtimesng.com", rssUrl: "https://www.premiumtimesng.com/feed/" },
  { name: "The Nation", country: "Nigeria", homepage: "https://thenationonlineng.net", rssUrl: "https://thenationonlineng.net/feed/" },
  { name: "BusinessDay Nigeria", country: "Nigeria", homepage: "https://businessday.ng", rssUrl: "https://businessday.ng/feed/" },
  { name: "ThisDay Live", country: "Nigeria", homepage: "https://www.thisdaylive.com", rssUrl: "https://www.thisdaylive.com/feed/" },
  { name: "Daily Trust", country: "Nigeria", homepage: "https://dailytrust.com", rssUrl: "https://dailytrust.com/feed/" },
  { name: "Sahara Reporters", country: "Nigeria", homepage: "https://saharareporters.com", rssUrl: "https://saharareporters.com/rss.xml" },
  { name: "Business Day SA", country: "South Africa", homepage: "https://www.businesslive.co.za", rssUrl: "https://www.businesslive.co.za/rss/feed.xml" },
  { name: "Daily Maverick", country: "South Africa", homepage: "https://www.dailymaverick.co.za", rssUrl: "https://www.dailymaverick.co.za/feed/" },
  { name: "News24", country: "South Africa", homepage: "https://www.news24.com", rssUrl: "https://feeds.24.com/articles/news24/TopStories/rss" },
  { name: "Mail & Guardian", country: "South Africa", homepage: "https://mg.co.za", rssUrl: "https://mg.co.za/feed/" },
  { name: "Daily Nation", country: "Kenya", homepage: "https://nation.africa", rssUrl: "https://nation.africa/kenya/rss.xml" },
  { name: "The Standard Kenya", country: "Kenya", homepage: "https://www.standardmedia.co.ke", rssUrl: "https://www.standardmedia.co.ke/rss/all-stories" },
  { name: "The Star Kenya", country: "Kenya", homepage: "https://www.the-star.co.ke", rssUrl: "https://www.the-star.co.ke/rss.xml" },
  { name: "Egypt Independent", country: "Egypt", homepage: "https://egyptindependent.com", rssUrl: "https://egyptindependent.com/feed/" },
  { name: "Ahram Online", country: "Egypt", homepage: "https://english.ahram.org.eg", rssUrl: "https://english.ahram.org.eg/rss/NewsContent/1/64.aspx" },
  { name: "Ghana Web", country: "Ghana", homepage: "https://www.ghanaweb.com", rssUrl: "https://www.ghanaweb.com/GhanaHomePage/rss/News.xml" },
  { name: "Myjoyonline", country: "Ghana", homepage: "https://www.myjoyonline.com", rssUrl: "https://www.myjoyonline.com/feed/" },
  { name: "CitiFM Ghana", country: "Ghana", homepage: "https://citifmonline.com", rssUrl: "https://citifmonline.com/feed/" },
  { name: "Morocco World News", country: "Morocco", homepage: "https://www.moroccoworldnews.com", rssUrl: "https://www.moroccoworldnews.com/feed/" },
  { name: "Le360", country: "Morocco", homepage: "https://en.le360.ma", rssUrl: "https://en.le360.ma/rss.xml" },
  { name: "Addis Standard", country: "Ethiopia", homepage: "https://addisstandard.com", rssUrl: "https://addisstandard.com/feed/" },
  { name: "Ethiopian Monitor", country: "Ethiopia", homepage: "https://ethiopianmonitor.com", rssUrl: "https://ethiopianmonitor.com/feed/" },
  { name: "The Citizen Tanzania", country: "Tanzania", homepage: "https://www.thecitizen.co.tz", rssUrl: "https://www.thecitizen.co.tz/tanzania/rss.xml" },
  { name: "Mwananchi", country: "Tanzania", homepage: "https://www.mwananchi.co.tz", rssUrl: "https://www.mwananchi.co.tz/mw/rss.xml" },
  { name: "New Vision Uganda", country: "Uganda", homepage: "https://www.newvision.co.ug", rssUrl: "https://www.newvision.co.ug/feed" },
  { name: "Daily Monitor Uganda", country: "Uganda", homepage: "https://www.monitor.co.ug", rssUrl: "https://www.monitor.co.ug/uganda/rss.xml" },
  { name: "Algeria Press Service", country: "Algeria", homepage: "https://www.aps.dz/en", rssUrl: "https://www.aps.dz/en/rss.xml" },
  { name: "The Herald Zimbabwe", country: "Zimbabwe", homepage: "https://www.herald.co.zw", rssUrl: "https://www.herald.co.zw/feed/" },
  { name: "NewsDay Zimbabwe", country: "Zimbabwe", homepage: "https://www.newsday.co.zw", rssUrl: "https://www.newsday.co.zw/feed/" },
  { name: "Angola Press Agency", country: "Angola", homepage: "https://www.angop.ao/en", rssUrl: null },
  { name: "Abidjan.net", country: "Ivory Coast", homepage: "https://news.abidjan.net", rssUrl: null },
  { name: "Tunisia Live", country: "Tunisia", homepage: "https://www.tunisia-live.net", rssUrl: "https://www.tunisia-live.net/feed/" },
  { name: "African Manager", country: "Tunisia", homepage: "https://africanmanager.com/en", rssUrl: "https://africanmanager.com/en/feed/" },
  { name: "Dakar Actu", country: "Senegal", homepage: "https://www.dakaractu.com", rssUrl: "https://www.dakaractu.com/rss.xml" },
  { name: "The New Times Rwanda", country: "Rwanda", homepage: "https://www.newtimes.co.rw", rssUrl: "https://www.newtimes.co.rw/rss.xml" },
  { name: "Cameroon Tribune", country: "Cameroon", homepage: "https://www.cameroon-tribune.cm", rssUrl: "https://www.cameroon-tribune.cm/rss.xml" },
  // Kenya additional
  { name: "Capital FM Kenya", country: "Kenya", homepage: "https://www.capitalfm.co.ke", rssUrl: "https://www.capitalfm.co.ke/news/feed/" },
  { name: "Business Daily Africa", country: "Kenya", homepage: "https://www.businessdailyafrica.com", rssUrl: "https://www.businessdailyafrica.com/feed/" },
  { name: "The Standard Kenya", country: "Kenya", homepage: "https://www.standardmedia.co.ke", rssUrl: "https://www.standardmedia.co.ke/rss" },
  // Zambia
  { name: "Lusaka Times", country: "Zambia", homepage: "https://www.lusakatimes.com", rssUrl: "https://www.lusakatimes.com/feed/" },
  { name: "Daily Mail Zambia", country: "Zambia", homepage: "https://www.daily-mail.co.zm", rssUrl: "https://www.daily-mail.co.zm/feed/" },
  { name: "Zambia Reports", country: "Zambia", homepage: "https://zambiareports.com", rssUrl: "https://zambiareports.com/feed/" },
  { name: "Diggers News", country: "Zambia", homepage: "https://diggers.news", rssUrl: "https://diggers.news/feed/" },
  // Malawi
  { name: "Nyasa Times", country: "Malawi", homepage: "https://www.nyasatimes.com", rssUrl: "https://www.nyasatimes.com/feed/" },
  // Libya
  { name: "Libya Herald", country: "Libya", homepage: "https://libyaherald.com", rssUrl: "https://libyaherald.com/feed/" },
  // Liberia
  { name: "FrontPage Africa", country: "Liberia", homepage: "https://frontpageafricaonline.com", rssUrl: "https://frontpageafricaonline.com/feed/" },
  // Eritrea
  { name: "TesfaNews", country: "Eritrea", homepage: "https://www.tesfanews.net", rssUrl: "https://www.tesfanews.net/feed/" },
  // Burundi
  { name: "Iwacu Burundi", country: "Burundi", homepage: "https://www.iwacu-burundi.org", rssUrl: "https://www.iwacu-burundi.org/feed/" },
  // Lesotho
  { name: "Lesotho Times", country: "Lesotho", homepage: "https://lestimes.com", rssUrl: "https://lestimes.com/feed/" },
  // South Sudan
  { name: "Eye Radio", country: "South Sudan", homepage: "https://eyeradio.org", rssUrl: "https://eyeradio.org/feed/" },
  // Eswatini
  { name: "Times of Eswatini", country: "Eswatini", homepage: "https://times.co.sz", rssUrl: "https://times.co.sz/feed/" },
  // DR Congo (Central Africa)
  { name: "Radio Okapi", country: "DR Congo", homepage: "https://www.radiookapi.net", rssUrl: "https://www.radiookapi.net/feed" },
  { name: "7sur7 Congo", country: "DR Congo", homepage: "https://7sur7.cd", rssUrl: "https://7sur7.cd/feed/" },
  // Mozambique
  { name: "Club of Mozambique", country: "Mozambique", homepage: "https://clubofmozambique.com", rssUrl: "https://clubofmozambique.com/feed/" },
  // Botswana
  { name: "Mmegi Online", country: "Botswana", homepage: "https://www.mmegi.bw", rssUrl: "https://www.mmegi.bw/rss.xml" },
  // Namibia
  { name: "The Namibian", country: "Namibia", homepage: "https://www.namibian.com.na", rssUrl: "https://www.namibian.com.na/feed/" },
  // Senegal
  { name: "Senego", country: "Senegal", homepage: "https://senego.com", rssUrl: "https://senego.com/feed/" },
  // Ivory Coast
  { name: "Connectionivoirienne", country: "Ivory Coast", homepage: "https://www.connectionivoirienne.net", rssUrl: "https://www.connectionivoirienne.net/feed/" },
  { name: "AIP Côte d'Ivoire", country: "Ivory Coast", homepage: "https://www.aip.ci", rssUrl: "https://www.aip.ci/feed/" },
  // Sudan
  { name: "Sudan Tribune", country: "Sudan", homepage: "https://sudantribune.com", rssUrl: "https://sudantribune.com/rss.xml" },
  // Somalia
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
