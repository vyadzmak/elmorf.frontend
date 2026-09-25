export const packageId = "graph" as const;

export {
  createGraphologyGraph,
  matchingEdgeIds,
  matchingNodeIds,
  mergeGraphResponses,
  neighbourhoodIds,
  type CreateGraphOptions,
  type MorphologyEdgeAttributes,
  type MorphologyFilter,
  type MorphologyGraph,
  type MorphologyNodeAttributes,
} from "./adapter";
export { readGraphColors, type GraphColors } from "./colors";
export { applyEdgeVisualState, applyNodeVisualState, type EdgeVisualState, type NodeVisualState } from "./visual";
