import { parsePublicEnv } from "@elmorf/config/env";
import { isLocale } from "@elmorf/i18n";

export function appAuthHref(
  locale: string,
  path: "login" | "signup" | "forgot-password",
): string {
  const url = new URL(`/${path}`, parsePublicEnv().NEXT_PUBLIC_APP_URL);
  if (isLocale(locale)) {
    url.searchParams.set("locale", locale);
  }
  return url.toString();
}

export function appSignInHref(locale: string): string {
  return appAuthHref(locale, "login");
}
