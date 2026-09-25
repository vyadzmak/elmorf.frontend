import { GraphResponseSchema, type GraphResponse } from "@elmorf/domain";
import type { MockDataset } from "./dataset";

export const GRAPH_RENDER_CAP = 160;

export function toGraphResponse(dataset: MockDataset, focusId?: string | null): GraphResponse {
  const model = dataset.models[0];
  const nodes = dataset.objects.map((object) => ({
    id: object.id,
    type: object.type,
    label: object.label,
    ...(object.confidence === undefined
      ? {}
      : { confidence: object.confidence }),
    conflictCount: object.conflictCount,
  }));
  const edges = dataset.relations.map((relation) => ({
    id: relation.id,
    source: relation.sourceObjectId,
    target: relation.targetObjectId,
    type: relation.type,
    directed: relation.directed,
    ...(relation.confidence === undefined
      ? {}
      : { confidence: relation.confidence }),
  }));

  let renderedNodes = nodes;
  let renderedEdges = edges;
  let truncated = false;

  if (nodes.length > GRAPH_RENDER_CAP) {
    truncated = true;
    const kept = new Set(nodes.slice(0, GRAPH_RENDER_CAP).map((node) => node.id));
    if (focusId && nodes.some((node) => node.id === focusId)) {
      kept.add(focusId);
      for (const edge of edges) {
        if (edge.source === focusId) {
          kept.add(edge.target);
        }
        if (edge.target === focusId) {
          kept.add(edge.source);
        }
      }
    }

    renderedNodes = nodes.filter((node) => kept.has(node.id));
    renderedEdges = edges.filter((edge) => kept.has(edge.source) && kept.has(edge.target));
  }

  return GraphResponseSchema.parse({
    modelVersion: model?.version ?? "none",
    nodes: renderedNodes,
    edges: renderedEdges,
    meta: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      truncated,
    },
  });
}
