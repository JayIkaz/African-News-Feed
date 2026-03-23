import { Mail, BarChart2, Globe, Users, Rss, TrendingUp } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

const STATS = [
  { label: "Countries covered", value: "14+", icon: Globe },
  { label: "News sources", value: "54", icon: Rss },
  { label: "Articles indexed", value: "1,300+", icon: BarChart2 },
  { label: "Updates per hour", value: "Hourly", icon: TrendingUp },
];

const AD_PLACEMENTS = [
  {
    name: "Leaderboard Banner",
    dimensions: "728 × 90 px",
    placement: "Top of homepage and category pages — maximum visibility",
    color: "border-blue-200 bg-blue-50",
    badge: "Most Popular",
    badgeColor: "bg-blue-600",
  },
  {
    name: "Rectangle",
    dimensions: "300 × 250 px",
    placement: "Sidebar on articles and category pages — high dwell-time position",
    color: "border-emerald-200 bg-emerald-50",
    badge: "Best ROI",
    badgeColor: "bg-emerald-600",
  },
  {
    name: "Inline Content",
    dimensions: "Full-width",
    placement: "Native-style placement between article cards — unobtrusive, high engagement",
    color: "border-amber-200 bg-amber-50",
    badge: "Native",
    badgeColor: "bg-amber-600",
  },
  {
    name: "Sponsored Section",
    dimensions: "Custom",
    placement: "Branded country or category section — premium exclusive placement",
    color: "border-violet-200 bg-violet-50",
    badge: "Premium",
    badgeColor: "bg-violet-600",
  },
];

const AUDIENCES = [
  { label: "Business professionals", pct: "38%" },
  { label: "Government & policy readers", pct: "22%" },
  { label: "Investors & entrepreneurs", pct: "19%" },
  { label: "Students & academics", pct: "21%" },
];

export default function Advertise() {
  return (
    <AppLayout>
      {/* Hero */}
      <div className="bg-primary text-primary-foreground py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <span className="text-accent font-bold tracking-widest uppercase text-sm mb-4 block">Advertising</span>
          <h1 className="font-serif text-4xl md:text-6xl font-bold text-white mb-6">
            Reach Africa's Most Engaged News Readers
          </h1>
          <p className="text-primary-foreground/70 text-xl leading-relaxed max-w-2xl mx-auto">
            AfricaNews aggregates breaking news from 54 trusted sources across 14+ countries.
            Put your brand in front of a highly engaged, pan-continental audience.
          </p>
          <a
            href="mailto:advertise@africanews.com"
            className="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-accent text-white font-bold rounded-full shadow-lg hover:bg-accent/90 transition-all hover:-translate-y-1 duration-200"
          >
            <Mail className="w-5 h-5" /> Get a Media Kit
          </a>
        </div>
      </div>

      {/* Platform Stats */}
      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-12">Platform at a Glance</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-accent" />
                </div>
                <p className="font-serif text-4xl font-black text-primary mb-1">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Audience */}
      <section className="py-16 bg-secondary/30 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-3xl font-bold mb-4">Who Reads AfricaNews?</h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                Our readers are decision-makers across business, government, and civil society — actively tracking African markets, politics, and policy.
              </p>
              <div className="space-y-4">
                {AUDIENCES.map(({ label, pct }) => (
                  <div key={label}>
                    <div className="flex justify-between text-sm font-medium mb-1">
                      <span>{label}</span><span className="text-accent">{pct}</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: pct }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Countries reached", value: "54" },
                { label: "Languages", value: "3+" },
                { label: "Articles/month", value: "5,000+" },
                { label: "Avg read time", value: "4 min" },
              ].map(({ label, value }) => (
                <div key={label} className="bg-background rounded-xl p-6 border border-border text-center">
                  <p className="font-serif text-3xl font-black text-primary mb-1">{value}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Ad Placements */}
      <section className="py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-center mb-4">Ad Placements</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Choose from standard IAB ad units or discuss a custom branded integration with our team.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {AD_PLACEMENTS.map(({ name, dimensions, placement, color, badge, badgeColor }) => (
              <div key={name} className={`relative rounded-xl border p-6 ${color}`}>
                <span className={`absolute top-4 right-4 text-white text-xs font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
                  {badge}
                </span>
                <h3 className="font-serif text-xl font-bold mb-1">{name}</h3>
                <p className="text-sm text-muted-foreground font-mono mb-3">{dimensions}</p>
                <p className="text-sm text-foreground/80">{placement}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-primary text-primary-foreground text-center">
        <div className="max-w-2xl mx-auto px-4">
          <Users className="w-12 h-12 text-accent mx-auto mb-6" />
          <h2 className="font-serif text-4xl font-bold text-white mb-4">Ready to Advertise?</h2>
          <p className="text-primary-foreground/70 mb-8 text-lg">
            Contact us for a media kit, rate card, and custom campaign planning.
          </p>
          <a
            href="mailto:advertise@africanews.com"
            className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-white font-bold rounded-full shadow-lg hover:bg-accent/90 transition-all"
          >
            <Mail className="w-5 h-5" /> advertise@africanews.com
          </a>
        </div>
      </section>
    </AppLayout>
  );
}
