import { getTranslations } from "next-intl/server";
import { WorkspacePage } from "@/components/shell/workspace-page";
import { SecuritySettings } from "@/features/settings/account-settings";
import { SettingsFrame } from "@/features/settings/settings-frame";

export default async function SecurityPage() {
  const shell = await getTranslations("Shell");

  return (
    <WorkspacePage title={shell("navSettings")}>
      <SettingsFrame active="security">
        <SecuritySettings />
      </SettingsFrame>
    </WorkspacePage>
  );
}
