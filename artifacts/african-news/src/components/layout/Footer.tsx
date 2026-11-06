import { Link } from "wouter";
import { NewsletterForm } from "@/components/common/NewsletterForm";
import { COMPANY_LINE, CONTACT_EMAIL } from "@/lib/site";
import { regionHref, type Region } from "@/lib/countries";
import { SECTIONS, categoryHref } from "@/lib/slugs";

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
            <Link href="/" className="an-footer-logo">
              <img src="/images/logo-stacked.svg" width="168" height="98" alt="African News Feed" loading="lazy" />
            </Link>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 12, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: FOOT_DIM, marginBottom: 14 }}>The Continent's Pulse</div>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.6, color: FOOT_LINK, marginBottom: 16 }}>
              Headlines from African news publishers in one place, updated several times a day.
            </p>
          </div>

          {/* Sections */}
          <nav aria-label="Sections">
            <h2 style={COLUMN_HEADING}>Sections</h2>
            {SECTIONS.map(cat => (
              <FootLink key={cat} href={categoryHref(cat)}>{cat}</FootLink>
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
            <h2 style={COLUMN_HEADING}>African News Feed</h2>
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
            © {new Date().getFullYear()} African News Feed. Stories belong to their publishers.
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
