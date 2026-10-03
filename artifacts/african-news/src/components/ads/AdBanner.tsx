import { getAdCreative, type AdSlotId } from "@/lib/ads";

interface AdBannerProps {
  slot: AdSlotId;
}

// Renders nothing until a creative is configured in src/lib/ads.ts. When one
// is, the box has a fixed aspect ratio from the first paint (see .an-ad in
// index.css), so a slow image cannot move the content around it. The label
// is visible text, not just a screen-reader name, so readers can tell an ad
// from a story.
export function AdBanner({ slot }: AdBannerProps) {
  const creative = getAdCreative(slot);
  if (!creative) return null;

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
