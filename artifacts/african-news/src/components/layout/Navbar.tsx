import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, Menu, X, Globe, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "Politics", "Business", "Technology", "Economy", "Society", "Environment", "International"
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [, setLocation] = useLocation();

  // Handle scroll effect
  if (typeof window !== "undefined") {
    window.onscroll = () => setIsScrolled(window.scrollY > 10);
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
      setMobileMenuOpen(false);
    }
  };

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
            <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center rounded-sm overflow-hidden group-hover:bg-accent transition-colors">
              <img 
                src={`${import.meta.env.BASE_URL}images/logo-icon.png`} 
                alt="AfricaNews Logo" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback if image not generated yet
                  (e.target as HTMLElement).style.display = 'none';
                }}
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

        {/* Category Navigation (Desktop) */}
        <nav className="hidden md:flex items-center justify-center space-x-1 py-3 border-t border-border/50">
          {CATEGORIES.map((category) => (
            <Link 
              key={category} 
              href={`/category/${category}`}
              className="px-4 py-1.5 text-sm font-medium text-foreground/80 hover:text-accent hover:bg-accent/5 rounded-full transition-all"
            >
              {category}
            </Link>
          ))}
          <span className="text-border mx-2">|</span>
          <Link href="/countries" className="px-4 py-1.5 text-sm font-medium text-foreground/80 hover:text-primary hover:bg-primary/5 rounded-full transition-all">
            Countries
          </Link>
        </nav>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background absolute w-full shadow-xl">
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
              {CATEGORIES.map((category) => (
                <Link 
                  key={category} 
                  href={`/category/${category}`}
                  className="px-3 py-2 text-base font-medium rounded-md hover:bg-secondary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {category}
                </Link>
              ))}
              <div className="my-2 border-t border-border" />
              <Link 
                href="/countries"
                className="px-3 py-2 text-base font-medium rounded-md hover:bg-secondary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse by Country
              </Link>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
