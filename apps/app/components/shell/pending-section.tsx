import { getTranslations } from "next-intl/server";
import { Skeleton } from "@elmorf/ui/components/ui/skeleton";
import { WorkspacePage } from "@/components/shell/workspace-page";

type SectionTitleKey =
  | "navOverview"
  | "navData"
  | "navCompile"
  | "navMorphology"
  | "navQuery"
  | "navSettings"
  | "appearance"
  | "profile"
  | "security"
  | "projectsTitle"
  | "createProjectTitle";

export async function PendingSection({
  titleKey,
}: {
  titleKey: SectionTitleKey;
}) {
  const t = await getTranslations("Shell");

  return (
    <WorkspacePage title={t(titleKey)}>
      <p className="text-sm text-muted-foreground">{t("sectionPending")}</p>
    </WorkspacePage>
  );
}

export function WorkspaceRouteSkeleton() {
  return (
    <div className="flex h-full min-h-0 flex-col gap-5 p-5 lg:p-8" aria-hidden>
      <div className="flex items-center justify-between gap-4">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-8 w-28" />
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="grid flex-1 gap-4 md:grid-cols-2">
        <Skeleton className="min-h-52 rounded-xl" />
        <Skeleton className="min-h-52 rounded-xl" />
      </div>
    </div>
  );
}
