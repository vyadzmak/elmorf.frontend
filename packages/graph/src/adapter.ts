import type { GraphResponse } from "@elmorf/domain";
import Graph from "graphology";
import circular from "graphology-layout/circular";

export interface MorphologyNodeAttributes {
  x: number;
  y: number;
  size: number;
  label: string;
  color: string;
  type: string;
  objectType: string;
  conflictCount: number;
  confidence?: number;
}

export interface MorphologyEdgeAttributes {
  size: number;
  label: string;
  color: string;
  type: string;
  relationType: string;
  directed: boolean;
  confidence?: number;
}

export type MorphologyGraph = Graph<MorphologyNodeAttributes, MorphologyEdgeAttributes>;

export interface MorphologyFilter {
  objectType?: string;
  relationType?: string;
  conflictsOnly: boolean;
}

export interface CreateGraphOptions {
  layout?: boolean;
}

export function createGraphologyGraph(
  dto: GraphResponse,
  options?: CreateGraphOptions,
): MorphologyGraph {
  const graph = new Graph<MorphologyNodeAttributes, MorphologyEdgeAttributes>({
    type: "directed",
    multi: false,
  });

  for (const node of dto.nodes) {
    if (graph.hasNode(node.id)) {
      continue;
    }

    graph.addNode(node.id, {
      x: 0,
      y: 0,
      size: 6,
      label: node.label,
      color: "#1d2125",
      type: "circle",
      objectType: node.type,
      conflictCount: node.conflictCount ?? 0,
      ...(node.confidence === undefined ? {} : { confidence: node.confidence }),
    });
  }

  for (const edge of dto.edges) {
    if (graph.hasEdge(edge.id) || !graph.hasNode(edge.source) || !graph.hasNode(edge.target)) {
      continue;
    }

    graph.addDirectedEdgeWithKey(edge.id, edge.source, edge.target, {
      size: 1,
      label: edge.type,
      color: "#343a40",
      type: edge.directed ? "arrow" : "line",
      relationType: edge.type,
      directed: edge.directed,
      ...(edge.confidence === undefined ? {} : { confidence: edge.confidence }),
    });
  }

  if (options?.layout !== false && graph.order > 0) {
    circular.assign(graph);
  }

  return graph;
}

export function matchingNodeIds(graph: MorphologyGraph, filter: MorphologyFilter): Set<string> {
  const ids = new Set<string>();
  graph.forEachNode((id, attributes) => {
    if (filter.objectType && attributes.objectType !== filter.objectType) {
      return;
    }

    if (filter.conflictsOnly && attributes.conflictCount < 1) {
      return;
    }

    ids.add(id);
  });

  if (!filter.relationType) {
    return ids;
  }

  const incident = new Set<string>();
  graph.forEachEdge((_edgeId, attributes, source, target) => {
    if (attributes.relationType !== filter.relationType) {
      return;
    }

    if (!ids.has(source) || !ids.has(target)) {
      return;
    }

    incident.add(source);
    incident.add(target);
  });

  return incident;
}

export function matchingEdgeIds(
  graph: MorphologyGraph,
  filter: MorphologyFilter,
  nodes: ReadonlySet<string>,
): Set<string> {
  const ids = new Set<string>();
  graph.forEachEdge((id, attributes, source, target) => {
    if (!nodes.has(source) || !nodes.has(target)) {
      return;
    }

    if (filter.relationType && attributes.relationType !== filter.relationType) {
      return;
    }

    ids.add(id);
  });

  return ids;
}

export function neighbourhoodIds(
  graph: MorphologyGraph,
  nodeId: string,
  edges: ReadonlySet<string>,
): Set<string> {
  if (!graph.hasNode(nodeId)) {
    return new Set();
  }

  const ids = new Set<string>([nodeId]);
  graph.forEachEdge(nodeId, (edgeId, _attributes, source, target) => {
    if (!edges.has(edgeId)) {
      return;
    }

    ids.add(source);
    ids.add(target);
  });

  return ids;
}

export function mergeGraphResponses(base: GraphResponse, extra: GraphResponse): GraphResponse {
  const nodes = new Map(base.nodes.map((node) => [node.id, node]));
  for (const node of extra.nodes) {
    nodes.set(node.id, node);
  }

  const edges = new Map(base.edges.map((edge) => [edge.id, edge]));
  for (const edge of extra.edges) {
    edges.set(edge.id, edge);
  }

  return {
    modelVersion: base.modelVersion,
    nodes: [...nodes.values()],
    edges: [...edges.values()],
    meta: base.meta,
  };
}
