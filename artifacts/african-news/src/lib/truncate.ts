// Spec §4: don't rely on CSS line-clamp alone for the cut point — it can
// break mid-word. Truncate on the last full word before the limit instead;
// the clamp then only acts as a safety net.
export function truncateToWord(text: string, maxChars: number): string {
  if (text.length <= maxChars) return text;
  const cut = text.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(" ");
  return cut.slice(0, lastSpace > 0 ? lastSpace : maxChars).trim() + "…";
}
