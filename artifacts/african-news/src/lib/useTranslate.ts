import { useState } from "react";
import { Article, useTranslateArticle } from "@workspace/api-client-react";

const LANG_LABELS: Record<string, string> = { fr: "French", pt: "Portuguese", ar: "Arabic" };

// Toggleable English translation for a non-English article. The API caches
// translations in the DB, so repeat requests (any reader) are instant.
// Accepts undefined so pages can call it before the article has loaded
// (hooks must run unconditionally).
export function useTranslate(article: Article | undefined) {
  const [showEnglish, setShowEnglish] = useState(false);
  const [fetched, setFetched] = useState<{ titleEn: string; summaryEn: string } | null>(null);
  const mutation = useTranslateArticle();

  const cached =
    article?.titleEn && article?.summaryEn
      ? { titleEn: article.titleEn, summaryEn: article.summaryEn }
      : null;
  const translation = fetched ?? cached;

  const canTranslate = article !== undefined && article.language !== undefined && article.language !== "en";
  const languageLabel = LANG_LABELS[article?.language ?? ""] ?? article?.language ?? "";

  const toggle = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!article) return;
    if (showEnglish) {
      setShowEnglish(false);
      return;
    }
    if (translation) {
      setShowEnglish(true);
      return;
    }
    mutation.mutate(
      { id: article.id },
      {
        onSuccess: (data) => {
          setFetched({ titleEn: data.titleEn, summaryEn: data.summaryEn });
          setShowEnglish(true);
        },
      },
    );
  };

  return {
    canTranslate,
    languageLabel,
    isTranslating: mutation.isPending,
    translateFailed: mutation.isError,
    showEnglish,
    title: showEnglish && translation ? translation.titleEn : (article?.title ?? ""),
    summary: showEnglish && translation ? translation.summaryEn : (article?.summary ?? ""),
    toggle,
  };
}
