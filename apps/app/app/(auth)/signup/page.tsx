import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LocaleHint } from "@/components/auth/locale-hint";
import { SignUpPanel } from "@/components/auth/sign-up-panel";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("signUpTitle") };
}

export default async function SignUpPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale } = await searchParams;
  return (
    <>
      <LocaleHint locale={locale} />
      <SignUpPanel />
    </>
  );
}
