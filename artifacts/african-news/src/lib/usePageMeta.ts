import { useEffect } from "react";

interface PageMeta {
  title: string;
  description?: string;
  noindex?: boolean;
}

// The app serves one index.html for every route, so each page sets its own
// title and description here and puts the previous ones back when it unmounts.
export function usePageMeta({ title, description, noindex }: PageMeta) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    const descriptionTag = document.head.querySelector<HTMLMetaElement>('meta[name="description"]');
    const previousDescription = descriptionTag?.getAttribute("content") ?? null;
    if (description && descriptionTag) descriptionTag.setAttribute("content", description);

    let robots: HTMLMetaElement | null = null;
    if (noindex) {
      robots = document.createElement("meta");
      robots.name = "robots";
      robots.content = "noindex";
      document.head.appendChild(robots);
    }

    return () => {
      document.title = previousTitle;
      if (descriptionTag && previousDescription !== null) {
        descriptionTag.setAttribute("content", previousDescription);
      }
      robots?.remove();
    };
  }, [title, description, noindex]);
}
