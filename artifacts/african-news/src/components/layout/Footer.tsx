import { Link } from "wouter";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { COMPANY_LINE, CONTACT_EMAIL } from "@/lib/site";
import { regionHref, type Region } from "@/lib/countries";

// These were hardcoded whites tuned for the old teal footer. On --paper they
// landed at 4.49:1 — just under AA — as a separate near-miss nobody would
// think to look for. Mapped onto the ink ramp instead, so footer text obeys
// the same rules as the rest of the site and the --ink-faint ruling covers
// it rather than leaving a second, undocumented contrast decision here.
const FOOT_LINK = "var(--ink-muted)";
const FOOT_DIM = "var(--ink-faint)";
const FOOT_RULE = "var(--line)";

const COLUMN_HEADING = { fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: FOOT_DIM, marginBottom: 14 } as const;
const COLUMN_LINK = { display: "block", fontFamily: "var(--font-ui)", fontSize: 13, color: FOOT_LINK, padding: "4px 0", textDecoration: "none", transition: "color 0.2s" } as const;

// General is the fourth-largest section and has no other way in.
const SECTIONS = ["Politics", "Business", "Technology", "Economy", "Society", "Environment", "International", "General"];
const REGION_LINKS: Region[] = ["West Africa", "East Africa", "North Africa", "Southern Africa", "Central Africa"];
const SITE_LINKS = [
  { label: "About", href: "/about" },
  { label: "Sources", href: "/sources" },
  { label: "Advertise", href: "/advertise" },
  { label: "Contact", href: `mailto:${CONTACT_EMAIL}` },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
];

function FootLink({ href, children }: { href: string; children: React.ReactNode }) {
  const hover = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = "var(--mint)"; },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.color = FOOT_LINK; },
  };
  // A mailto: link is not a page of this app, so it is a plain anchor.
  return href.startsWith("mailto:")
    ? <a href={href} style={COLUMN_LINK} {...hover}>{children}</a>
    : <Link href={href} style={COLUMN_LINK} {...hover}>{children}</Link>;
}

export function Footer() {
  // --anchor now resolves to --paper, so the footer no longer reads as a
  // distinct block. A hairline top border restores the boundary the old teal
  // fill used to provide, in keeping with the spec's structure-from-dividers
  // approach.
  return (
    <footer style={{ background: "var(--paper)", borderTop: "1px solid var(--line)", color: FOOT_LINK, padding: "48px 0 32px", marginTop: 48 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div className="an-footer-grid" style={{ marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, marginBottom: 2 }}>
              <svg width="30" height="30" viewBox="0 0 240 240" style={{ flexShrink: 0 }}>
                <path d="M120,26 C144,24 162,34 174,47 C184,58 190,64 186,76 C182,86 172,84 176,97 C181,108 193,110 189,123 C185,135 172,128 168,141 C164,154 173,161 164,172 C158,181 151,177 147,190 C143,203 135,212 126,218 C122,221 118,223 115,218 C109,206 105,195 99,187 C92,177 79,173 75,162 C71,151 80,145 74,134 C67,122 54,120 51,107 C48,94 58,88 53,77 C48,66 39,60 46,49 C53,38 70,34 83,31 C96,28 108,29 120,26 Z" fill="var(--ink)"/>
                <polyline points="30,132 78,132 91,109 106,155 121,132 152,132 165,104 178,160 210,132" fill="none" stroke="var(--brand-amber)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="91" cy="109" r="7.5" fill="var(--live)"/>
                <circle cx="165" cy="104" r="7.5" fill="var(--live)"/>
              </svg>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em" }}>AfricaNews</div>
            </Link>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: FOOT_DIM, marginBottom: 14 }}>The Continent's Pulse</div>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.6, color: FOOT_LINK, marginBottom: 16 }}>
              Headlines from African news publishers in one place, updated every hour.
            </p>
          </div>

          {/* Sections */}
          <nav aria-label="Sections">
            <h2 style={COLUMN_HEADING}>Sections</h2>
            {SECTIONS.map(cat => (
              <FootLink key={cat} href={`/category/${cat}`}>{cat}</FootLink>
            ))}
          </nav>

          {/* Regions */}
          <nav aria-label="Regions">
            <h2 style={COLUMN_HEADING}>Regions</h2>
            {REGION_LINKS.map(r => (
              <FootLink key={r} href={regionHref(r)}>{r}</FootLink>
            ))}
          </nav>

          {/* The site itself: what it is, who runs it, how to reach them */}
          <nav aria-label="About the site">
            <h2 style={COLUMN_HEADING}>AfricaNews</h2>
            {SITE_LINKS.map(({ label, href }) => (
              <FootLink key={label} href={href}>{label}</FootLink>
            ))}
          </nav>

          {/* Newsletter */}
          <div id="footer-newsletter" className="an-footer-newsletter">
            <NewsletterForm headingLevel="h2" />
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${FOOT_RULE}`, paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: FOOT_DIM }}>
            © {new Date().getFullYear()} AfricaNews. Stories belong to their publishers.
            {" · "}
            <a
              href="https://aukizan.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: FOOT_DIM, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
              onMouseLeave={e => (e.currentTarget.style.color = FOOT_DIM)}
            >
              Powered by Aukizan
            </a>
          </p>
        </div>
        <p className="an-footer-company">{COMPANY_LINE}</p>
      </div>
    </footer>
  );
}
