"use client";

import { ElmorfMark } from "@elmorf/ui/components/elmorf-mark";
import { Button } from "@elmorf/ui/components/ui/button";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { LocaleMenu } from "@/components/locale-menu";
import { ThemeMenu } from "@/components/theme-menu";
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
      <div className="mx-auto flex w-full max-w-[76rem] items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          <ElmorfMark className="size-7 shrink-0" />
          <span className="flex flex-col">
            <span className="text-sm font-medium leading-none">{t("brand")}</span>
            <span className="mt-1 font-mono text-[11px] leading-none whitespace-nowrap text-muted-foreground">
              {t("nameExpansion")}
            </span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-5 md:flex" aria-label={t("brand")}>
            <Link href="/#how-it-works" className="text-sm text-muted-foreground hover:text-foreground">
              {t("howItWorks")}
            </Link>
            <Link href="/#use-cases" className="text-sm text-muted-foreground hover:text-foreground">
              {t("footerUseCases")}
            </Link>
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
          <div className="flex items-center gap-1">
            <ThemeMenu />
            <LocaleMenu />
          </div>
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
      </div>
      {menuOpen ? (
        <nav className="flex flex-col gap-3 border-t border-border px-6 py-4 md:hidden">
          <Link href="/#how-it-works" className="text-sm" onClick={() => setMenuOpen(false)}>
            {t("howItWorks")}
          </Link>
          <Link href="/#use-cases" className="text-sm" onClick={() => setMenuOpen(false)}>
            {t("footerUseCases")}
          </Link>
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
