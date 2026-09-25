import {
  ObjectTypeSchema,
  RelationTypeSchema,
  type ObjectType,
  type RelationType,
} from "@elmorf/domain";
import { sectionHref } from "@/lib/workspace-path";

export interface MorphologySearch {
  view: "graph" | "objects" | "relations";
  conflict: boolean;
  object?: string;
  relation?: string;
  type?: ObjectType;
  relationType?: RelationType;
}

export interface MorphologySearchPatch {
  view?: MorphologySearch["view"];
  conflict?: boolean;
  object?: string | null;
  relation?: string | null;
  type?: ObjectType | null;
  relationType?: RelationType | null;
}

function readId(value: string | null): string | undefined {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

export function parseMorphologySearch(params: { get: (key: string) => string | null }): MorphologySearch {
  const viewValue = params.get("view");
  const view = viewValue === "objects" || viewValue === "relations" ? viewValue : "graph";
  const type = ObjectTypeSchema.safeParse(params.get("type"));
  const relationType = RelationTypeSchema.safeParse(params.get("relationType"));
  const objectId = readId(params.get("object"));
  const relationId = readId(params.get("relation"));

  return {
    view,
    conflict: params.get("conflict") === "1",
    ...(objectId ? { object: objectId } : {}),
    ...(relationId ? { relation: relationId } : {}),
    ...(type.success ? { type: type.data } : {}),
    ...(relationType.success ? { relationType: relationType.data } : {}),
  };
}

export function applyMorphologyPatch(
  current: MorphologySearch,
  patch: MorphologySearchPatch,
): MorphologySearch {
  const object = patch.object === undefined ? current.object : patch.object ?? undefined;
  const relation = patch.relation === undefined ? current.relation : patch.relation ?? undefined;
  const type = patch.type === undefined ? current.type : patch.type ?? undefined;
  const relationType =
    patch.relationType === undefined ? current.relationType : patch.relationType ?? undefined;

  return {
    view: patch.view ?? current.view,
    conflict: patch.conflict ?? current.conflict,
    ...(object ? { object } : {}),
    ...(relation ? { relation } : {}),
    ...(type ? { type } : {}),
    ...(relationType ? { relationType } : {}),
  };
}

export function serializeMorphologySearch(search: MorphologySearch): string {
  const params = new URLSearchParams();
  params.set("view", search.view);
  if (search.object) {
    params.set("object", search.object);
  }
  if (search.relation) {
    params.set("relation", search.relation);
  }
  if (search.type) {
    params.set("type", search.type);
  }
  if (search.relationType) {
    params.set("relationType", search.relationType);
  }
  if (search.conflict) {
    params.set("conflict", "1");
  }

  return params.toString();
}

export function morphologyObjectHref(projectId: string, objectId: string): string {
  return `${sectionHref(projectId, "morphology")}?${serializeMorphologySearch({
    view: "graph",
    object: objectId,
    conflict: false,
  })}`;
}
