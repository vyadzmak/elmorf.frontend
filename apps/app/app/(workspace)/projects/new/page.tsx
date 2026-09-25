import { Button } from "@elmorf/ui/components/ui/button";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { WorkspacePage } from "@/components/shell/workspace-page";

export default async function NewProjectPage() {
  const t = await getTranslations("Shell");

  return (
    <WorkspacePage title={t("createProjectTitle")} description={t("createProjectDescription")}>
      <div className="flex max-w-xl flex-col gap-5 rounded-xl border border-border bg-[var(--elmorf-surface-1)] p-6">
        <p className="text-sm text-muted-foreground">{t("sectionPending")}</p>
        <Button asChild className="w-fit">
          <Link href="/projects/prj_vendor_contracts/overview">{t("backToCorpus")}</Link>
        </Button>
      </div>
    </WorkspacePage>
  );
}
