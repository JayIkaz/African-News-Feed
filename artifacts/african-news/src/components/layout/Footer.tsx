import { useState } from "react";
import { Link } from "wouter";
import { Globe, Mail, Twitter, Facebook, Instagram, CheckCircle2 } from "lucide-react";
import { useTriggerIngestion } from "@workspace/api-client-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export function Footer() {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);

  const triggerIngestion = useTriggerIngestion({
    mutation: {
      onSuccess: () => {
        toast({ title: "Update triggered", description: "Fetching latest articles from sources." });
      },
      onError: () => {
        toast({ title: "Update failed", description: "Could not reach the ingestion service.", variant: "destructive" });
      }
    }
  });

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribing(true);
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, "") || "";
      const res = await fetch(`${base}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSubscribed(true);
        setEmail("");
        toast({ title: "Subscribed!", description: "You'll receive our daily digest." });
      } else {
        const err = await res.json();
        toast({ title: "Subscription failed", description: err.message ?? "Please try again.", variant: "destructive" });
      }
    } catch {
      toast({ title: "Network error", description: "Please check your connection.", variant: "destructive" });
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="bg-primary text-primary-foreground pt-16 pb-8 border-t-4 border-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">

          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-6 group inline-flex">
              <div className="w-8 h-8 bg-white text-primary flex items-center justify-center rounded-sm">
                <span className="font-serif font-bold text-lg">A</span>
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight">AfricaNews</span>
            </Link>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              Aggregating the most important stories across the African continent from trusted local and international sources.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" className="w-8 h-8 rounded-full bg-primary-foreground/10 flex items-center justify-center hover:bg-accent hover:text-white transition-colors">
                <Instagram className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Sections */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-6 flex items-center gap-2">
              <Globe className="w-4 h-4 text-accent" /> Sections
            </h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><Link href="/category/Politics" className="hover:text-accent transition-colors">Politics</Link></li>
              <li><Link href="/category/Business" className="hover:text-accent transition-colors">Business</Link></li>
              <li><Link href="/category/Technology" className="hover:text-accent transition-colors">Technology</Link></li>
              <li><Link href="/category/Economy" className="hover:text-accent transition-colors">Economy</Link></li>
              <li><Link href="/category/Society" className="hover:text-accent transition-colors">Society</Link></li>
              <li><Link href="/category/Environment" className="hover:text-accent transition-colors">Environment</Link></li>
              <li><Link href="/category/International" className="hover:text-accent transition-colors">International</Link></li>
            </ul>
          </div>

          {/* Regions — now link to /countries?region=X */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-6">Regions</h3>
            <ul className="space-y-3 text-sm text-primary-foreground/80">
              <li><Link href="/countries?region=West Africa" className="hover:text-accent transition-colors">West Africa</Link></li>
              <li><Link href="/countries?region=East Africa" className="hover:text-accent transition-colors">East Africa</Link></li>
              <li><Link href="/countries?region=Southern Africa" className="hover:text-accent transition-colors">Southern Africa</Link></li>
              <li><Link href="/countries?region=North Africa" className="hover:text-accent transition-colors">North Africa</Link></li>
              <li><Link href="/countries?region=Central Africa" className="hover:text-accent transition-colors">Central Africa</Link></li>
              <li><Link href="/countries" className="hover:text-accent transition-colors">All Countries</Link></li>
            </ul>
            <div className="mt-6 space-y-2 text-sm text-primary-foreground/80">
              <Link href="/advertise" className="block hover:text-accent transition-colors">Advertise With Us</Link>
              <Link href="/api-access" className="block hover:text-accent transition-colors">API Access</Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-serif font-bold text-lg mb-6">Daily Digest</h3>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Get the top stories from across Africa delivered to your inbox every morning.
            </p>
            {subscribed ? (
              <div className="flex items-center gap-2 text-green-400 font-medium text-sm py-3">
                <CheckCircle2 className="w-5 h-5" />
                You're subscribed — welcome aboard!
              </div>
            ) : (
              <form className="flex flex-col gap-2" onSubmit={handleSubscribe}>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    placeholder="Your email address"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-primary-foreground/10 border border-primary-foreground/20 rounded-md py-2 pl-10 pr-4 text-sm text-white placeholder:text-primary-foreground/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={subscribing}
                  className="w-full bg-accent hover:bg-accent/90 text-white border-none shadow-none"
                >
                  {subscribing ? "Subscribing…" : "Subscribe Free"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} AfricaNews Aggregator. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/about" className="hover:text-white transition-colors">About</Link>
            <Link href="/advertise" className="hover:text-white transition-colors">Advertise</Link>
            <Link href="/api-access" className="hover:text-white transition-colors">API</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <button
              onClick={() => triggerIngestion.mutate()}
              disabled={triggerIngestion.isPending}
              className="opacity-20 hover:opacity-100 transition-opacity flex items-center gap-1"
              title="Admin: Trigger Ingestion"
            >
              {triggerIngestion.isPending ? "Updating..." : "Force Update"}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
