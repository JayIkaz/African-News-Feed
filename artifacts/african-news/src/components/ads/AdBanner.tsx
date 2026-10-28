import { useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowRight } from "lucide-react";
import { getAdCreatives, type AdCreative, type AdSlotId } from "@/lib/ads";

interface AdBannerProps {
  slot: AdSlotId;
}

// How long each creative stays up before the next one wipes in.
const ROTATE_MS = 7000;

// The right-hand column slot is held open before an advert is sold: a panel of
// the same 300 x 250 size says the space is available and links to the
// Advertise page. When creatives are configured in src/lib/ads.ts they take the
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

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(query.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

// "entering" is false for the creative shown on first load, so it appears
// plainly while its image loads. Every later change of creative wipes in.
function Slide({ creative, active, entering }: { creative: AdCreative; active: boolean; entering: boolean }) {
  const classes = ["an-ad-slide", active ? "is-active" : "", active && entering ? "is-entering" : ""]
    .filter(Boolean)
    .join(" ");
  return (
    <a href={creative.href} target="_blank" rel="sponsored noopener noreferrer" className={classes}>
      <picture>
        {creative.mobileImage && <source media="(max-width: 640px)" srcSet={creative.mobileImage} />}
        <img src={creative.image} alt={creative.alt} loading="lazy" />
      </picture>
    </a>
  );
}

// The inline slot renders nothing until a creative is configured. When one is,
// the frame has a fixed aspect ratio from the first paint (see .an-ad in
// index.css), and every creative is stacked inside it, so neither a slow image
// nor a change of creative can move the content around it. With more than one
// creative the slot wipes between them. The rotation pauses while the pointer
// or keyboard focus is on the advert, and it does not run at all for visitors
// who have asked for reduced motion: they see the first creative only. The
// label is visible text, not just a screen-reader name, so readers can tell an
// ad from a story.
export function AdBanner({ slot }: AdBannerProps) {
  const creatives = getAdCreatives(slot);
  const [index, setIndex] = useState(0);
  const [hasRotated, setHasRotated] = useState(false);
  const [paused, setPaused] = useState(false);
  const reducedMotion = usePrefersReducedMotion();
  const rotating = creatives.length > 1 && !reducedMotion && !paused;

  useEffect(() => {
    if (!rotating) return;
    const timer = window.setInterval(() => {
      setHasRotated(true);
      setIndex((current) => (current + 1) % creatives.length);
    }, ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [rotating, creatives.length]);

  if (creatives.length === 0) return slot === "rail" ? <AvailableRailSlot /> : null;

  return (
    <div
      className={`an-ad an-ad--${slot}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <p className="an-ad-label">Advertisement</p>
      <div className="an-ad-frame an-ad-stack">
        {creatives.map((creative, i) => (
          <Slide key={creative.image} creative={creative} active={i === index} entering={hasRotated} />
        ))}
      </div>
    </div>
  );
}
