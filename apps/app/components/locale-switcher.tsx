"use client";

import { localeLabels, locales, type Locale } from "@elmorf/i18n";
import { Button } from "@elmorf/ui/components/ui/button";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";

export function LocaleSwitcher({
  activeLocale,
  label,
  onLocaleChange,
}: {
  activeLocale: Locale;
  label: string;
  onLocaleChange?: (locale: Locale) => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{label}</h2>
      <div className="flex gap-2">
        {locales.map((code) => (
          <Button
            key={code}
            variant={code === activeLocale ? "default" : "outline"}
            disabled={isPending}
            onClick={() => {
              if (code !== activeLocale) {
                onLocaleChange?.(code);
              }
              startTransition(() => {
                void setLocale(code);
              });
            }}
          >
            {localeLabels[code]}
          </Button>
        ))}
      </div>
    </section>
  );
}
