import { getTranslations } from "next-intl/server";
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
