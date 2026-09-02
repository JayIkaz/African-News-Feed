import { useState } from "react";
import { Link } from "wouter";
import { useTriggerIngestion } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

const FOOT_LINK = "rgba(255,255,255,0.72)";
const FOOT_DIM = "rgba(255,255,255,0.45)";
const FOOT_RULE = "rgba(255,255,255,0.15)";

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const triggerIngestion = useTriggerIngestion({
    mutation: {
      onSuccess: () => toast({ title: "Update triggered", description: "Fetching latest articles from sources." }),
      onError: () => toast({ title: "Update failed", description: "Could not reach the ingestion service.", variant: "destructive" }),
    }
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const res = await fetch(`${base}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) { setSubscribed(true); setEmail(""); }
    } catch {}
    setSubmitting(false);
  };

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
                <path d="M120,26 C144,24 162,34 174,47 C184,58 190,64 186,76 C182,86 172,84 176,97 C181,108 193,110 189,123 C185,135 172,128 168,141 C164,154 173,161 164,172 C158,181 151,177 147,190 C143,203 135,212 126,218 C122,221 118,223 115,218 C109,206 105,195 99,187 C92,177 79,173 75,162 C71,151 80,145 74,134 C67,122 54,120 51,107 C48,94 58,88 53,77 C48,66 39,60 46,49 C53,38 70,34 83,31 C96,28 108,29 120,26 Z" fill="#FFFFFF"/>
                <polyline points="30,132 78,132 91,109 106,155 121,132 152,132 165,104 178,160 210,132" fill="none" stroke="var(--mint)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="91" cy="109" r="7.5" fill="var(--live)"/>
                <circle cx="165" cy="104" r="7.5" fill="var(--live)"/>
              </svg>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: 24, fontWeight: 700, color: "#FFFFFF", letterSpacing: "-0.02em" }}>AfricaNews</div>
            </Link>
            <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: FOOT_DIM, marginBottom: 14 }}>The Continent's Pulse</div>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.6, color: FOOT_LINK, marginBottom: 16 }}>
              Aggregating the continent's most important stories from 65+ trusted local and international sources.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {["𝕏", "f", "in"].map((s, i) => (
                <a key={i} href="#" style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: "#FFFFFF", fontFamily: "var(--font-ui)", fontSize: 12, textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(255,255,255,0.25)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(255,255,255,0.12)")}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <h4 style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: FOOT_DIM, marginBottom: 14 }}>
              Sections
            </h4>
            {["Politics", "Business", "Technology", "Economy", "Society", "Environment", "International"].map(cat => (
              <Link key={cat} href={`/category/${cat}`} style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, color: FOOT_LINK, padding: "4px 0", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--mint)")}
                onMouseLeave={e => (e.currentTarget.style.color = FOOT_LINK)}
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Regions & Platform */}
          <div>
            <h4 style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: FOOT_DIM, marginBottom: 14 }}>
              Regions
            </h4>
            {["West Africa", "East Africa", "North Africa", "Southern Africa", "Central Africa"].map(r => (
              <Link key={r} href={`/countries?region=${encodeURIComponent(r)}`} style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, color: FOOT_LINK, padding: "4px 0", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--mint)")}
                onMouseLeave={e => (e.currentTarget.style.color = FOOT_LINK)}
              >
                {r}
              </Link>
            ))}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: `1px solid ${FOOT_RULE}` }}>
              <h4 style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: FOOT_DIM, marginBottom: 10 }}>Platform</h4>
              <Link href="/advertise" style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, color: FOOT_LINK, padding: "4px 0", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--mint)")}
                onMouseLeave={e => (e.currentTarget.style.color = FOOT_LINK)}
              >Advertise With Us</Link>
              <Link href="/api-access" style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, color: FOOT_LINK, padding: "4px 0", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--mint)")}
                onMouseLeave={e => (e.currentTarget.style.color = FOOT_LINK)}
              >API Access</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div id="footer-newsletter">
            <h4 style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: FOOT_DIM, marginBottom: 14 }}>
              Daily Digest
            </h4>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: FOOT_LINK, marginBottom: 14, lineHeight: 1.6 }}>
              Top stories from across Africa delivered every morning.
            </p>
            {subscribed ? (
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--mint)", fontWeight: 500 }}>
                ✓ You're subscribed! Welcome aboard.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    background: "var(--paper-raised)",
                    border: "1px solid var(--line)",
                    borderRadius: 5,
                    fontFamily: "var(--font-ui)",
                    fontSize: 13,
                    color: "var(--ink)",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    padding: "10px",
                    background: "var(--yellow)",
                    color: "var(--yellow-text)",
                    border: "none",
                    borderRadius: 5,
                    fontFamily: "var(--font-ui)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {submitting ? "Subscribing…" : "Subscribe — it's free"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: `1px solid ${FOOT_RULE}`, paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: FOOT_DIM }}>
            © {new Date().getFullYear()} AfricaNews Aggregator. All rights reserved.
            {" · "}
            <a
              href="https://aukizan.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: FOOT_DIM, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
              onMouseLeave={e => (e.currentTarget.style.color = FOOT_DIM)}
            >
              Powered by Aukizan
            </a>
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {["About", "Sources", "Privacy", "Terms"].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`} style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: FOOT_DIM, textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#FFFFFF")}
                onMouseLeave={e => (e.currentTarget.style.color = FOOT_DIM)}
              >
                {item}
              </Link>
            ))}
            <button
              onClick={() => triggerIngestion.mutate()}
              disabled={triggerIngestion.isPending}
              style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: FOOT_DIM, background: "none", border: "none", cursor: "pointer", opacity: 0.5, transition: "opacity 0.2s" }}
              title="Admin: Force Update"
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.5")}
            >
              {triggerIngestion.isPending ? "Updating…" : "Force Update"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
