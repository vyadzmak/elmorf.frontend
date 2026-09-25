"use server";

import { LOCALE_COOKIE, isLocale } from "@elmorf/i18n";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function setLocale(locale: string) {
  if (!isLocale(locale)) {
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  });
  revalidatePath("/", "layout");
}
