export type SettingsSectionId =
  | "general"
  | "api-keys"
  | "compilation"
  | "integrations"
  | "danger"
  | "appearance"
  | "profile"
  | "security";

export function settingsSectionFromPath(section: string | undefined): SettingsSectionId {
  switch (section) {
    case "api-keys":
    case "compilation":
    case "integrations":
    case "danger":
      return section;
    default:
      return "general";
  }
}
