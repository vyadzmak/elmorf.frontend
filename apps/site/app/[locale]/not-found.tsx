import { Button } from "@elmorf/ui/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function NotFound() {
  const t = await getTranslations("Foundation");
  const landing = await getTranslations("Landing");

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-4 px-6 py-16">
      <h1 className="text-[1.75rem] font-semibold tracking-tight">{t("notFoundTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("notFoundDescription")}</p>
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/">{landing("backHome")}</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/try">{landing("openCorpus")}</Link>
        </Button>
      </div>
    </main>
  );
}
