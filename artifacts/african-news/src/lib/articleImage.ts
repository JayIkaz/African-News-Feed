import { useState } from "react";
import type { Article } from "@workspace/api-client-react";

// The image the publisher supplied with the story, or null when there is none.
// There is no stand-in: a stock photo picked from the headline's keywords
// shows a picture of something the story is not about.
export function getArticleImage(article: Pick<Article, "imageUrl">): string | null {
  const url = article.imageUrl?.trim();
  return url ? url : null;
}

// The image to show for a story, plus the handler that retires it if the
// browser cannot load it. Callers render the image slot only when `src` is
// set, so a story with no usable image shows no empty tile.
export function useArticleImage(article: Pick<Article, "imageUrl">) {
  const url = getArticleImage(article);
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  return {
    src: url && failedUrl !== url ? url : null,
    onError: () => setFailedUrl(url),
  };
}
