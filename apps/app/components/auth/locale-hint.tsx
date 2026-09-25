"use client";

import { isLocale } from "@elmorf/i18n";
import { useLocale } from "next-intl";
import { useEffect } from "react";
import { setLocale } from "@/i18n/actions";

export function LocaleHint({ locale }: { locale: string | undefined }) {
  const current = useLocale();

  useEffect(() => {
    if (!isLocale(locale) || locale === current) {
      return;
    }

    void setLocale(locale);
  }, [current, locale]);

  return null;
}
