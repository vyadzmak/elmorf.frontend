"use client";

import {
  MorphologyCanvas,
  type MorphologyCanvasHandle,
} from "@elmorf/graph/canvas";
import type { MorphologyGraph } from "@elmorf/graph";
import { Button } from "@elmorf/ui/components/ui/button";
import { useTranslations } from "next-intl";
import type { RefObject } from "react";

export function MorphologyGraphView({
  graph,
  truncated,
  shown,
  total,
  selectedNodeId,
  selectedEdgeId,
  hiddenNodeIds,
  hiddenEdgeIds,
  emphasisedNodeIds,
  handleRef,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
  onLayoutChange,
  emptyMessage,
}: {
  graph: MorphologyGraph;
  truncated: boolean;
  shown: number;
  total: number;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hiddenNodeIds: ReadonlySet<string>;
  hiddenEdgeIds: ReadonlySet<string>;
  emphasisedNodeIds: ReadonlySet<string>;
  handleRef: RefObject<MorphologyCanvasHandle | null>;
  onSelectNode: (id: string) => void;
  onSelectEdge: (id: string) => void;
  onClearSelection: () => void;
  onLayoutChange: (phase: "arranging" | "ready") => void;
  emptyMessage?: string;
}) {
  const t = useTranslations("Morphology");

  return (
    <div className="relative h-full min-h-0">
      {truncated ? (
        <p
          role="status"
          className="pointer-events-none absolute start-3 top-3 z-10 max-w-sm rounded-md bg-background/90 px-3 py-2 text-xs text-muted-foreground"
        >
          {t("truncated", { shown, total })}
        </p>
      ) : null}
      {emptyMessage ? (
        <p className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center px-6 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : null}
      <div className="absolute inset-x-3 bottom-3 z-10 flex items-center justify-between gap-3">
        <p className="rounded-md bg-background/90 px-2 py-1 text-xs text-muted-foreground">
          {t("canvasNodes", { count: shown })}
        </p>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="outline" onClick={() => handleRef.current?.zoom(0.8)}>
            {t("zoomIn")}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => handleRef.current?.zoom(1.25)}>
            {t("zoomOut")}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => handleRef.current?.fit()}>
            {t("fit")}
          </Button>
        </div>
      </div>
      <MorphologyCanvas
        graph={graph}
        label={t("graphLabel")}
        selectedNodeId={selectedNodeId}
        selectedEdgeId={selectedEdgeId}
        hiddenNodeIds={hiddenNodeIds}
        hiddenEdgeIds={hiddenEdgeIds}
        emphasisedNodeIds={emphasisedNodeIds}
        handleRef={handleRef}
        onSelectNode={onSelectNode}
        onSelectEdge={onSelectEdge}
        onClearSelection={onClearSelection}
        onLayoutChange={onLayoutChange}
      />
    </div>
  );
}
