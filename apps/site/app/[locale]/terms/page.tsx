import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { SiteShell } from "@/components/landing/site-shell";
import { LegalDocument } from "@/components/legal-document";
import { routing } from "@/i18n/routing";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  const canonical = locale === routing.defaultLocale ? "/terms" : `/${locale}/terms`;

  return {
    title: t("termsTitle"),
    description: t("termsLead"),
    alternates: {
      canonical,
      languages: {
        en: "/terms",
        ru: "/ru/terms",
        "x-default": "/terms",
      },
    },
  };
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Legal");

  return (
    <SiteShell>
      <LegalDocument
        title={t("termsTitle")}
        lead={t("termsLead")}
        sections={[
          { title: t("termsDemoTitle"), body: t("termsDemoBody") },
          { title: t("termsAccountTitle"), body: t("termsAccountBody") },
          { title: t("termsChangeTitle"), body: t("termsChangeBody") },
        ]}
      />
    </SiteShell>
  );
}
