import { Code2, Zap, Shield, Globe, Mail, Terminal, BookOpen } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/api/articles",
    description: "List all articles with pagination, country, and category filtering",
    params: "?page=1&limit=20&country=Nigeria&category=Politics",
  },
  {
    method: "GET",
    path: "/api/search",
    description: "Full-text search across titles, summaries, countries, and categories",
    params: "?q=election&page=1&limit=20",
  },
  {
    method: "GET",
    path: "/api/countries",
    description: "List all countries with article counts",
    params: "",
  },
  {
    method: "GET",
    path: "/api/categories",
    description: "List all categories with article counts",
    params: "",
  },
  {
    method: "GET",
    path: "/api/sources",
    description: "List all news sources with metadata and fetch status",
    params: "",
  },
];

const TIERS = [
  {
    name: "Developer",
    price: "Free",
    period: "",
    requests: "100 req / day",
    features: ["All read endpoints", "JSON responses", "Community support"],
    cta: "Get Free Key",
    accent: false,
  },
  {
    name: "Startup",
    price: "$49",
    period: "/ month",
    requests: "10,000 req / day",
    features: ["All read endpoints", "Higher rate limits", "Email support", "Historical data"],
    cta: "Start Free Trial",
    accent: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    requests: "Unlimited",
    features: ["Dedicated endpoint", "Webhooks", "SLA guarantee", "Custom ingestion"],
    cta: "Contact Sales",
    accent: false,
  },
];

const SAMPLE_RESPONSE = `{
  "articles": [
    {
      "id": 1024,
      "title": "Nigeria's Central Bank Raises Interest Rate",
      "summary": "The CBN raised its benchmark rate by 50 basis points...",
      "category": "Economy",
      "country": "Nigeria",
      "sourceName": "BusinessDay Nigeria",
      "publishedDate": "2026-03-23T09:00:00Z",
      "url": "https://businessday.ng/..."
    }
  ],
  "total": 342,
  "page": 1,
  "limit": 20,
  "hasMore": true
}`;

export default function ApiAccess() {
  return (
    <AppLayout>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Developer API</span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">
            African News Data, Delivered
          </h1>
          <p className="text-primary-foreground/70 text-xl leading-relaxed max-w-2xl mx-auto">
            Access 1,300+ articles from 54 African news sources via a clean REST API.
            Build research tools, dashboards, newsletters, and more.
          </p>
          <a
            href="mailto:api@africanews.com"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-accent text-white font-bold rounded-full shadow-lg hover:bg-accent/90 transition-all hover:-translate-y-1 duration-200"
          >
            <Mail className="w-5 h-5" /> Request API Access
          </a>
        </div>
      </div>

      {/* Features */}
      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: Globe, title: "Pan-African Coverage", desc: "14+ countries, 5 regions, updated hourly" },
              { icon: Zap, title: "Real-time Updates", desc: "New articles ingested every 60 minutes automatically" },
              { icon: Shield, title: "Reliable & Clean", desc: "Boilerplate stripped, categorized, and deduplicated" },
              { icon: Code2, title: "Developer-First", desc: "JSON API with consistent response schemas" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Endpoints */}
      <section className="py-16 bg-secondary/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-2 flex items-center gap-2">
                <BookOpen className="w-7 h-7 text-accent" /> Endpoints
              </h2>
              <p className="text-muted-foreground mb-8">All endpoints return JSON. No authentication required for the free tier.</p>
              <div className="space-y-4">
                {ENDPOINTS.map(({ method, path, description, params }) => (
                  <div key={path} className="bg-background rounded-xl border border-border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-white bg-emerald-600 px-2 py-0.5 rounded font-mono">{method}</span>
                      <code className="text-sm font-mono text-primary">{path}</code>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">{description}</p>
                    {params && <code className="text-xs text-muted-foreground/70 font-mono">{params}</code>}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-3xl font-bold mb-2 flex items-center gap-2">
                <Terminal className="w-7 h-7 text-accent" /> Sample Response
              </h2>
              <p className="text-muted-foreground mb-8">Clean, consistent JSON — ready for your application.</p>
              <pre className="bg-primary text-primary-foreground rounded-xl p-5 text-xs leading-relaxed overflow-x-auto">
                <code>{SAMPLE_RESPONSE}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Tiers */}
      <section className="py-16 border-b border-border">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-4">Pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Start free. Scale as you grow.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TIERS.map(({ name, price, period, requests, features, cta, accent }) => (
              <div
                key={name}
                className={`rounded-2xl border p-8 flex flex-col ${
                  accent ? "bg-primary text-primary-foreground border-primary shadow-xl scale-105" : "bg-background border-border"
                }`}
              >
                <h3 className="font-serif text-xl font-bold mb-2">{name}</h3>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-black">{price}</span>
                  {period && <span className={`text-sm ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{period}</span>}
                </div>
                <p className={`text-sm mb-6 ${accent ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{requests}</p>
                <ul className="space-y-2 mb-8 flex-1">
                  {features.map(f => (
                    <li key={f} className={`text-sm flex items-center gap-2 ${accent ? "text-primary-foreground/80" : "text-foreground/80"}`}>
                      <span className="text-accent">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="mailto:api@africanews.com"
                  className={`block text-center py-3 rounded-full font-bold text-sm transition-all ${
                    accent
                      ? "bg-accent text-white hover:bg-accent/90"
                      : "border border-border hover:bg-secondary"
                  }`}
                >
                  {cta}
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center">
        <div className="max-w-xl mx-auto px-4">
          <h2 className="font-serif text-3xl font-bold mb-4">Ready to Build?</h2>
          <p className="text-muted-foreground mb-8">Email us to get your API key and documentation.</p>
          <a
            href="mailto:api@africanews.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-bold rounded-full hover:bg-accent transition-colors"
          >
            <Mail className="w-5 h-5" /> api@africanews.com
          </a>
        </div>
      </section>
    </AppLayout>
  );
}
