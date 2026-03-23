import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Globe, TrendingUp, ChevronDown, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useListCountries } from "@workspace/api-client-react";
import { COUNTRY_FLAGS } from "@/lib/countries";

const CATEGORIES = [
  "Politics", "Business", "Technology", "Economy", "Society", "Environment", "International"
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [countriesOpen, setCountriesOpen] = useState(false);
  const [location, setLocation] = useLocation();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: countries } = useListCountries();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      setMobileMenuOpen(false);
    }
  };

  const isOnCountries = location === "/countries" || location.startsWith("/country/");

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${
      isScrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background border-b border-border"
    }`}>
      {/* Top utility bar */}
      <div className="bg-primary text-primary-foreground text-xs py-1.5 px-4 hidden md:flex justify-between items-center">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 opacity-90"><Globe className="w-3 h-3" /> Pan-African Edition</span>
          <span className="opacity-70">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/trending" className="flex items-center gap-1 hover:text-white transition-colors opacity-90">
            <TrendingUp className="w-3 h-3 text-accent" /> Trending Now
          </Link>
          <span className="opacity-30">|</span>
          <Link href="/sources" className="hover:text-white transition-colors opacity-90">Our Sources</Link>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-sm overflow-hidden group-hover:bg-accent transition-colors relative">
              <img
                src={`${import.meta.env.BASE_URL}images/logo-icon.png`}
                alt="AfricaNews Logo"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
              />
              <span className="font-serif font-bold text-xl absolute">A</span>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl md:text-3xl font-black leading-none tracking-tight">AfricaNews</span>
              <span className="text-[0.6rem] uppercase tracking-[0.2em] text-muted-foreground font-semibold">The Continent's Pulse</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md ml-12">
            <form onSubmit={handleSearch} className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                type="search"
                placeholder="Search news, topics, or countries..."
                className="w-full pl-10 bg-secondary/50 border-transparent focus-visible:bg-background focus-visible:border-primary focus-visible:ring-primary/20 rounded-full transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>

        {/* Category + Countries Navigation (Desktop) */}
        <nav className="hidden md:flex items-center justify-center space-x-1 py-3 border-t border-border/50">
          {CATEGORIES.map((category) => {
            const isActive = location === `/category/${category}`;
            return (
              <Link
                key={category}
                href={`/category/${category}`}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  isActive
                    ? "text-accent bg-accent/10 font-semibold underline underline-offset-4 decoration-accent/60"
                    : "text-foreground/80 hover:text-accent hover:bg-accent/5"
                }`}
              >
                {category}
              </Link>
            );
          })}
          <span className="text-border mx-2">|</span>

          {/* Countries Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setCountriesOpen(!countriesOpen)}
              className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                isOnCountries || countriesOpen
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground/80 hover:text-primary hover:bg-primary/5"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              Countries
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${countriesOpen ? "rotate-180" : ""}`} />
            </button>

            {countriesOpen && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-background border border-border rounded-xl shadow-xl z-50 py-2 overflow-hidden">
                <div className="px-4 py-2 border-b border-border flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Browse by Country</span>
                  <Link
                    href="/countries"
                    onClick={() => setCountriesOpen(false)}
                    className="text-xs text-primary hover:underline font-medium"
                  >
                    View all →
                  </Link>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {countries && countries.length > 0 ? (
                    countries.map((item) => (
                      <Link
                        key={item.country}
                        href={`/country/${encodeURIComponent(item.country)}`}
                        onClick={() => setCountriesOpen(false)}
                        className="flex items-center justify-between px-4 py-2.5 hover:bg-secondary transition-colors group"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg leading-none">{COUNTRY_FLAGS[item.country] ?? "🌍"}</span>
                          <span className="text-sm font-medium group-hover:text-primary transition-colors">{item.country}</span>
                        </div>
                        <span className="text-xs text-muted-foreground bg-secondary rounded-full px-2 py-0.5 font-medium">
                          {item.articleCount.toLocaleString()}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <div className="px-4 py-6 text-center text-sm text-muted-foreground">Loading countries...</div>
                  )}
                </div>
                <div className="px-4 py-2 border-t border-border">
                  <Link
                    href="/countries"
                    onClick={() => setCountriesOpen(false)}
                    className="block text-center text-sm font-medium text-primary hover:text-accent transition-colors py-1"
                  >
                    See all country pages →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background absolute w-full shadow-xl z-50">
          <div className="px-4 pt-4 pb-6 space-y-4">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <nav className="flex flex-col space-y-1">
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Categories</div>
              {CATEGORIES.map((category) => {
                const isActive = location === `/category/${category}`;
                return (
                  <Link
                    key={category}
                    href={`/category/${category}`}
                    className={`px-3 py-2 text-base font-medium rounded-md transition-colors ${
                      isActive ? "bg-accent/10 text-accent font-semibold" : "hover:bg-secondary"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {category}
                  </Link>
                );
              })}
              <div className="my-2 border-t border-border" />
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">Countries</div>
              {countries && countries.slice(0, 8).map((item) => (
                <Link
                  key={item.country}
                  href={`/country/${encodeURIComponent(item.country)}`}
                  className="flex items-center gap-2 px-3 py-2 text-base font-medium rounded-md hover:bg-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span>{COUNTRY_FLAGS[item.country] ?? "🌍"}</span>
                  {item.country}
                  <span className="ml-auto text-sm text-muted-foreground">{item.articleCount}</span>
                </Link>
              ))}
              <Link
                href="/countries"
                className="px-3 py-2 text-base font-medium rounded-md hover:bg-secondary transition-colors text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                See all countries →
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
