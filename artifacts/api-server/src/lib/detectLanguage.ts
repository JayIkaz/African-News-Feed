// Lightweight language detection for article title+summary text.
// Covers the languages our sources actually publish in: English, French,
// Portuguese (Angola/Mozambique), and Arabic (North Africa). Heuristic only —
// no API calls — so it can run on every ingested article for free.

const STOPWORDS: Record<"en" | "fr" | "pt", string[]> = {
  en: ["the", "and", "of", "to", "in", "is", "for", "on", "with", "has", "have", "was", "that", "from", "his", "her", "will", "are", "been", "said"],
  fr: ["le", "la", "les", "des", "une", "un", "et", "est", "dans", "pour", "que", "qui", "sur", "avec", "pas", "par", "ont", "aux", "été", "cette", "après", "plus"],
  pt: ["o", "a", "os", "as", "um", "uma", "de", "do", "da", "dos", "das", "em", "no", "na", "para", "que", "com", "por", "foi", "são", "não", "mais", "após"],
};

export type DetectedLanguage = "en" | "fr" | "pt" | "ar";

export function detectLanguage(text: string): DetectedLanguage {
  if (!text) return "en";

  // Arabic: script-based — if a meaningful share of letters are Arabic.
  const arabicChars = (text.match(/[؀-ۿ]/g) ?? []).length;
  if (arabicChars > 10 && arabicChars / text.length > 0.2) return "ar";

  const words = text
    .toLowerCase()
    .replace(/[^\p{L}\s'-]/gu, " ")
    .split(/\s+/)
    .filter(Boolean);
  if (words.length < 5) return "en";

  const scores: Record<"en" | "fr" | "pt", number> = { en: 0, fr: 0, pt: 0 };
  for (const word of words) {
    for (const lang of ["en", "fr", "pt"] as const) {
      if (STOPWORDS[lang].includes(word)) scores[lang]++;
    }
  }

  const best = (Object.entries(scores) as ["en" | "fr" | "pt", number][]).sort((a, b) => b[1] - a[1])[0];
  // Require a clear signal; default to English (no translate button) when unsure.
  if (best[1] < 2 || best[1] < words.length * 0.03) return "en";
  return best[0];
}
