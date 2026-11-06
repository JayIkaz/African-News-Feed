import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useSearch } from "wouter";
import { SECTIONS, categoryHref } from "@/lib/slugs";
import { BrandLogo } from "@/components/brand/BrandLogo";

// A keystroke typed into a field is for the field, not for a shortcut.
function isTyping(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  return el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName);
}

const DESKTOP = "(min-width: 768px)";

// Takes the reader to the sign-up form in the footer and puts the cursor in it.
function goToNewsletter(e: React.MouseEvent) {
  e.preventDefault();
  const form = document.getElementById("footer-newsletter");
  if (!form) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  form.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  form.querySelector<HTMLInputElement>("input[type=email]")?.focus({ preventScroll: true });
}

interface SearchBoxProps {
  inputRef: React.RefObject<HTMLInputElement | null>;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  placeholder: string;
  // The "/" hint is shown beside the field only where a keyboard is likely.
  hint?: boolean;
  className?: string;
}

function SearchBox({ inputRef, value, onChange, onSubmit, placeholder, hint = false, className = "" }: SearchBoxProps) {
  return (
    <form role="search" onSubmit={onSubmit} className={`an-nav-search-form ${className}`}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        aria-label="Search news, topics and countries"
        aria-keyshortcuts={hint ? "/ Control+K Meta+K" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="an-nav-search"
      />
      {hint && <kbd className="an-nav-kbd" aria-hidden="true">/</kbd>}
      <button type="submit" aria-label="Search" className="an-nav-search-btn">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </button>
    </form>
  );
}

// One sticky bar, 56px tall: the logo, a search field, and Countries and
// Newsletter as links. Sections are reached from the filter row on the lists,
// from the footer, and from the menu on a phone.
export function Navbar() {
  const [location, setLocation] = useLocation();
  const search = useSearch();
  // On the search page the field shows what was searched for.
  const urlQuery = location === "/search" ? (new URLSearchParams(search).get("q") ?? "") : "";
  const [query, setQuery] = useState(urlQuery);
  useEffect(() => setQuery(urlQuery), [urlQuery]);

  const [menuOpen, setMenuOpen] = useState(false);
  const desktopInput = useRef<HTMLInputElement>(null);
  const menuInput = useRef<HTMLInputElement>(null);
  const menuButton = useRef<HTMLButtonElement>(null);
  const focusMenuInput = useRef(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    setLocation(`/search?q=${encodeURIComponent(q)}`);
    setMenuOpen(false);
  };

  // "/" and Cmd+K or Ctrl+K go to the search field. On a phone-sized screen
  // the field is in the menu, so the menu opens first.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.isComposing || e.altKey) return;
      const palette = (e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey);
      const slash = e.key === "/" && !e.metaKey && !e.ctrlKey && !isTyping(e.target);
      if (!palette && !slash) return;
      e.preventDefault();
      if (window.matchMedia(DESKTOP).matches) {
        desktopInput.current?.focus();
        desktopInput.current?.select();
      } else {
        focusMenuInput.current = true;
        setMenuOpen(true);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (menuOpen && focusMenuInput.current) {
      focusMenuInput.current = false;
      menuInput.current?.focus();
    }
  }, [menuOpen]);

  // Escape closes the menu and hands focus back to its button.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const onCountries = location.startsWith("/countr");

  return (
    <header className="an-header">
      <div className="an-header-inner">
        <Link href="/" className="an-brand">
          <BrandLogo />
        </Link>

        <SearchBox
          inputRef={desktopInput}
          value={query}
          onChange={setQuery}
          onSubmit={submit}
          placeholder="Search news, topics, countries…"
          hint
          className="an-nav-search-form--bar"
        />

        <nav aria-label="Site" className="an-header-links">
          <Link href="/countries" className="an-nav-link" aria-current={location === "/countries" ? "page" : undefined} data-active={onCountries || undefined}>
            Countries
          </Link>
          <a href="#footer-newsletter" className="an-nav-link" onClick={goToNewsletter}>Newsletter</a>
        </nav>

        <button
          ref={menuButton}
          type="button"
          className="an-menu-btn"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="an-mobile-menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m18 6-12 12M6 6l12 12" /></svg>
          ) : (
            <svg aria-hidden="true" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
          )}
        </button>
      </div>

      {menuOpen && (
        <div id="an-mobile-menu" className="an-mobile-menu">
          <SearchBox
            inputRef={menuInput}
            value={query}
            onChange={setQuery}
            onSubmit={submit}
            placeholder="Search…"
          />
          <nav aria-label="Menu" className="an-mobile-menu-links">
            <Link href="/" className="an-mobile-link" onClick={() => setMenuOpen(false)}>Home</Link>
            {SECTIONS.map((name) => (
              <Link key={name} href={categoryHref(name)} className="an-mobile-link" onClick={() => setMenuOpen(false)}>
                {name}
              </Link>
            ))}
            <Link href="/countries" className="an-mobile-link" onClick={() => setMenuOpen(false)}>Countries</Link>
            <a
              href="#footer-newsletter"
              className="an-mobile-link"
              onClick={(e) => { setMenuOpen(false); goToNewsletter(e); }}
            >
              Newsletter
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
