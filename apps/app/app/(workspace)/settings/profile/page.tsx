import { getTranslations } from "next-intl/server";
import { Suspense } from "react";
import { WorkspaceRouteSkeleton } from "@/components/shell/pending-section";
import { WorkspacePage } from "@/components/shell/workspace-page";
import { ProfileSettings } from "@/features/settings/account-settings";
import { SettingsFrame } from "@/features/settings/settings-frame";

export default async function ProfilePage() {
  const shell = await getTranslations("Shell");

  return (
    <WorkspacePage title={shell("navSettings")}>
      <SettingsFrame active="profile">
        <Suspense fallback={<WorkspaceRouteSkeleton />}>
          <ProfileSettings />
        </Suspense>
      </SettingsFrame>
    </WorkspacePage>
  );
}
