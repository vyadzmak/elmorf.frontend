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
  const canonical = locale === routing.defaultLocale ? "/privacy" : `/${locale}/privacy`;

  return {
    title: t("privacyTitle"),
    description: t("privacyLead"),
    alternates: {
      canonical,
      languages: {
        en: "/privacy",
        ru: "/ru/privacy",
        "x-default": "/privacy",
      },
    },
  };
}

export default async function PrivacyPage({
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
        title={t("privacyTitle")}
        lead={t("privacyLead")}
        sections={[
          { title: t("privacyLanguageTitle"), body: t("privacyLanguageBody") },
          { title: t("privacyThemeTitle"), body: t("privacyThemeBody") },
          { title: t("privacyTrackingTitle"), body: t("privacyTrackingBody") },
          { title: t("privacyAccountTitle"), body: t("privacyAccountBody") },
        ]}
      />
    </SiteShell>
  );
}
