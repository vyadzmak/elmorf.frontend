import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LocaleHint } from "@/components/auth/locale-hint";
import { ResetPanel } from "@/components/auth/reset-panel";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("resetTitle") };
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale } = await searchParams;
  return (
    <>
      <LocaleHint locale={locale} />
      <ResetPanel />
    </>
  );
}
