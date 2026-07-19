// DeepL-backed translation to English. Free-tier keys end in ":fx" and use
// the api-free host; paid keys use api.deepl.com.

const LANG_MAP: Record<string, string> = { fr: "FR", pt: "PT", ar: "AR" };

export function isTranslateConfigured(): boolean {
  return Boolean(process.env.DEEPL_API_KEY);
}

export async function translateToEnglish(
  texts: string[],
  sourceLanguage: string,
): Promise<string[]> {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) throw new Error("DEEPL_API_KEY is not configured");

  const host = apiKey.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const body: Record<string, unknown> = {
    text: texts,
    target_lang: "EN",
  };
  const sourceLang = LANG_MAP[sourceLanguage];
  if (sourceLang) body.source_lang = sourceLang;

  const resp = await fetch(`https://${host}/v2/translate`, {
    method: "POST",
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20000),
  });

  if (!resp.ok) {
    const detail = await resp.text().catch(() => "");
    throw new Error(`DeepL error ${resp.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await resp.json()) as { translations: { text: string }[] };
  if (!data.translations || data.translations.length !== texts.length) {
    throw new Error("DeepL returned an unexpected response shape");
  }
  return data.translations.map((t) => t.text);
}
