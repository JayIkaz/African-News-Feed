import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useListCountries } from "@workspace/api-client-react";
import { COUNTRY_REGIONS } from "@/lib/countries";
import { CountryFlag } from "@/components/common/CountryFlag";
import { BreakingTicker } from "./BreakingTicker";

const CATEGORIES = [
  "Politics", "Business", "Technology", "Economy", "Society", "Environment", "International",
];

const REGIONS = ["North Africa", "West Africa", "East Africa", "Central Africa", "Southern Africa"] as const;
const REGION_CLASS = ["north", "west", "east", "central", "south"] as const;
const REGION_COLORS: Record<string, string> = {
  "North Africa": "var(--region-north)",
  "West Africa": "var(--region-west)",
  "East Africa": "var(--region-east)",
  "Central Africa": "var(--region-central)",
  "Southern Africa": "var(--region-south)",
};

export function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [countriesOpen, setCountriesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: countries } = useListCountries();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCountriesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileOpen(false);
    }
  };

  const grouped = REGIONS.reduce<Record<string, typeof countries>>((acc, region) => {
    acc[region] = (countries ?? []).filter(c => COUNTRY_REGIONS[c.country] === region);
    return acc;
  }, {} as any);

  const isHome = location === "/";
  const activeCategory = CATEGORIES.find(c => location === `/category/${c}`);
  const isCountries = location.startsWith("/countr");

  return (
    <>
      <BreakingTicker />

      <header
        style={{
          background: "var(--anchor)",
          position: "sticky",
          top: 0,
          zIndex: 90,
        }}
      >
        {/* ── Main header row ── */}
        <div
          style={{
            maxWidth: 1320,
            margin: "0 auto",
            padding: "0 24px",
            height: 70,
            display: "flex",
            alignItems: "center",
            gap: 24,
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0, textDecoration: "none" }}
          >
            <svg width="40" height="40" viewBox="0 0 240 240" style={{ flexShrink: 0, borderRadius: 8 }}>
              <rect width="240" height="240" rx="48" fill="rgba(255,255,255,0.12)"/>
              <path d="M120,26 C144,24 162,34 174,47 C184,58 190,64 186,76 C182,86 172,84 176,97 C181,108 193,110 189,123 C185,135 172,128 168,141 C164,154 173,161 164,172 C158,181 151,177 147,190 C143,203 135,212 126,218 C122,221 118,223 115,218 C109,206 105,195 99,187 C92,177 79,173 75,162 C71,151 80,145 74,134 C67,122 54,120 51,107 C48,94 58,88 53,77 C48,66 39,60 46,49 C53,38 70,34 83,31 C96,28 108,29 120,26 Z" fill="#FFFFFF"/>
              <polyline points="30,132 78,132 91,109 106,155 121,132 152,132 165,104 178,160 210,132" fill="none" stroke="var(--mint)" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="91" cy="109" r="6.5" fill="var(--live)"/>
              <circle cx="165" cy="104" r="6.5" fill="var(--live)"/>
            </svg>
            <div style={{ lineHeight: 1.1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "var(--font-headline)", fontSize: 19, fontWeight: 600, color: "#FFFFFF", letterSpacing: "-0.01em" }}>
                  AfricaNews
                </span>
                <span style={{ background: "var(--live)", color: "#FFFFFF", fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 4, letterSpacing: "0.02em" }}>
                  Live
                </span>
              </div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 9.5, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "rgba(255,255,255,0.65)" }}>
                The Continent's Pulse
              </div>
            </div>
          </Link>

          {/* Search — desktop */}
          <form
            onSubmit={handleSearch}
            style={{ flex: 1, maxWidth: 400, marginLeft: "auto", position: "relative" }}
            className="hidden md:block"
          >
            <input
              type="text"
              placeholder="Search news, topics, countries…"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="an-nav-search"
              style={{
                width: "100%",
                height: 40,
                background: "rgba(255,255,255,0.14)",
                border: "1.5px solid transparent",
                borderRadius: 6,
                padding: "0 40px 0 14px",
                fontFamily: "var(--font-ui)",
                fontSize: 13.5,
                color: "#FFFFFF",
                outline: "none",
                transition: "border-color 0.2s, background 0.2s",
              }}
              onFocus={e => { e.target.style.borderColor = "var(--mint)"; e.target.style.background = "rgba(255,255,255,0.22)"; }}
              onBlur={e => { e.target.style.borderColor = "transparent"; e.target.style.background = "rgba(255,255,255,0.14)"; }}
            />
            <button
              type="submit"
              style={{
                position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)",
                background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.7)",
                display: "flex", padding: 4,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
            </button>
          </form>

          {/* Newsletter CTA */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: 16, flexShrink: 0 }}>
            <Link
              href="#newsletter"
              style={{
                background: "var(--yellow)",
                color: "var(--yellow-text)",
                border: "none",
                borderRadius: 5,
                padding: "0 16px",
                height: 36,
                fontFamily: "var(--font-ui)",
                fontSize: 12.5,
                fontWeight: 500,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                whiteSpace: "nowrap",
                textDecoration: "none",
              }}
              onClick={() => document.getElementById("footer-newsletter")?.scrollIntoView({ behavior: "smooth" })}
            >
              Newsletter
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", padding: 4, color: "#FFFFFF" }}
          >
            {mobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 6-12 12M6 6l12 12"/></svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
            )}
          </button>
        </div>

        {/* ── Navigation bar ── */}
        <nav
          style={{ borderTop: "1px solid rgba(255,255,255,0.15)", background: "var(--anchor)" }}
          className="hidden md:block"
        >
          {/* Outer wrapper: NO overflow here — dropdown must escape this container */}
          <div
            style={{
              maxWidth: 1320,
              margin: "0 auto",
              padding: "0 24px",
              display: "flex",
              alignItems: "center",
              height: 56,
              gap: 0,
            }}
          >
            {/* Inner scroll area: only the category links scroll on narrow viewports */}
            <div style={{ display: "flex", alignItems: "center", flex: 1, overflowX: "auto", minWidth: 0 }}>
              <NavLink href="/" active={isHome}>Home</NavLink>
              {CATEGORIES.map(cat => (
                <NavLink key={cat} href={`/category/${cat}`} active={activeCategory === cat}>
                  {cat}
                </NavLink>
              ))}
            </div>

            {/* Divider — outside scroll area */}
            <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.25)", flexShrink: 0, margin: "0 8px" }} />

            {/* Countries dropdown — outside scroll area so position:absolute is never clipped */}
            <div style={{ position: "relative", flexShrink: 0 }} ref={dropdownRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCountriesOpen(!countriesOpen);
                }}
                style={{
                  fontFamily: "var(--font-ui)",
                  fontSize: 13,
                  fontWeight: 500,
                  color: isCountries ? "var(--mint)" : "rgba(255,255,255,0.8)",
                  padding: "0 14px",
                  height: 56,
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  whiteSpace: "nowrap",
                  background: "none",
                  border: "none",
                  borderBottom: isCountries ? "2px solid var(--mint)" : "2px solid transparent",
                  cursor: "pointer",
                  transition: "color 0.2s",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                Countries
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ transform: countriesOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
                >
                  <path d="m6 9 6 6 6-6"/>
                </svg>
              </button>

              {countriesOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "calc(100% + 4px)",
                    right: 0,
                    background: "var(--surface-1)",
                    border: "1px solid var(--border)",
                    borderRadius: 10,
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    maxWidth: "min(600px, 95vw)",
                    padding: 20,
                    zIndex: 999,
                    overflowX: "hidden",
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 12, marginBottom: 12 }}>
                    {REGIONS.map((region, idx) => (
                      <div key={region}>
                        <h4
                          style={{
                            fontFamily: "var(--font-ui)",
                            fontSize: 10,
                            fontWeight: 600,
                            letterSpacing: "0.1em",
                            textTransform: "uppercase",
                            color: REGION_COLORS[region],
                            marginBottom: 8,
                            paddingBottom: 6,
                            borderBottom: `2px solid ${REGION_COLORS[region]}`,
                          }}
                        >
                          {region.replace(" Africa", "")}
                        </h4>
                        {(grouped[region] ?? []).slice(0, 8).map(c => (
                          <Link
                            key={c.country}
                            href={`/country/${encodeURIComponent(c.country)}`}
                            onClick={() => setCountriesOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 6,
                              padding: "4px 0",
                              fontFamily: "var(--font-ui)",
                              fontSize: 12.5,
                              color: "var(--ink-2)",
                              cursor: "pointer",
                              transition: "color 0.2s",
                              border: "none",
                              background: "none",
                              width: "100%",
                            }}
                            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent)")}
                            onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-2)")}
                          >
                            <CountryFlag country={c.country} size={14} />
                            {c.country}
                          </Link>
                        ))}
                      </div>
                    ))}
                  </div>
                  <div style={{ borderTop: "1px solid var(--paper-3)", paddingTop: 10, textAlign: "center" }}>
                    <Link
                      href="/countries"
                      onClick={() => setCountriesOpen(false)}
                      style={{ fontFamily: "var(--font-ui)", fontSize: 12.5, color: "var(--accent)", fontWeight: 500 }}
                    >
                      View all countries →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        {/* ── Mobile menu ── */}
        {mobileOpen && (
          <div
            style={{
              background: "var(--anchor)",
              borderTop: "1px solid rgba(255,255,255,0.15)",
              padding: "16px 24px 24px",
            }}
            className="md:hidden"
          >
            <form onSubmit={handleSearch} style={{ position: "relative", marginBottom: 16 }}>
              <input
                type="text"
                placeholder="Search…"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="an-nav-search"
                style={{
                  width: "100%",
                  height: 40,
                  background: "rgba(255,255,255,0.14)",
                  border: "1.5px solid transparent",
                  borderRadius: 6,
                  padding: "0 14px",
                  fontFamily: "var(--font-ui)",
                  fontSize: 13.5,
                  color: "#FFFFFF",
                  outline: "none",
                }}
              />
            </form>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {["Home", ...CATEGORIES, "Countries"].map(item => {
                const href = item === "Home" ? "/" : item === "Countries" ? "/countries" : `/category/${item}`;
                return (
                  <Link
                    key={item}
                    href={href}
                    onClick={() => setMobileOpen(false)}
                    className="an-mobile-link"
                    style={{
                      fontFamily: "var(--font-ui)",
                      fontSize: 14,
                      fontWeight: 500,
                      color: "rgba(255,255,255,0.85)",
                      padding: "10px 0",
                      borderBottom: "1px solid rgba(255,255,255,0.12)",
                    }}
                  >
                    {item}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </header>
    </>
  );
}

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{
        fontFamily: "var(--font-ui)",
        fontSize: 13,
        fontWeight: active ? 600 : 500,
        color: active ? "var(--mint)" : "rgba(255,255,255,0.8)",
        padding: "0 14px",
        height: 56,
        display: "flex",
        alignItems: "center",
        whiteSpace: "nowrap",
        borderBottom: active ? "2px solid var(--mint)" : "2px solid transparent",
        transition: "color 0.2s, border-color 0.2s",
        textDecoration: "none",
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "#FFFFFF"; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.8)"; }}
    >
      {children}
    </Link>
  );
}
