import { defineRouting } from "next-intl/routing";
import { defaultLocale, LOCALE_COOKIE, locales } from "@elmorf/i18n";

export const routing = defineRouting({
  locales: [...locales],
  defaultLocale,
  localePrefix: "as-needed",
  localeDetection: false,
  localeCookie: {
    name: LOCALE_COOKIE,
  },
});
