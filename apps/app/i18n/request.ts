import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import {
  loadCommonMessages,
  LOCALE_COOKIE,
  resolveRequestLocale,
} from "@elmorf/i18n";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const locale = resolveRequestLocale({
    cookieLocale: cookieStore.get(LOCALE_COOKIE)?.value,
    acceptLanguage: headerStore.get("accept-language"),
  });

  return {
    locale,
    messages: await loadCommonMessages(locale),
  };
});
