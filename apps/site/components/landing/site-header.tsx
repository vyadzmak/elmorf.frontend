"use client";

import { ElmorfMark } from "@elmorf/ui/components/elmorf-mark";
import { Button } from "@elmorf/ui/components/ui/button";
import { localeLabels, locales } from "@elmorf/i18n";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { appSignInHref } from "@/lib/app-link";

export function SiteHeader() {
  const t = useTranslations("Landing");
  const locale = useLocale();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const onTry = pathname === "/try";
  const signIn = appSignInHref(locale);

  return (
    <header className="sticky top-0 z-30 border-b border-transparent bg-[var(--elmorf-surface-1)]">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5 text-sm font-medium">
          <ElmorfMark className="size-7" />
          {t("brand")}
        </Link>
        <nav className="hidden items-center gap-5 md:flex" aria-label={t("brand")}>
          <a href="#demo" className="text-sm text-muted-foreground hover:text-foreground">
            {t("howItWorks")}
          </a>
          <Link href="/try" className="text-sm text-muted-foreground hover:text-foreground">
            {t("corpusNav")}
          </Link>
          <span className="flex items-center gap-2 text-sm" aria-label={t("brand")}>
            {locales.map((code) => (
              <Link
                key={code}
                href={pathname}
                locale={code}
                className={
                  code === locale
                    ? "text-foreground underline decoration-foreground/40 underline-offset-4"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {localeLabels[code]}
              </Link>
            ))}
          </span>
          <a href={signIn} className="text-sm text-muted-foreground hover:text-foreground">
            {t("signIn")}
          </a>
          {onTry ? (
            <Button asChild className="h-10">
              <a href={signIn}>{t("signInDemo")}</a>
            </Button>
          ) : (
            <Button asChild className="h-10">
              <Link href="/try">{t("openCorpus")}</Link>
            </Button>
          )}
        </nav>
        <Button
          type="button"
          variant="outline"
          className="md:hidden"
          aria-expanded={menuOpen}
          onClick={() => {
            setMenuOpen((open) => !open);
          }}
        >
          {menuOpen ? t("closeMenu") : t("menu")}
        </Button>
      </div>
      {menuOpen ? (
        <nav className="flex flex-col gap-3 border-t border-border px-6 py-4 md:hidden">
          <a href={signIn} className="text-sm">
            {t("signIn")}
          </a>
          <Button asChild className="h-10 w-full">
            {onTry ? (
              <a href={signIn}>{t("signInDemo")}</a>
            ) : (
              <Link href="/try">{t("openCorpus")}</Link>
            )}
          </Button>
        </nav>
      ) : null}
    </header>
  );
}
