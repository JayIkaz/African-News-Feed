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
// identically everywhere.
export function CountryFlag({ country, size = 20, style, className }: CountryFlagProps) {
  const code = COUNTRY_CODES[country];
  const width = size;
  const height = Math.round(size * 0.75);

  if (!code) {
    return (
      <span
        role="img"
        aria-label={country}
        style={{ fontSize: size * 0.8, lineHeight: 1, display: "inline-block", ...style }}
        className={className}
      >
        🌍
      </span>
    );
  }

  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      srcSet={`https://flagcdn.com/w80/${code}.png 1x, https://flagcdn.com/w160/${code}.png 2x`}
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
