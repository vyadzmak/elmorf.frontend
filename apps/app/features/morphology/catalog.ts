import type { CompiledObject, GraphResponse, Relation } from "@elmorf/domain";

export function catalogResponse(
  objects: CompiledObject[],
  relations: Relation[],
  modelVersion: string,
): GraphResponse {
  return {
    modelVersion,
    nodes: objects.map((object) => ({
      id: object.id,
      type: object.type,
      label: object.label,
      conflictCount: object.conflictCount,
      ...(object.confidence === undefined ? {} : { confidence: object.confidence }),
    })),
    edges: relations.map((relation) => ({
      id: relation.id,
      source: relation.sourceObjectId,
      target: relation.targetObjectId,
      type: relation.type,
      directed: relation.directed,
      ...(relation.confidence === undefined ? {} : { confidence: relation.confidence }),
    })),
    meta: {
      totalNodes: objects.length,
      totalEdges: relations.length,
      truncated: false,
    },
  };
}
