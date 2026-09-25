"use client";

import { useEffect, useRef, type RefObject } from "react";
import type Sigma from "sigma";
import type { MorphologyEdgeAttributes, MorphologyGraph, MorphologyNodeAttributes } from "./adapter";
import { readGraphColors, type GraphColors } from "./colors";
import { arrangeGraph } from "./layout";
import { applyEdgeVisualState, applyNodeVisualState } from "./visual";

export interface MorphologyCanvasHandle {
  fit: () => void;
}

export interface MorphologyCanvasProps {
  graph: MorphologyGraph;
  label: string;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hiddenNodeIds: ReadonlySet<string>;
  hiddenEdgeIds: ReadonlySet<string>;
  emphasisedNodeIds: ReadonlySet<string>;
  onSelectNode: (id: string) => void;
  onSelectEdge: (id: string) => void;
  onClearSelection: () => void;
  onLayoutChange: (phase: "arranging" | "ready") => void;
  handleRef: RefObject<MorphologyCanvasHandle | null>;
}

interface VisualState {
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  hiddenNodeIds: ReadonlySet<string>;
  hiddenEdgeIds: ReadonlySet<string>;
  emphasisedNodeIds: ReadonlySet<string>;
}

type CanvasRenderer = Sigma<MorphologyNodeAttributes, MorphologyEdgeAttributes>;

function focusNode(renderer: CanvasRenderer, nodeId: string): void {
  if (!renderer.getGraph().hasNode(nodeId)) {
    return;
  }

  const display = renderer.getNodeDisplayData(nodeId);
  if (!display || renderer.getGraph().order <= 80) {
    return;
  }

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  void renderer.getCamera().animate(
    { x: display.x, y: display.y, ratio: 0.35 },
    { duration: reduced ? 0 : 250 },
  );
}

export function MorphologyCanvas({
  graph,
  label,
  selectedNodeId,
  selectedEdgeId,
  hiddenNodeIds,
  hiddenEdgeIds,
  emphasisedNodeIds,
  onSelectNode,
  onSelectEdge,
  onClearSelection,
  onLayoutChange,
  handleRef,
}: MorphologyCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const visualRef = useRef<VisualState>({
    selectedNodeId,
    selectedEdgeId,
    hiddenNodeIds,
    hiddenEdgeIds,
    emphasisedNodeIds,
  });
  const callbackRef = useRef({ onSelectNode, onSelectEdge, onClearSelection, onLayoutChange });

  useEffect(() => {
    visualRef.current = {
      selectedNodeId,
      selectedEdgeId,
      hiddenNodeIds,
      hiddenEdgeIds,
      emphasisedNodeIds,
    };
    callbackRef.current = { onSelectNode, onSelectEdge, onClearSelection, onLayoutChange };
    rendererRef.current?.refresh();
  }, [
    emphasisedNodeIds,
    hiddenEdgeIds,
    hiddenNodeIds,
    onClearSelection,
    onLayoutChange,
    onSelectEdge,
    onSelectNode,
    selectedEdgeId,
    selectedNodeId,
  ]);

  useEffect(() => {
    handleRef.current = {
      fit() {
        const renderer = rendererRef.current;
        if (!renderer) {
          return;
        }

        void renderer.getCamera().animatedReset({ duration: 200 });
      },
    };

    return () => {
      handleRef.current = null;
    };
  }, [handleRef]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const abort = new AbortController();
    let renderer: CanvasRenderer | null = null;
    let pulse = 0;
    let resize: ResizeObserver | null = null;
    let theme: MutationObserver | null = null;
    let cancelled = false;
    const colorsRef: { current: GraphColors } = { current: readGraphColors() };

    void import("sigma").then(({ default: SigmaRenderer }) => {
      if (cancelled) {
        return;
      }

      const font = window.getComputedStyle(document.body).fontFamily || "sans-serif";
      const created = new SigmaRenderer(graph, container, {
        allowInvalidContainer: true,
        enableEdgeEvents: true,
        renderEdgeLabels: false,
        hideEdgesOnMove: graph.order > 80,
        labelRenderedSizeThreshold: graph.order > 80 ? 8 : 0,
        labelSize: 13,
        stagePadding: 48,
        zIndex: true,
        labelFont: font,
        labelColor: { color: colorsRef.current.label },
        defaultNodeColor: colorsRef.current.node,
        defaultEdgeColor: colorsRef.current.edge,
        nodeReducer: (node, data) => {
          const visual = visualRef.current;
          const state = applyNodeVisualState({
            hasSelection: visual.selectedNodeId !== null || visual.selectedEdgeId !== null,
            selected: node === visual.selectedNodeId,
            neighbour: visual.emphasisedNodeIds.has(node) && node !== visual.selectedNodeId,
            hidden: visual.hiddenNodeIds.has(node),
            conflict: data.conflictCount > 0,
            colors: colorsRef.current,
          });
          return {
            ...data,
            color: state.color,
            size: state.size,
            hidden: state.hidden,
            forceLabel: state.forceLabel,
            zIndex: state.zIndex,
            label: state.showLabel ? data.label : null,
          };
        },
        edgeReducer: (edge, data) => {
          const visual = visualRef.current;
          const source = graph.source(edge);
          const target = graph.target(edge);
          const state = applyEdgeVisualState({
            hasSelection: visual.selectedNodeId !== null || visual.selectedEdgeId !== null,
            selected: edge === visual.selectedEdgeId,
            incident:
              visual.selectedNodeId !== null &&
              (source === visual.selectedNodeId || target === visual.selectedNodeId),
            hidden: visual.hiddenEdgeIds.has(edge),
            colors: colorsRef.current,
          });
          return {
            ...data,
            color: state.color,
            size: state.size,
            hidden: state.hidden,
          };
        },
      });
      renderer = created;
      rendererRef.current = created;
      created.on("clickNode", ({ node }) => {
        callbackRef.current.onSelectNode(node);
      });
      created.on("clickEdge", ({ edge }) => {
        callbackRef.current.onSelectEdge(edge);
      });
      created.on("clickStage", () => {
        callbackRef.current.onClearSelection();
      });

      resize = new ResizeObserver(() => {
        created.resize();
        created.refresh();
      });
      resize.observe(container);

      theme = new MutationObserver(() => {
        colorsRef.current = readGraphColors();
        created.setSetting("labelColor", { color: colorsRef.current.label });
        created.setSetting("defaultNodeColor", colorsRef.current.node);
        created.setSetting("defaultEdgeColor", colorsRef.current.edge);
        created.refresh();
      });
      theme.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "style"],
      });

      if (graph.order > 80) {
        callbackRef.current.onLayoutChange("arranging");
        pulse = window.setInterval(() => {
          created.refresh();
        }, 120);
      }

      void arrangeGraph(graph, abort.signal).finally(() => {
        if (cancelled) {
          return;
        }

        window.clearInterval(pulse);
        created.refresh();
        callbackRef.current.onLayoutChange("ready");
        const selected = visualRef.current.selectedNodeId;
        if (selected && graph.order > 80) {
          focusNode(created, selected);
          return;
        }

        void created.getCamera().animatedReset({ duration: 200 });
      });
    });

    return () => {
      cancelled = true;
      abort.abort();
      window.clearInterval(pulse);
      resize?.disconnect();
      theme?.disconnect();
      renderer?.kill();
      rendererRef.current = null;
    };
  }, [graph]);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!renderer || !selectedNodeId) {
      return;
    }

    focusNode(renderer, selectedNodeId);
  }, [graph, selectedNodeId]);

  return <div ref={containerRef} role="img" aria-label={label} className="h-full w-full bg-background" />;
}
