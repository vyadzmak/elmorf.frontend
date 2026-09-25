import * as rootParams from "next/root-params";
import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";
import { loadCommonMessages } from "@elmorf/i18n";
import { routing } from "./routing";

export default getRequestConfig(async ({ locale }) => {
  let resolved = locale;

  if (!resolved) {
    const paramValue = await rootParams.locale();
    if (!hasLocale(routing.locales, paramValue)) {
      notFound();
    }
    resolved = paramValue;
  }

  if (!hasLocale(routing.locales, resolved)) {
    notFound();
  }

  return {
    locale: resolved,
    messages: await loadCommonMessages(resolved),
  };
});
