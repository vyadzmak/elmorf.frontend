import type { GraphResponse } from "@elmorf/domain";
import { describe, expect, it } from "vitest";
import {
  createGraphologyGraph,
  matchingEdgeIds,
  matchingNodeIds,
  mergeGraphResponses,
  neighbourhoodIds,
} from "./adapter";
import type { GraphColors } from "./colors";
import { applyEdgeVisualState, applyNodeVisualState } from "./visual";

const colors: GraphColors = {
  node: "#111111",
  nodeBorder: "#333333",
  nodeMuted: "#222222",
  nodeSelected: "#c89b45",
  edge: "#333333",
  edgeMuted: "#444444",
  edgeSelected: "#9a6f23",
  dimmed: "#555555",
  label: "#eeeeee",
  conflict: "#a94f40",
  types: {},
};

function sample(): GraphResponse {
  return {
    modelVersion: "v7",
    nodes: [
      { id: "a", type: "person", label: "Ada", conflictCount: 0 },
      { id: "b", type: "company", label: "Harbor", conflictCount: 1 },
      { id: "c", type: "product", label: "Valve", conflictCount: 0 },
      { id: "d", type: "address", label: "Wharf", conflictCount: 0 },
    ],
    edges: [
      { id: "e1", source: "a", target: "b", type: "WORKS_FOR", directed: true },
      { id: "e2", source: "b", target: "c", type: "SUPPLIES", directed: true },
      { id: "missing", source: "a", target: "gone", type: "SIGNED", directed: true },
    ],
    meta: { totalNodes: 4, totalEdges: 3, truncated: false },
  };
}

describe("graph adapter", () => {
  it("places nodes and drops edges whose endpoints are missing", () => {
    const graph = createGraphologyGraph(sample(), { layout: false });
    expect(graph.order).toBe(4);
    expect(graph.hasEdge("e1")).toBe(true);
    expect(graph.hasEdge("missing")).toBe(false);
    expect(graph.getNodeAttribute("a", "x")).toBe(0);
  });

  it("filters by object type, relation type, and conflicts", () => {
    const graph = createGraphologyGraph(sample(), { layout: false });
    expect(
      matchingNodeIds(graph, { objectType: "person", conflictsOnly: false }),
    ).toEqual(new Set(["a"]));
    expect(matchingNodeIds(graph, { conflictsOnly: true })).toEqual(new Set(["b"]));

    const people = matchingNodeIds(graph, { relationType: "SUPPLIES", conflictsOnly: false });
    expect(people).toEqual(new Set(["b", "c"]));
    expect(matchingEdgeIds(graph, { relationType: "SUPPLIES", conflictsOnly: false }, people)).toEqual(
      new Set(["e2"]),
    );
  });

  it("keeps the selected node and its visible neighbours", () => {
    const graph = createGraphologyGraph(sample(), { layout: false });
    const edges = matchingEdgeIds(graph, { conflictsOnly: false }, matchingNodeIds(graph, { conflictsOnly: false }));
    expect(neighbourhoodIds(graph, "b", edges)).toEqual(new Set(["a", "b", "c"]));
    expect(neighbourhoodIds(graph, "missing", edges)).toEqual(new Set());
  });

  it("merges a neighbourhood without dropping the truncation flag", () => {
    const base = sample();
    const extra: GraphResponse = {
      ...base,
      nodes: [{ id: "e", type: "invoice", label: "INV", conflictCount: 0 }],
      edges: [{ id: "e3", source: "e", target: "b", type: "BELONGS_TO", directed: true }],
      meta: { totalNodes: 9, totalEdges: 9, truncated: false },
    };
    const merged = mergeGraphResponses({ ...base, meta: { ...base.meta, truncated: true } }, extra);
    expect(merged.nodes.map((node) => node.id)).toContain("e");
    expect(merged.edges.map((edge) => edge.id)).toContain("e3");
    expect(merged.meta.truncated).toBe(true);
    expect(merged.meta.totalNodes).toBe(4);
  });

  it("fades unrelated nodes and keeps a conflict visible until it is selected", () => {
    const resting = applyNodeVisualState({
      hasSelection: false,
      selected: false,
      neighbour: false,
      hidden: false,
      conflict: true,
      colors,
    });
    expect(resting.color).toBe(colors.conflict);
    expect(resting.hidden).toBe(false);

    const faded = applyNodeVisualState({
      hasSelection: true,
      selected: false,
      neighbour: false,
      hidden: false,
      conflict: false,
      colors,
    });
    expect(faded.color).toBe(colors.dimmed);
    expect(faded.showLabel).toBe(false);
    expect(faded.hidden).toBe(false);

    const selected = applyNodeVisualState({
      hasSelection: true,
      selected: true,
      neighbour: false,
      hidden: false,
      conflict: true,
      colors,
    });
    expect(selected.color).toBe(colors.nodeSelected);
    expect(selected.forceLabel).toBe(true);

    const edge = applyEdgeVisualState({
      hasSelection: true,
      selected: false,
      incident: false,
      hidden: false,
      colors,
    });
    expect(edge.hidden).toBe(false);
    expect(edge.color).toBe(colors.edgeMuted);
  });
});
