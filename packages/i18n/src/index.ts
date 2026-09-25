import enMessages from "../messages/en/common.json";
import ruMessages from "../messages/ru/common.json";

export const locales = ["en", "ru"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

export const LOCALE_COOKIE = "ELMORF_LOCALE";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  ru: "Русский",
};

const rtlLanguages = new Set(["ar", "fa", "he", "ur"]);

export function isLocale(value: string | undefined): value is Locale {
  return locales.some((locale) => locale === value);
}

export function getDirection(locale: string): "ltr" | "rtl" {
  const language = locale.split("-")[0] ?? locale;
  return rtlLanguages.has(language) ? "rtl" : "ltr";
}

export function resolveLocaleFromAcceptLanguage(
  header: string | null,
  fallback: Locale = defaultLocale,
): Locale {
  if (!header) {
    return fallback;
  }

  const ranked = header
    .split(",")
    .map((part) => {
      const [rawTag, ...params] = part.trim().split(";");
      const tag = rawTag?.trim().toLowerCase() ?? "";
      const qualityParam = params.find((param) => param.trim().startsWith("q="));
      const quality = qualityParam
        ? Number(qualityParam.trim().slice(2))
        : 1;

      return {
        tag,
        quality: Number.isFinite(quality) ? quality : 0,
      };
    })
    .filter((entry) => entry.tag.length > 0)
    .sort((left, right) => right.quality - left.quality);

  for (const entry of ranked) {
    if (isLocale(entry.tag)) {
      return entry.tag;
    }

    const language = entry.tag.split("-")[0];
    if (isLocale(language)) {
      return language;
    }
  }

  return fallback;
}

export function resolveRequestLocale(input: {
  cookieLocale: string | undefined;
  acceptLanguage: string | null;
}): Locale {
  if (isLocale(input.cookieLocale)) {
    return input.cookieLocale;
  }

  return resolveLocaleFromAcceptLanguage(input.acceptLanguage);
}

export function pseudoLocalize(value: string): string {
  return `[${value} ···]`;
}

const messageCatalog = { en: enMessages, ru: ruMessages } as const;

export function crashCopy(locale: Locale) {
  const foundation = messageCatalog[locale].Foundation;
  return {
    title: foundation.errorTitle,
    description: foundation.errorDescription,
    retry: foundation.errorRetry,
  };
}

export function loadCommonMessages(locale: Locale) {
  return messageCatalog[locale];
}
