interface AdBannerProps {
  slot: "leaderboard" | "rectangle" | "inline";
  className?: string;
}

const AD_DIMENSIONS = {
  leaderboard: { w: "100%", h: "90px", label: "728×90" },
  rectangle:   { w: "100%", h: "250px", label: "300×250" },
  inline:      { w: "100%", h: "100px", label: "Sponsored" },
};

const MOBILE_BANNER = { h: "50px", label: "320×50" };

function AdPlaceholder({
  h,
  label,
  className = "",
  adSlot,
}: {
  h: string;
  label: string;
  className?: string;
  adSlot?: string;
}) {
  return (
    <div
      className={`an-ad-container relative overflow-hidden rounded-lg border border-dashed border-border bg-secondary/40 flex flex-col items-center justify-center text-center ${className}`}
      style={{ minHeight: h }}
      data-ad-slot={adSlot}
    >
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium mb-1">
        Advertisement
      </p>
      <p className="text-xs text-muted-foreground/40">{label}</p>
      <a
        href="/advertise"
        className="mt-2 text-[11px] text-accent/70 hover:text-accent transition-colors underline"
      >
        Advertise here
      </a>
    </div>
  );
}

export function AdBanner({ slot, className = "" }: AdBannerProps) {
  const { h, label } = AD_DIMENSIONS[slot];

  if (slot === "leaderboard") {
    return (
      <>
        <AdPlaceholder
          h={h}
          label={label}
          adSlot={slot}
          className={`an-ad-leaderboard-desktop ${className}`}
        />
        <AdPlaceholder
          h={MOBILE_BANNER.h}
          label={MOBILE_BANNER.label}
          adSlot="mobile-banner"
          className={`an-ad-mobile-banner ${className}`}
        />
      </>
    );
  }

  return (
    <AdPlaceholder
      h={h}
      label={label}
      adSlot={slot}
      className={className}
    />
  );
}
