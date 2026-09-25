import { ThemeControl } from "@elmorf/ui/components/theme-control";
import { getLocale, getTranslations } from "next-intl/server";
import { isLocale } from "@elmorf/i18n";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function SiteFooter() {
  const foundation = await getTranslations("Foundation");
  const t = await getTranslations("Landing");
  const locale = await getLocale();
  const activeLocale = isLocale(locale) ? locale : "en";

  return (
    <footer className="mt-8 flex flex-col gap-6 border-t border-border px-6 py-8">
      <p className="text-sm text-muted-foreground">{t("footerNote")}</p>
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <ThemeControl
          label={foundation("themeLabel")}
          options={[
            { value: "light", label: foundation("themeLight") },
            { value: "dark", label: foundation("themeDark") },
            { value: "system", label: foundation("themeSystem") },
          ]}
        />
        <LocaleSwitcher
          inline
          activeLocale={activeLocale}
          label={foundation("localeLabel")}
        />
      </div>
    </footer>
  );
}
