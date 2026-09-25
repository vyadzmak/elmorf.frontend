"use client";

import { isLocale, type Locale } from "@elmorf/i18n";
import { ThemeControl, type ThemeChoice } from "@elmorf/ui/components/theme-control";
import { toast } from "@elmorf/ui/components/ui/sonner";
import { useMutation } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useMockReady } from "@/components/app-providers";
import { LocaleSwitcher } from "@/components/locale-switcher";
import { useApiClient } from "@/lib/use-api";

export function AppearanceSettings() {
  const foundation = useTranslations("Foundation");
  const t = useTranslations("Settings");
  const locale = useLocale();
  const activeLocale: Locale = isLocale(locale) ? locale : "en";
  const ready = useMockReady();
  const api = useApiClient();
  const update = useMutation({
    mutationFn: (patch: { theme?: ThemeChoice; locale?: Locale }) =>
      api.preferences.update(patch),
    onError: () => {
      toast.error(t("preferenceError"));
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <ThemeControl
        label={foundation("themeLabel")}
        options={[
          { value: "light", label: foundation("themeLight") },
          { value: "dark", label: foundation("themeDark") },
          { value: "system", label: foundation("themeSystem") },
        ]}
        onThemeChange={(theme) => {
          if (ready) {
            update.mutate({ theme });
          }
        }}
      />
      <LocaleSwitcher
        activeLocale={activeLocale}
        label={foundation("localeLabel")}
        onLocaleChange={(next) => {
          if (ready) {
            update.mutate({ locale: next });
          }
        }}
      />
    </div>
  );
}
