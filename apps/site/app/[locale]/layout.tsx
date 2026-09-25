import type { Metadata } from "next";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getDirection } from "@elmorf/i18n";
import { parsePublicEnv } from "@elmorf/config/env";
import { ThemeProvider } from "@elmorf/ui/components/theme-provider";
import { fontClassName } from "@/lib/fonts";
import { routing } from "@/i18n/routing";
import "../globals.css";

const env = parsePublicEnv();

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });

  return {
    metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
    title: t("metaTitle"),
    description: t("metaDescription"),
    icons: { icon: "/favicon.svg" },
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      suppressHydrationWarning
      className={fontClassName}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider>
          <NextIntlClientProvider>{children}</NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
