import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { getAdCreative, type AdSlotId } from "@/lib/ads";

interface AdBannerProps {
  slot: AdSlotId;
}

// The right-hand column slot is held open before an advert is sold: a panel of
// the same 300 x 250 size says the space is available and links to the
// Advertise page. When a creative is configured in src/lib/ads.ts it takes the
// panel's place at the same size, so nothing around it moves. The panel is the
// site's own notice, not an advertisement, so it carries no "Advertisement"
// label.
function AvailableRailSlot() {
  return (
    <div className="an-ad an-ad--rail an-ad--available">
      <Link href="/advertise" className="an-ad-frame an-ad-available">
        <span className="an-ad-available-kicker">Advertising</span>
        <span className="an-ad-available-title">This space is available</span>
        <span className="an-ad-available-text">Place your brand beside African news headlines. Adverts are always labelled.</span>
        <span className="an-ad-available-link">
          See advertising options <ArrowRight size={15} aria-hidden="true" />
        </span>
      </Link>
    </div>
  );
}

// The inline slot renders nothing until a creative is configured. When one is,
// the box has a fixed aspect ratio from the first paint (see .an-ad in
// index.css), so a slow image cannot move the content around it. The label is
// visible text, not just a screen-reader name, so readers can tell an ad from
// a story.
export function AdBanner({ slot }: AdBannerProps) {
  const creative = getAdCreative(slot);
  if (!creative) return slot === "rail" ? <AvailableRailSlot /> : null;

  return (
    <div className={`an-ad an-ad--${slot}`}>
      <p className="an-ad-label">Advertisement</p>
      <a href={creative.href} target="_blank" rel="sponsored noopener noreferrer" className="an-ad-frame">
        <picture>
          {creative.mobileImage && <source media="(max-width: 640px)" srcSet={creative.mobileImage} />}
          <img src={creative.image} alt={creative.alt} loading="lazy" />
        </picture>
      </a>
    </div>
  );
}
