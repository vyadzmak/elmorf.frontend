import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getTranslations } from "next-intl/server";
import { getDirection } from "@elmorf/i18n";
import { parsePublicEnv } from "@elmorf/config/env";
import { ThemeProvider } from "@elmorf/ui/components/theme-provider";
import { AppProviders } from "@/components/app-providers";
import { fontClassName } from "@/lib/fonts";
import "./globals.css";

const env = parsePublicEnv();

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Foundation");

  return {
    title: t("metaTitle"),
    description: t("description"),
    icons: { icon: "/favicon.svg" },
    robots: { index: false, follow: false },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();

  return (
    <html
      lang={locale}
      dir={getDirection(locale)}
      suppressHydrationWarning
      className={fontClassName}
    >
      <body className="min-h-full bg-background font-sans text-foreground">
        <ThemeProvider>
          <NextIntlClientProvider>
            <AppProviders
              apiBaseUrl={env.NEXT_PUBLIC_API_BASE_URL}
              mockMode={env.NEXT_PUBLIC_MOCK_MODE === "true"}
            >
              {children}
            </AppProviders>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
