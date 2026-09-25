export interface GraphColors {
  node: string;
  nodeBorder: string;
  nodeMuted: string;
  nodeSelected: string;
  edge: string;
  edgeMuted: string;
  edgeSelected: string;
  dimmed: string;
  label: string;
  conflict: string;
  types: Record<string, string>;
}

const fallbackColors: GraphColors = {
  node: "#1d2125",
  nodeBorder: "#3a4148",
  nodeMuted: "#24282d",
  nodeSelected: "#c89b45",
  edge: "#343a40",
  edgeMuted: "#24282d",
  edgeSelected: "#c89b45",
  dimmed: "#24282d",
  label: "#e8e6e3",
  conflict: "#b85c4a",
  types: {
    company: "#a9823e",
    person: "#8ea0ab",
    contract: "#a398b0",
    invoice: "#c4a094",
    address: "#8eaaa4",
    product: "#a6a19a",
  },
};

function readToken(style: CSSStyleDeclaration, token: string, fallback: string): string {
  const value = style.getPropertyValue(token).trim();
  return value.length > 0 ? value : fallback;
}

export function readGraphColors(): GraphColors {
  if (typeof window === "undefined") {
    return fallbackColors;
  }

  const style = window.getComputedStyle(document.documentElement);
  return {
    node: readToken(style, "--elmorf-graph-node", fallbackColors.node),
    nodeBorder: readToken(style, "--elmorf-graph-node-border", fallbackColors.nodeBorder),
    nodeMuted: readToken(style, "--elmorf-graph-node-muted", fallbackColors.nodeMuted),
    nodeSelected: readToken(style, "--elmorf-graph-node-selected", fallbackColors.nodeSelected),
    edge: readToken(style, "--elmorf-graph-edge", fallbackColors.edge),
    edgeMuted: readToken(style, "--elmorf-graph-edge-muted", fallbackColors.edgeMuted),
    edgeSelected: readToken(style, "--elmorf-graph-edge-selected", fallbackColors.edgeSelected),
    dimmed: readToken(style, "--elmorf-graph-dimmed", fallbackColors.dimmed),
    label: readToken(style, "--foreground", fallbackColors.label),
    conflict: readToken(style, "--destructive", fallbackColors.conflict),
    types: {
      company: readToken(style, "--elmorf-type-company", fallbackColors.types.company ?? "#a9823e"),
      person: readToken(style, "--elmorf-type-person", fallbackColors.types.person ?? "#8ea0ab"),
      contract: readToken(style, "--elmorf-type-contract", fallbackColors.types.contract ?? "#a398b0"),
      invoice: readToken(style, "--elmorf-type-invoice", fallbackColors.types.invoice ?? "#c4a094"),
      address: readToken(style, "--elmorf-type-address", fallbackColors.types.address ?? "#8eaaa4"),
      product: readToken(style, "--elmorf-type-product", fallbackColors.types.product ?? "#a6a19a"),
    },
  };
}
