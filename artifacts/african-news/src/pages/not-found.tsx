import { Link } from "wouter";
import { AlertCircle } from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <AppLayout>
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-destructive/10 text-destructive mb-6">
            <AlertCircle className="w-10 h-10" />
          </div>
          <h1 className="font-serif text-4xl font-bold mb-4 text-foreground">Page Not Found</h1>
          <p className="text-muted-foreground text-lg mb-8 font-article">
            The article, section, or page you are looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <Button size="lg" className="rounded-full px-8 font-bold">
              Return to Homepage
            </Button>
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}
