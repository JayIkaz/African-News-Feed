// Advertising on the site. Two slots exist:
//   rail   300 x 250, the foot of the right-hand column on the home page
//   inline full width, one row after the tenth story of a home page feed
//          (728 x 90 on desktop, 320 x 100 on phones)
//
// A slot with no creative renders nothing, so the page shows no empty box.
// Add a creative here when an ad is sold. These are direct-sold images: they
// set no cookies and load no third-party script. Before any ad network goes
// in, the Privacy page needs an Advertising section and the site needs a
// consent banner (see the note at the top of src/pages/Privacy.tsx).
export type AdSlotId = "rail" | "inline";

export interface AdCreative {
  image: string;
  // Optional phone-width version for the inline slot (320 x 100).
  mobileImage?: string;
  href: string;
  // Names the advertiser for screen readers: "Advertiser name: what it offers".
  alt: string;
}

const CREATIVES: Partial<Record<AdSlotId, AdCreative>> = {};

// A build made with VITE_AD_TEST=1 fills both slots with plain test images, so
// layout and layout shift can be checked without a real ad. Ordinary builds
// leave the variable unset and this code is removed from the bundle.
function testImage(width: number, height: number): string {
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
    `<rect width="100%" height="100%" fill="#d9d4c7"/>` +
    `<text x="50%" y="50%" font-family="sans-serif" font-size="${Math.min(Math.round(width / 20), Math.round(height / 3))}" text-anchor="middle" dominant-baseline="middle" fill="#2a2823">Test advertisement ${width} x ${height}</text>` +
    `</svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const TEST_CREATIVES: Partial<Record<AdSlotId, AdCreative>> | null =
  import.meta.env.VITE_AD_TEST === "1"
    ? {
        rail: { image: testImage(300, 250), href: "#", alt: "Test advertisement" },
        inline: { image: testImage(728, 90), mobileImage: testImage(320, 100), href: "#", alt: "Test advertisement" },
      }
    : null;

export function getAdCreative(slot: AdSlotId): AdCreative | undefined {
  return (TEST_CREATIVES ?? CREATIVES)[slot];
}
