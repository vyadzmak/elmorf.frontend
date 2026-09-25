"use client";

import type { GraphResponse } from "@elmorf/domain";
import { createGraphologyGraph } from "@elmorf/graph";
import { MorphologyCanvas, type MorphologyCanvasHandle } from "@elmorf/graph/canvas";
import { useCallback, useMemo, useRef } from "react";

const hiddenIds = new Set<string>();

export function TryGraph({
  graph,
  label,
  selectedNodeId,
  onSelectNode,
}: {
  graph: GraphResponse;
  label: string;
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}) {
  const handleRef = useRef<MorphologyCanvasHandle | null>(null);
  const model = useMemo(() => createGraphologyGraph(graph), [graph]);
  const onSelectEdge = useCallback(() => undefined, []);
  const onClearSelection = useCallback(() => undefined, []);
  const onLayoutChange = useCallback(() => undefined, []);

  if (model.order === 0) {
    return null;
  }

  return (
    <div className="h-80 overflow-hidden rounded-lg border border-border">
      <MorphologyCanvas
        graph={model}
        label={label}
        selectedNodeId={selectedNodeId}
        selectedEdgeId={null}
        hiddenNodeIds={hiddenIds}
        hiddenEdgeIds={hiddenIds}
        emphasisedNodeIds={hiddenIds}
        handleRef={handleRef}
        onSelectNode={onSelectNode}
        onSelectEdge={onSelectEdge}
        onClearSelection={onClearSelection}
        onLayoutChange={onLayoutChange}
      />
    </div>
  );
}
