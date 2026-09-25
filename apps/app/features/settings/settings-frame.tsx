import { SettingsNav, type SettingsSectionId } from "@/features/settings/settings-nav";

export function SettingsFrame({
  active,
  children,
}: {
  active: SettingsSectionId;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-8 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <SettingsNav active={active} />
      <div className="min-w-0 max-w-2xl">{children}</div>
    </div>
  );
}
