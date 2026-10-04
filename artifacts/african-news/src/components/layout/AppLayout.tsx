import { ReactNode, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { canonicalQuery } from "@/lib/listing";
import { SITE_ORIGIN } from "@/lib/site";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children: ReactNode;
}

// The app is a single-page shell, so every route is served the same
// index.html. A canonical link written in that file would point every page at
// the home page. It is set here instead, from the path being shown.
function useCanonicalLink() {
  const [location] = useLocation();
  const search = useSearch();
  useEffect(() => {
    // Every address on the site is lower case, so /About and /about are one
    // page; the lower-case form is the canonical one. A list keeps its page
    // and, for a section, its country; no other query belongs to the address.
    const path = (window.location.pathname.replace(/\/+$/, "") || "/").toLowerCase();
    let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "canonical";
      document.head.appendChild(link);
    }
    link.href = SITE_ORIGIN + path + canonicalQuery(path, search);
  }, [location, search]);
}

export function AppLayout({ children }: AppLayoutProps) {
  useCanonicalLink();
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--paper)", color: "var(--ink)" }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
