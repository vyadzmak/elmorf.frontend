"use client";

import { ThemeMenu as ThemeMenuControl } from "@elmorf/ui/components/theme-menu";
import { useTranslations } from "next-intl";

export function ThemeMenu() {
  const foundation = useTranslations("Foundation");

  return (
    <ThemeMenuControl
      label={foundation("themeLabel")}
      options={[
        { value: "light", label: foundation("themeLight") },
        { value: "dark", label: foundation("themeDark") },
        { value: "system", label: foundation("themeSystem") },
      ]}
    />
  );
}
