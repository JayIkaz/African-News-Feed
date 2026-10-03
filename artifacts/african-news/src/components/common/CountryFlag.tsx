import { Globe } from "lucide-react";
import { COUNTRY_CODES } from "@/lib/countries";

interface CountryFlagProps {
  country: string;
  size?: number;
  style?: React.CSSProperties;
  className?: string;
}

// Renders a real flag image instead of an emoji glyph. Emoji flags rely on
// the OS having a font that pairs two "regional indicator" characters into
// a flag glyph — Windows (and some Linux distros) don't, and show the raw
// two-letter code as plain text instead (e.g. "ZA"). Images render
// identically everywhere. They are SVGs served from this site (public/flags),
// so a reader's browser makes no request to a third party for them.
export function CountryFlag({ country, size = 20, style, className }: CountryFlagProps) {
  const code = COUNTRY_CODES[country];
  const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
  const width = size;
  const height = Math.round(size * 0.75);

  if (!code) {
    return (
      <span
        role="img"
        aria-label={country}
        style={{ lineHeight: 1, display: "inline-flex", color: "var(--ink-faint)", ...style }}
        className={className}
      >
        <Globe size={Math.round(size * 0.8)} strokeWidth={1.5} aria-hidden="true" />
      </span>
    );
  }

  return (
    <img
      src={`${base}/flags/${code}.svg`}
      alt={country}
      width={width}
      height={height}
      loading="lazy"
      style={{
        width,
        height,
        objectFit: "cover",
        borderRadius: 2,
        display: "inline-block",
        verticalAlign: "middle",
        flexShrink: 0,
        ...style,
      }}
      className={className}
    />
  );
}
