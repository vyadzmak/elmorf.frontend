import { getTranslations } from "next-intl/server";
import { WorkspacePage } from "@/components/shell/workspace-page";
import { AppearanceSettings } from "@/features/settings/appearance-settings";
import { SettingsFrame } from "@/features/settings/settings-frame";
import { SettingsSection } from "@/features/settings/settings-section";

export default async function AppearancePage() {
  const shell = await getTranslations("Shell");
  const settings = await getTranslations("Settings");

  return (
    <WorkspacePage title={shell("navSettings")}>
      <SettingsFrame active="appearance">
        <SettingsSection title={settings("appearanceTitle")} description={settings("appearanceDescription")}>
          <AppearanceSettings />
        </SettingsSection>
      </SettingsFrame>
    </WorkspacePage>
  );
}
