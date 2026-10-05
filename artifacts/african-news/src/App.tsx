import { Switch, Route, Redirect, Router as WouterRouter, useParams, useSearch } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

// Pages
import Home from "@/pages/Home";
import ArticleDetail from "@/pages/ArticleDetail";
import Category from "@/pages/Category";
import Country from "@/pages/Country";
import Search from "@/pages/Search";
import Countries from "@/pages/Countries";
import Advertise from "@/pages/Advertise";
import About from "@/pages/About";
import Sources from "@/pages/Sources";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Unsubscribe from "@/pages/Unsubscribe";
import NotFound from "@/pages/not-found";
import { categoryFromSlug, categoryHref, countryFromSlug, slugify } from "@/lib/slugs";
import { listingHref, parseListingQuery } from "@/lib/listing";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

// The home page lists every story. Its query is only ?page=; anything else
// that was put there is dropped by a redirect to the address it means.
function HomeRoute() {
  const { page, needsRedirect } = parseListingQuery(useSearch(), false);
  if (needsRedirect) return <Redirect to={listingHref({ page })} replace />;
  return <Home />;
}

// A section lives at /politics, and a section with one country at
// /politics?country=ghana. Any other spelling of the same name or query goes
// to that address; a word that is not a section is not a page.
function SectionRoute() {
  const { slug } = useParams<{ slug: string }>();
  const search = useSearch();
  const name = categoryFromSlug(slug);
  if (!name) return <NotFound />;
  const { page, country, needsRedirect } = parseListingQuery(search, true);
  if (slug !== slugify(name) || needsRedirect) {
    return <Redirect to={listingHref({ category: name, country, page })} replace />;
  }
  return <Category key={name} category={name} country={country} page={page} />;
}

// The old address of a section, /category/Politics.
function LegacySectionRoute() {
  const { category } = useParams<{ category: string }>();
  const name = categoryFromSlug(category);
  return name ? <Redirect to={categoryHref(name)} replace /> : <NotFound />;
}

// A country lives at /country/south-africa; /country/South%20Africa and the
// like are redirected there. A country with a section is the section's page,
// so /country/ghana?category=politics goes to /politics?country=ghana.
function CountryRoute() {
  const { country } = useParams<{ country: string }>();
  const search = useSearch();
  const name = countryFromSlug(country);
  if (!name) return <NotFound />;
  const { page, needsRedirect } = parseListingQuery(search, false);
  const category = categoryFromSlug(new URLSearchParams(search).get("category") ?? undefined);
  if (category) return <Redirect to={listingHref({ category, country: name, page })} replace />;
  if (country !== slugify(name) || needsRedirect) {
    return <Redirect to={listingHref({ country: name, page })} replace />;
  }
  return <Country key={name} country={name} page={page} />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/article/:id" component={ArticleDetail} />
      <Route path="/category/:category" component={LegacySectionRoute} />
      <Route path="/country/:country" component={CountryRoute} />
      <Route path="/search" component={Search} />
      <Route path="/countries" component={Countries} />
      <Route path="/advertise" component={Advertise} />
      <Route path="/about" component={About} />
      <Route path="/sources" component={Sources} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/unsubscribe" component={Unsubscribe} />
      {/* After every fixed page, so a section name never shadows one. */}
      <Route path="/:slug" component={SectionRoute} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
