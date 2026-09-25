import { cn } from "@elmorf/ui/lib/utils";

export type DemoStep = "load" | "compile" | "get";

interface GraphNode {
  id: string;
  x: number;
  y: number;
  label: string;
  type: "company" | "person" | "contract" | "invoice" | "address" | "product";
}

const nodes: GraphNode[] = [
  { id: "company", x: 250, y: 118, label: "Harbor & Pine Supplies", type: "company" },
  { id: "person", x: 120, y: 48, label: "Ada Lang", type: "person" },
  { id: "contract", x: 250, y: 48, label: "MSA-1842", type: "contract" },
  { id: "invoice", x: 380, y: 48, label: "INV-2041", type: "invoice" },
  { id: "address", x: 120, y: 188, label: "18 Cedar Wharf", type: "address" },
  { id: "product", x: 380, y: 188, label: "Brass Valve 12mm", type: "product" },
];

const edges: [string, string, string][] = [
  ["person", "company", "WORKS_FOR"],
  ["person", "contract", "SIGNED"],
  ["contract", "company", "BELONGS_TO"],
  ["invoice", "contract", "BELONGS_TO"],
  ["company", "product", "SUPPLIES"],
  ["company", "address", "LOCATED_AT"],
];

const typeVar: Record<GraphNode["type"], string> = {
  company: "var(--elmorf-type-company)",
  person: "var(--elmorf-type-person)",
  contract: "var(--elmorf-type-contract)",
  invoice: "var(--elmorf-type-invoice)",
  address: "var(--elmorf-type-address)",
  product: "var(--elmorf-type-product)",
};

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
  sourceRoles,
  modelLabel,
  counts,
  awaiting,
  resultLabel,
  result,
  fictional,
  className,
}: {
  step: DemoStep;
  sourcesLabel: string;
  sources: string[];
  sourceRoles: string[];
  modelLabel: string;
  counts: string;
  awaiting: string;
  resultLabel: string;
  result: string;
  fictional?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-72 flex-col gap-3 rounded-xl border border-border bg-[var(--elmorf-surface-1)] p-4",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">{modelLabel}</p>
        {step === "load" ? (
          <p className="text-xs text-muted-foreground">{awaiting}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{counts}</p>
        )}
      </div>
      {step === "load" ? (
        <ul className="flex flex-1 flex-col gap-2">
          {sources.map((name, index) => (
            <li key={name} className="flex items-baseline justify-between gap-3 text-sm">
              <span className="truncate font-mono text-xs">{name}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {sourceRoles[index] ?? ""}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <svg
          viewBox="0 0 500 240"
          className="h-full min-h-52 w-full flex-1 overflow-visible"
          role="img"
          aria-label={counts}
        >
          {edges.map(([from, to, relation]) => {
            const start = nodeById(from);
            const end = nodeById(to);
            const selected = step === "get" && (from === "invoice" || to === "invoice");
            const midX = (start.x + end.x) / 2;
            const midY = (start.y + end.y) / 2;
            const dx = end.x - start.x;
            const dy = end.y - start.y;
            const length = Math.hypot(dx, dy) || 1;
            const labelX = midX + (-dy / length) * 12;
            const labelY = midY + (dx / length) * 12;
            return (
              <g key={`${from}-${to}`}>
                <line
                  x1={start.x}
                  y1={start.y}
                  x2={end.x}
                  y2={end.y}
                  stroke={
                    selected
                      ? "var(--elmorf-graph-edge-selected)"
                      : "var(--elmorf-graph-edge)"
                  }
                  strokeWidth={selected ? 2 : 1.25}
                />
                <text
                  x={labelX}
                  y={labelY}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="8.5"
                  opacity="0.75"
                >
                  {relation}
                </text>
              </g>
            );
          })}
          {nodes.map((node) => {
            const selected = step === "get" && node.id === "invoice";
            const fill = selected ? "var(--elmorf-graph-node-selected)" : typeVar[node.type];
            return (
              <g key={node.id}>
                {selected ? (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="15"
                    fill="none"
                    stroke="var(--elmorf-graph-node-selected)"
                    strokeWidth="1"
                    opacity="0.45"
                  />
                ) : null}
                <circle cx={node.x} cy={node.y} r={selected ? 10 : 7} fill={fill} />
                <text
                  x={node.x}
                  y={node.y + 20}
                  textAnchor="middle"
                  fill="currentColor"
                  fontSize="11.5"
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      )}
      {step === "get" ? (
        <p className="text-sm">
          <span className="text-muted-foreground">{resultLabel}</span> {result}
        </p>
      ) : null}
      {fictional ? <p className="text-xs text-muted-foreground">{fictional}</p> : null}
    </div>
  );
}
