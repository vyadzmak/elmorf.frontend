import { ThemeControl } from "@elmorf/ui/components/theme-control";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const foundation = await getTranslations("Foundation");
  const t = await getTranslations("Landing");

  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">{t("footerCorpus")}</p>
        <ThemeControl
          layout="segment"
          label={foundation("themeLabel")}
          options={[
            { value: "light", label: foundation("themeLight") },
            { value: "dark", label: foundation("themeDark") },
            { value: "system", label: foundation("themeSystem") },
          ]}
        />
      </div>
    </footer>
  );
}
