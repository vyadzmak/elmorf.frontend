import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { LocaleHint } from "@/components/auth/locale-hint";
import { SignInPanel } from "@/components/auth/sign-in-panel";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Auth");
  return { title: t("signInTitle") };
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ locale?: string }>;
}) {
  const { locale } = await searchParams;
  return (
    <>
      <LocaleHint locale={locale} />
      <SignInPanel />
    </>
  );
}
