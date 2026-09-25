import type { Metadata } from "next";
import { parsePublicEnv } from "@elmorf/config/env";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/landing/site-shell";
import { TryProviders } from "@/components/try/try-providers";
import { TryWorkbench } from "@/components/try/try-workbench";
import { routing } from "@/i18n/routing";
import { appAuthHref } from "@/lib/app-link";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Landing" });
  const canonical = locale === routing.defaultLocale ? "/try" : `/${locale}/try`;

  return {
    title: t("tryPageTitle"),
    description: t("tryPageBody"),
    alternates: {
      canonical,
      languages: {
        en: "/try",
        ru: "/ru/try",
        "x-default": "/try",
      },
    },
    openGraph: {
      title: t("tryPageTitle"),
      description: t("tryPageBody"),
      url: canonical,
      locale: locale === "ru" ? "ru_RU" : "en_US",
      type: "website",
    },
  };
}

export default async function TryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Landing");
  const env = parsePublicEnv();

  return (
    <SiteShell>
        <TryProviders
          apiBaseUrl={env.NEXT_PUBLIC_API_BASE_URL}
          mockMode={env.NEXT_PUBLIC_MOCK_MODE === "true"}
        >
        <TryWorkbench
          title={t("tryPageTitle")}
          intro={t("tryPageBody")}
          signupHref={appAuthHref(locale, "signup")}
        />
      </TryProviders>
    </SiteShell>
  );
}
