// Advertising on the site. Two slots exist:
//   rail   300 x 250, the top of the right-hand column, level with the first
//          headline on the home page
//   inline full width, one row after the tenth story of a home page feed
//          (728 x 90 on desktop, 320 x 100 on phones)
//
// The inline slot with no creative renders nothing. The rail slot with no
// creative shows a 300 x 250 panel saying the space is available, linked to
// the Advertise page, so the column is held open. Add a creative here when an
// ad is sold; it replaces the panel at the same size. These are direct-sold images: they
// set no cookies and load no third-party script. Before any ad network goes
// in, the Privacy page needs an Advertising section and the site needs a
// consent banner (see the note at the top of src/pages/Privacy.tsx).
//
// A slot holds a list of creatives. With more than one, AdBanner cross-fades
// between them every few seconds. The first creative in the list is the one
// shown first, and the only one shown to visitors who have asked their device
// for reduced motion, so put the strongest one first.
export type AdSlotId = "rail" | "inline";

export interface AdCreative {
  image: string;
  // Optional phone-width version for the inline slot (320 x 100).
  mobileImage?: string;
  href: string;
  // Names the advertiser for screen readers: "Advertiser name: what it offers".
  alt: string;
}

const HORIZON_URL = "https://horizontuitionredbridge.co.uk/contact/";
const HORIZON_UTM = "utm_source=africannewsfeed&utm_medium=display&utm_campaign=horizon-trial";
const AUKIZAN_URL = "https://aukizan.com/";
const AUKIZAN_UTM = "utm_source=africannewsfeed&utm_medium=house&utm_campaign=cross-promo";

const CREATIVES: Partial<Record<AdSlotId, AdCreative[]>> = {
  // Trial placement for Horizon Tuition Redbridge. Delete the whole rail entry
  // when the trial ends and the "This space is available" panel returns.
  rail: [
    {
      image: "/ads/horizon-rail-b.png",
      href: `${HORIZON_URL}?${HORIZON_UTM}&utm_content=logo`,
      alt: "Horizon Tuition Redbridge: first two sessions free for Maths, English and Science tuition, ages 6 to 16",
    },
    {
      image: "/ads/horizon-rail.png",
      href: `${HORIZON_URL}?${HORIZON_UTM}&utm_content=offer`,
      alt: "Horizon Tuition Redbridge: small group Maths, English and Science tuition in Barkingside, first two sessions free",
    },
  ],
  // The publisher's own company.
  inline: [
    {
      image: "/ads/aukizan-inline-b.png",
      mobileImage: "/ads/aukizan-inline-b-mobile.png",
      href: `${AUKIZAN_URL}?${AUKIZAN_UTM}&utm_content=logo`,
      alt: "Aukizan: AI signal, ranked by credibility",
    },
    {
      image: "/ads/aukizan-inline.png",
      mobileImage: "/ads/aukizan-inline-mobile.png",
      href: `${AUKIZAN_URL}?${AUKIZAN_UTM}&utm_content=headline`,
      alt: "Aukizan: AI signal, ranked by credibility",
    },
  ],
};

// A build made with VITE_AD_TEST=1 fills both slots with plain test images, so
// layout and layout shift can be checked without a real ad. Ordinary builds
// leave the variable unset and this code is removed from the bundle. Each slot
// gets two test images so the rotation can be checked too.
function testImage(width: number, height: number, n: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="${n === 1 ? "#d9d4c7" : "#c9d3dc"}"/>` +
    `<text x="50%" y="50%" font-family="sans-serif" font-size="${Math.min(Math.round(width / 20), Math.round(height / 3))}" text-anchor="middle" dominant-baseline="middle" fill="#2a2823">Test advertisement ${n}: ${width} x ${height}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const TEST_CREATIVES: Partial<Record<AdSlotId, AdCreative[]>> | null =
  import.meta.env.VITE_AD_TEST === "1"
    ? {
        rail: [1, 2].map((n) => ({ image: testImage(300, 250, n), href: "#", alt: `Test advertisement ${n}` })),
        inline: [1, 2].map((n) => ({
          image: testImage(728, 90, n),
          mobileImage: testImage(320, 100, n),
          href: "#",
          alt: `Test advertisement ${n}`,
        })),
      }
    : null;

export function getAdCreatives(slot: AdSlotId): AdCreative[] {
  return (TEST_CREATIVES ?? CREATIVES)[slot] ?? [];
}
