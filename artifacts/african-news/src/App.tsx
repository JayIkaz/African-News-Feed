import { Switch, Route, Router as WouterRouter } from "wouter";
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
import ApiAccess from "@/pages/ApiAccess";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/article/:id" component={ArticleDetail} />
      <Route path="/category/:category" component={Category} />
      <Route path="/country/:country" component={Country} />
      <Route path="/search" component={Search} />
      <Route path="/countries" component={Countries} />
      <Route path="/advertise" component={Advertise} />
      <Route path="/api-access" component={ApiAccess} />
      {/* Fallbacks for static sidebar links */}
      <Route path="/trending" component={Home} />
      <Route path="/sources" component={Home} />
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
