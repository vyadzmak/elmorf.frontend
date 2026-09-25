import type { GraphColors } from "./colors";

export interface NodeVisualState {
  color: string;
  size: number;
  hidden: boolean;
  forceLabel: boolean;
  zIndex: number;
  showLabel: boolean;
}

export interface EdgeVisualState {
  color: string;
  size: number;
  hidden: boolean;
}

export function applyNodeVisualState(input: {
  hasSelection: boolean;
  selected: boolean;
  neighbour: boolean;
  hidden: boolean;
  conflict: boolean;
  colors: GraphColors;
  typeColor?: string;
  degree?: number;
}): NodeVisualState {
  if (input.hidden) {
    return {
      color: input.colors.dimmed,
      size: 5,
      hidden: true,
      forceLabel: false,
      zIndex: 0,
      showLabel: false,
    };
  }

  if (input.selected) {
    return {
      color: input.colors.nodeSelected,
      size: 16,
      hidden: false,
      forceLabel: true,
      zIndex: 2,
      showLabel: true,
    };
  }

  const typeColor = input.typeColor ?? input.colors.nodeBorder;
  const resting = 9 + Math.min(input.degree ?? 1, 5);

  if (input.neighbour) {
    return {
      color: input.conflict ? input.colors.conflict : typeColor,
      size: 12,
      hidden: false,
      forceLabel: false,
      zIndex: 1,
      showLabel: true,
    };
  }

  if (input.hasSelection) {
    return {
      color: input.colors.dimmed,
      size: 7,
      hidden: false,
      forceLabel: false,
      zIndex: 0,
      showLabel: false,
    };
  }

  return {
    color: input.conflict ? input.colors.conflict : typeColor,
    size: resting,
    hidden: false,
    forceLabel: false,
    zIndex: 0,
    showLabel: true,
  };
}

export function applyEdgeVisualState(input: {
  hasSelection: boolean;
  selected: boolean;
  incident: boolean;
  hidden: boolean;
  colors: GraphColors;
}): EdgeVisualState {
  if (input.hidden) {
    return { color: input.colors.dimmed, size: 0.4, hidden: true };
  }

  if (input.selected) {
    return { color: input.colors.edgeSelected, size: 2.4, hidden: false };
  }

  if (input.incident) {
    return { color: input.colors.edge, size: 2, hidden: false };
  }

  if (input.hasSelection) {
    return { color: input.colors.edgeMuted, size: 0.6, hidden: false };
  }

  return { color: input.colors.edge, size: 1, hidden: false };
}
