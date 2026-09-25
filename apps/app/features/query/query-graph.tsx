"use client";

import type { GraphResponse } from "@elmorf/domain";
import { createGraphologyGraph } from "@elmorf/graph";
import { MorphologyCanvas, type MorphologyCanvasHandle } from "@elmorf/graph/canvas";
import { useTranslations } from "next-intl";
import { useCallback, useMemo, useRef, useState } from "react";

const noIds = new Set<string>();

export function QueryGraph({ graph }: { graph: GraphResponse }) {
  const t = useTranslations("Query");
  const handleRef = useRef<MorphologyCanvasHandle | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const model = useMemo(() => createGraphologyGraph(graph), [graph]);
  const onSelectNode = useCallback((id: string) => {
    setSelectedNodeId(id);
    setSelectedEdgeId(null);
  }, []);
  const onSelectEdge = useCallback((id: string) => {
    setSelectedEdgeId(id);
    setSelectedNodeId(null);
  }, []);
  const onClearSelection = useCallback(() => {
    setSelectedNodeId(null);
    setSelectedEdgeId(null);
  }, []);
  const onLayoutChange = useCallback(() => undefined, []);

  if (model.order === 0) {
    return <p className="text-sm text-muted-foreground">{t("emptyResult")}</p>;
  }

  return (
    <div className="h-72 overflow-hidden rounded-lg border border-border">
      <MorphologyCanvas
        graph={model}
        label={t("graphLabel")}
        selectedNodeId={selectedNodeId}
        selectedEdgeId={selectedEdgeId}
        hiddenNodeIds={noIds}
        hiddenEdgeIds={noIds}
        emphasisedNodeIds={noIds}
        handleRef={handleRef}
        onSelectNode={onSelectNode}
        onSelectEdge={onSelectEdge}
        onClearSelection={onClearSelection}
        onLayoutChange={onLayoutChange}
      />
    </div>
  );
}
