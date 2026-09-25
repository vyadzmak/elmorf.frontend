import { SettingsNav, type SettingsSectionId } from "@/features/settings/settings-nav";

export function SettingsFrame({
  active,
  children,
}: {
  active: SettingsSectionId;
  children: React.ReactNode;
}) {
  return (
    <div className="grid items-start gap-6 md:grid-cols-[12.5rem_minmax(0,1fr)]">
      <SettingsNav active={active} />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
