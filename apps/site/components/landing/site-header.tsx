import { ElmorfMark } from "@elmorf/ui/components/elmorf-mark";
import { Button } from "@elmorf/ui/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { appSignInHref } from "@/lib/app-link";

export async function SiteHeader() {
  const t = await getTranslations("Landing");
  const locale = await getLocale();
  const signIn = appSignInHref(locale);

  return (
    <header className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
      <Link href="/" className="flex items-center gap-2 text-sm font-medium">
        <ElmorfMark className="size-5" />
        {t("brand")}
      </Link>
      <nav className="hidden items-center gap-4 md:flex" aria-label={t("brand")}>
        <a href={signIn} className="text-sm text-muted-foreground hover:text-foreground">
          {t("signIn")}
        </a>
        <Button asChild>
          <Link href="/try">{t("try")}</Link>
        </Button>
      </nav>
      <details className="relative md:hidden">
        <summary className="cursor-pointer list-none rounded-lg border border-border px-2.5 py-1 text-sm [&::-webkit-details-marker]:hidden">
          {t("menu")}
        </summary>
        <nav className="absolute end-0 z-20 mt-2 flex w-52 flex-col gap-2 rounded-lg border border-border bg-popover p-3">
          <a href={signIn} className="text-sm">
            {t("signIn")}
          </a>
          <Button asChild>
            <Link href="/try">{t("try")}</Link>
          </Button>
        </nav>
      </details>
    </header>
  );
}
