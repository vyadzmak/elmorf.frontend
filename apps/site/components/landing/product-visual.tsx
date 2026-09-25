export type DemoStep = "load" | "compile" | "get";

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
}

const nodes: GraphNode[] = [
  { id: "company", x: 78, y: 36, label: "Harbor & Pine" },
  { id: "person", x: 168, y: 28, label: "Ada Lang" },
  { id: "contract", x: 118, y: 86, label: "MSA-1842" },
  { id: "invoice", x: 196, y: 92, label: "INV-2041" },
  { id: "address", x: 42, y: 128, label: "Cedar Wharf" },
  { id: "product", x: 150, y: 142, label: "Brass Valve" },
];

const edges: [string, string][] = [
  ["person", "company"],
  ["person", "contract"],
  ["invoice", "contract"],
  ["product", "company"],
  ["company", "address"],
];

function nodeById(id: string): GraphNode {
  const node = nodes.find((item) => item.id === id);
  if (!node) {
    return nodes[0] as GraphNode;
  }
  return node;
}

export function ProductVisual({
  step,
  sourcesLabel,
  sources,
  modelLabel,
  counts,
  awaiting,
  resultLabel,
  result,
}: {
  step: DemoStep;
  sourcesLabel: string;
  sources: string[];
  modelLabel: string;
  counts: string;
  awaiting: string;
  resultLabel: string;
  result: string;
}) {
  return (
    <div className="flex min-h-52 flex-col gap-3 rounded-lg border border-border bg-[var(--elmorf-surface-1)] p-4">
      <p className="text-xs text-muted-foreground">{modelLabel}</p>
      {step === "load" ? (
        <div className="flex flex-col gap-2">
          <p className="text-sm">{sourcesLabel}</p>
          <ul className="flex flex-col gap-1 font-mono text-xs">
            {sources.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
          <p className="text-sm text-muted-foreground">{awaiting}</p>
        </div>
      ) : (
        <svg viewBox="0 0 240 168" className="h-44 w-full" role="img" aria-label={counts}>
          {edges.map(([from, to]) => {
            const start = nodeById(from);
            const end = nodeById(to);
            const selected = step === "get" && (from === "invoice" || to === "invoice");
            return (
              <line
                key={`${from}-${to}`}
                x1={start.x}
                y1={start.y}
                x2={end.x}
                y2={end.y}
                stroke={
                  selected
                    ? "var(--elmorf-graph-edge-selected)"
                    : "var(--elmorf-graph-edge)"
                }
                strokeWidth={selected ? 2 : 1}
              />
            );
          })}
          {nodes.map((node) => {
            const selected = step === "get" && node.id === "invoice";
            return (
              <g key={node.id}>
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={selected ? 7 : 5}
                  fill={
                    selected
                      ? "var(--elmorf-graph-node-selected)"
                      : "var(--elmorf-graph-node)"
                  }
                  stroke={
                    selected
                      ? "var(--elmorf-graph-node-selected)"
                      : "var(--elmorf-graph-node-border)"
                  }
                />
                <text
                  x={node.x + 10}
                  y={node.y + 3}
                  fill="currentColor"
                  fontSize="8"
                  fontFamily="var(--font-geist-mono), ui-monospace, monospace"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {step !== "load" ? <p className="text-sm">{counts}</p> : null}
      {step === "get" ? (
        <p className="text-sm">
          <span className="text-muted-foreground">{resultLabel}</span> {result}
        </p>
      ) : null}
    </div>
  );
}
