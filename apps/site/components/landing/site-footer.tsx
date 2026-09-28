import { ElmorfMark } from "@elmorf/ui/components/elmorf-mark";
import { getLocale, getTranslations } from "next-intl/server";
import { CookieSettingsButton } from "@/components/cookie-consent";
import { Link } from "@/i18n/navigation";
import { appSignInHref } from "@/lib/app-link";

export async function SiteFooter() {
  const t = await getTranslations("Landing");
  const locale = await getLocale();
  const year = new Date().getFullYear();
  const signIn = appSignInHref(locale);
  const columns: {
    title: string;
    links: { label: string; href: string; external?: boolean }[];
  }[] = [
    {
      title: t("footerProduct"),
      links: [
        { label: t("howItWorks"), href: "/#how-it-works" },
        { label: t("footerDemo"), href: "/try" },
        { label: t("footerUseCases"), href: "/#use-cases" },
      ],
    },
    {
      title: t("footerDevelopers"),
      links: [{ label: t("footerSdk"), href: "/#sdk" }],
    },
    {
      title: t("footerAccount"),
      links: [{ label: t("signIn"), href: signIn, external: true }],
    },
    {
      title: t("footerLegal"),
      links: [
        { label: t("footerPrivacy"), href: "/privacy" },
        { label: t("footerTerms"), href: "/terms" },
      ],
    },
  ];

  return (
    <footer className="mt-8 border-t border-border">
      <div className="mx-auto w-full max-w-[76rem] px-6 py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[minmax(14rem,1.4fr)_repeat(4,minmax(0,1fr))]">
          <div className="flex flex-col gap-3 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex w-fit items-center gap-2.5 text-sm font-medium">
              <ElmorfMark className="size-7" />
              {t("brand")}
            </Link>
            <p className="max-w-xs text-sm leading-6 text-muted-foreground">{t("footerTagline")}</p>
          </div>
          {columns.map((column) => (
            <nav key={column.title} aria-label={column.title} className="flex flex-col gap-3">
              <h2 className="text-sm font-medium">{column.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((item) => (
                  <li key={item.label}>
                    {item.external ? (
                      <a
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground hover:text-foreground"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t("footerRights", { year })}
            {" · "}
            {t("footerCorpus")}
          </p>
          <CookieSettingsButton label={t("cookieSettings")} />
        </div>
      </div>
    </footer>
  );
}
