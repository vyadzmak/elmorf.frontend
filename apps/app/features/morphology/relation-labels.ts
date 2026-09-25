import type { RelationType } from "@elmorf/domain";

export const relationTypes = [
  "SIGNED",
  "WORKS_FOR",
  "BELONGS_TO",
  "SUPPLIES",
  "LOCATED_AT",
] as const satisfies readonly RelationType[];

export const relationTypeLabelKey = {
  SIGNED: "relationSigned",
  WORKS_FOR: "relationWorksFor",
  BELONGS_TO: "relationBelongsTo",
  SUPPLIES: "relationSupplies",
  LOCATED_AT: "relationLocatedAt",
} as const satisfies Record<
  RelationType,
  | "relationSigned"
  | "relationWorksFor"
  | "relationBelongsTo"
  | "relationSupplies"
  | "relationLocatedAt"
>;
