import { useState } from "react";
import { Link } from "wouter";
import { useTriggerIngestion } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";

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

  return (
    <footer style={{ background: "var(--paper-2)", color: "var(--ink-3)", padding: "48px 0 32px", marginTop: 48 }}>
      <div style={{ maxWidth: 1320, margin: "0 auto", padding: "0 24px" }}>
        <div className="an-footer-grid" style={{ marginBottom: 40 }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ textDecoration: "none" }}>
              <div style={{ fontFamily: "var(--font-headline)", fontSize: 24, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.02em", marginBottom: 2 }}>AfricaNews</div>
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 9, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 14 }}>The Continent's Pulse</div>
            </Link>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, lineHeight: 1.6, color: "var(--ink-3)", marginBottom: 16 }}>
              Aggregating the continent's most important stories from 65+ trusted local and international sources.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {["𝕏", "f", "in"].map((s, i) => (
                <a key={i} href="#" style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--paper-3)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-3)", fontFamily: "var(--font-ui)", fontSize: 12, textDecoration: "none", transition: "background 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--paper-3)")}
                >
                  {s}
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div>
            <h4 style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 14 }}>
              Sections
            </h4>
            {["Politics", "Business", "Technology", "Economy", "Society", "Environment", "International"].map(cat => (
              <Link key={cat} href={`/category/${cat}`} style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-3)", padding: "4px 0", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-3)")}
              >
                {cat}
              </Link>
            ))}
          </div>

          {/* Regions & Platform */}
          <div>
            <h4 style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 14 }}>
              Regions
            </h4>
            {["West Africa", "East Africa", "North Africa", "Southern Africa", "Central Africa"].map(r => (
              <Link key={r} href={`/countries?region=${encodeURIComponent(r)}`} style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-3)", padding: "4px 0", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-3)")}
              >
                {r}
              </Link>
            ))}
            <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--paper-3)" }}>
              <h4 style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 10 }}>Platform</h4>
              <Link href="/advertise" style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-3)", padding: "4px 0", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-3)")}
              >Advertise With Us</Link>
              <Link href="/api-access" style={{ display: "block", fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-3)", padding: "4px 0", textDecoration: "none" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-3)")}
              >API Access</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div id="footer-newsletter">
            <h4 style={{ fontFamily: "var(--font-ui)", fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ink-4)", marginBottom: 14 }}>
              Daily Digest
            </h4>
            <p style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "var(--ink-3)", marginBottom: 14, lineHeight: 1.6 }}>
              Top stories from across Africa delivered every morning.
            </p>
            {subscribed ? (
              <div style={{ fontFamily: "var(--font-ui)", fontSize: 13, color: "#4ade80", fontWeight: 500 }}>
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
                    background: "var(--surface-1)",
                    border: "1px solid var(--paper-3)",
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
                    background: "var(--accent)",
                    color: "#412402",
                    border: "none",
                    borderRadius: 5,
                    fontFamily: "var(--font-ui)",
                    fontSize: 13,
                    fontWeight: 500,
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
        <div style={{ borderTop: "1px solid var(--paper-3)", paddingTop: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-4)" }}>
            © {new Date().getFullYear()} AfricaNews Aggregator. All rights reserved.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" }}>
            {["About", "Sources", "Privacy", "Terms"].map(item => (
              <Link key={item} href={`/${item.toLowerCase()}`} style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-4)", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--ink)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--ink-4)")}
              >
                {item}
              </Link>
            ))}
            <button
              onClick={() => triggerIngestion.mutate()}
              disabled={triggerIngestion.isPending}
              style={{ fontFamily: "var(--font-ui)", fontSize: 12, color: "var(--ink-4)", background: "none", border: "none", cursor: "pointer", opacity: 0.3, transition: "opacity 0.2s" }}
              title="Admin: Force Update"
              onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "0.3")}
            >
              {triggerIngestion.isPending ? "Updating…" : "Force Update"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
