import type { ObjectType } from "@elmorf/domain";
import {
  Database,
  Layers,
  LayoutDashboard,
  Search,
  Settings,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import type { WorkspaceSection } from "@/lib/workspace-path";

export interface WorkspaceNavItem {
  section: WorkspaceSection;
  labelKey:
    | "navOverview"
    | "navData"
    | "navCompile"
    | "navMorphology"
    | "navQuery";
  icon: LucideIcon;
}

export const workspaceNav: WorkspaceNavItem[] = [
  { section: "overview", labelKey: "navOverview", icon: LayoutDashboard },
  { section: "data", labelKey: "navData", icon: Database },
  { section: "compile", labelKey: "navCompile", icon: Layers },
  { section: "morphology", labelKey: "navMorphology", icon: Waypoints },
  { section: "query", labelKey: "navQuery", icon: Search },
];

export const settingsIcon = Settings;

export const objectTypeLabelKey = {
  company: "objectCompany",
  person: "objectPerson",
  contract: "objectContract",
  invoice: "objectInvoice",
  address: "objectAddress",
  product: "objectProduct",
} as const satisfies Record<
  ObjectType,
  | "objectCompany"
  | "objectPerson"
  | "objectContract"
  | "objectInvoice"
  | "objectAddress"
  | "objectProduct"
>;
