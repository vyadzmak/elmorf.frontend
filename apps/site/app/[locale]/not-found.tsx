import { getTranslations } from "next-intl/server";

export default async function NotFound() {
  const t = await getTranslations("Foundation");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-6 py-16">
      <h1 className="text-[1.75rem] font-semibold tracking-tight">
        {t("notFoundTitle")}
      </h1>
      <p className="text-sm text-muted-foreground">{t("notFoundDescription")}</p>
    </main>
  );
}
