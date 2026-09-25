"use client";

import {
  morphologyGraphOptions,
  morphologyObjectsOptions,
  morphologyRelationsOptions,
} from "@elmorf/api-client";
import {
  createGraphologyGraph,
  matchingEdgeIds,
  matchingNodeIds,
  mergeGraphResponses,
  neighbourhoodIds,
  type MorphologyFilter,
} from "@elmorf/graph";
import type { MorphologyCanvasHandle } from "@elmorf/graph/canvas";
import { Skeleton } from "@elmorf/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { useShell } from "@/components/shell/shell-context";
import { catalogResponse } from "@/features/morphology/catalog";
import { MorphologyGraphView } from "@/features/morphology/morphology-graph-view";
import { MorphologyObjectsView } from "@/features/morphology/morphology-objects-view";
import { MorphologyRelationsView } from "@/features/morphology/morphology-relations-view";
import { MorphologyToolbar } from "@/features/morphology/morphology-toolbar";
import { ObjectInspector } from "@/features/morphology/object-inspector";
import { RelationInspector } from "@/features/morphology/relation-inspector";
import { relationTypeLabelKey } from "@/features/morphology/relation-labels";
import { useMorphologyParams } from "@/features/morphology/use-morphology-params";
import { useApiClient } from "@/lib/use-api";

export function MorphologyWorkbench({ projectId }: { projectId: string }) {
  const t = useTranslations("Morphology");
  const shell = useTranslations("Shell");
  const { search, commit } = useMorphologyParams();
  const { commandOpen, openInspector, closeInspector } = useShell();
  const ready = useMockReady();
  const api = useApiClient();
  const objectsQuery = useQuery({
    ...morphologyObjectsOptions(api, projectId),
    enabled: ready,
  });
  const relationsQuery = useQuery({
    ...morphologyRelationsOptions(api, projectId),
    enabled: ready,
  });
  const graphQuery = useQuery({
    ...morphologyGraphOptions(api, projectId),
    enabled: ready,
  });
  const [layoutPhase, setLayoutPhase] = useState<"arranging" | "ready">("ready");
  const canvasHandle = useRef<MorphologyCanvasHandle | null>(null);
  const ownsInspector = useRef(false);
  const filter = useMemo<MorphologyFilter>(
    () => ({
      conflictsOnly: search.conflict,
      ...(search.type ? { objectType: search.type } : {}),
      ...(search.relationType ? { relationType: search.relationType } : {}),
    }),
    [search.conflict, search.relationType, search.type],
  );
  const catalog = useMemo(() => {
    if (!objectsQuery.data || !relationsQuery.data) {
      return null;
    }

    return createGraphologyGraph(
      catalogResponse(
        objectsQuery.data,
        relationsQuery.data,
        graphQuery.data?.modelVersion ?? "none",
      ),
      { layout: false },
    );
  }, [graphQuery.data?.modelVersion, objectsQuery.data, relationsQuery.data]);
  const visibleNodes = useMemo(
    () => (catalog ? matchingNodeIds(catalog, filter) : new Set<string>()),
    [catalog, filter],
  );
  const visibleEdges = useMemo(
    () => (catalog ? matchingEdgeIds(catalog, filter, visibleNodes) : new Set<string>()),
    [catalog, filter, visibleNodes],
  );
  const objectHidden = Boolean(search.object && catalog && !visibleNodes.has(search.object));
  const relationHidden = Boolean(search.relation && catalog && !visibleEdges.has(search.relation));
  const activeObjectId = search.object && !objectHidden ? search.object : null;
  const activeRelationId =
    search.relation && !relationHidden && !activeObjectId ? search.relation : null;
  const relationRecord = relationsQuery.data?.find((item) => item.id === activeRelationId);
  const objectOutside = Boolean(
    activeObjectId &&
      graphQuery.data &&
      !graphQuery.data.nodes.some((node) => node.id === activeObjectId),
  );
  const relationOutside = Boolean(
    activeRelationId &&
      relationRecord &&
      graphQuery.data &&
      !graphQuery.data.edges.some((edge) => edge.id === activeRelationId),
  );
  const focusId = objectOutside
    ? activeObjectId ?? undefined
    : relationOutside
      ? relationRecord?.sourceObjectId
      : undefined;
  const focusQuery = useQuery({
    ...(focusId
      ? morphologyGraphOptions(api, projectId, focusId)
      : morphologyGraphOptions(api, projectId, "pending")),
    enabled: ready && focusId !== undefined,
  });
  const rendered = useMemo(() => {
    if (!graphQuery.data) {
      return null;
    }

    const dto =
      focusId && focusQuery.data
        ? mergeGraphResponses(graphQuery.data, focusQuery.data)
        : graphQuery.data;
    return createGraphologyGraph(dto);
  }, [focusId, focusQuery.data, graphQuery.data]);
  const renderedNodes = useMemo(
    () => (rendered ? matchingNodeIds(rendered, filter) : new Set<string>()),
    [filter, rendered],
  );
  const renderedEdges = useMemo(
    () => (rendered ? matchingEdgeIds(rendered, filter, renderedNodes) : new Set<string>()),
    [filter, rendered, renderedNodes],
  );
  const hiddenNodeIds = useMemo(() => {
    const hidden = new Set<string>();
    rendered?.forEachNode((id) => {
      if (!renderedNodes.has(id)) {
        hidden.add(id);
      }
    });
    return hidden;
  }, [rendered, renderedNodes]);
  const hiddenEdgeIds = useMemo(() => {
    const hidden = new Set<string>();
    rendered?.forEachEdge((id) => {
      if (!renderedEdges.has(id)) {
        hidden.add(id);
      }
    });
    return hidden;
  }, [rendered, renderedEdges]);
  const emphasisedNodeIds = useMemo(() => {
    const ids = new Set<string>();
    if (!rendered) {
      return ids;
    }

    if (activeObjectId && rendered.hasNode(activeObjectId)) {
      for (const id of neighbourhoodIds(rendered, activeObjectId, renderedEdges)) {
        ids.add(id);
      }
    }

    if (activeRelationId && rendered.hasEdge(activeRelationId)) {
      ids.add(rendered.source(activeRelationId));
      ids.add(rendered.target(activeRelationId));
    }

    return ids;
  }, [activeObjectId, activeRelationId, rendered, renderedEdges]);
  const labels = useMemo(
    () => new Map((objectsQuery.data ?? []).map((object) => [object.id, object.label])),
    [objectsQuery.data],
  );
  const relationCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const relation of relationsQuery.data ?? []) {
      if (search.relationType && relation.type !== search.relationType) {
        continue;
      }

      counts.set(relation.sourceObjectId, (counts.get(relation.sourceObjectId) ?? 0) + 1);
      counts.set(relation.targetObjectId, (counts.get(relation.targetObjectId) ?? 0) + 1);
    }

    return counts;
  }, [relationsQuery.data, search.relationType]);
  const objectLabel = activeObjectId ? labels.get(activeObjectId) ?? activeObjectId : null;
  const relationLabel = relationRecord
    ? `${labels.get(relationRecord.sourceObjectId) ?? relationRecord.sourceObjectId} · ${t(relationTypeLabelKey[relationRecord.type])}`
    : activeRelationId;
  const hiddenRelation = relationsQuery.data?.find((item) => item.id === search.relation);
  const hiddenLabel = objectHidden
    ? labels.get(search.object ?? "") ?? search.object ?? null
    : relationHidden
      ? hiddenRelation
        ? `${labels.get(hiddenRelation.sourceObjectId) ?? hiddenRelation.sourceObjectId} · ${t(relationTypeLabelKey[hiddenRelation.type])}`
        : search.relation ?? null
      : null;
  const visibleObjects = (objectsQuery.data ?? []).filter((object) => visibleNodes.has(object.id));
  const visibleRelations = (relationsQuery.data ?? []).filter((relation) => visibleEdges.has(relation.id));
  const loading = !ready || objectsQuery.isPending || relationsQuery.isPending || graphQuery.isPending;
  const failed = objectsQuery.isError || relationsQuery.isError || graphQuery.isError;

  useEffect(() => {
    if (
      window.matchMedia("(max-width: 767px)").matches &&
      !new URLSearchParams(window.location.search).has("view")
    ) {
      commit({ view: "objects" });
    }
  }, [commit]);

  useEffect(() => {
    if (!activeObjectId && !activeRelationId) {
      if (ownsInspector.current) {
        closeInspector();
        ownsInspector.current = false;
      }
      return;
    }

    ownsInspector.current = true;
    if (activeObjectId) {
      openInspector({
        title: objectLabel ?? activeObjectId,
        content: <ObjectInspector projectId={projectId} objectId={activeObjectId} />,
        onClose: () => {
          commit({ object: null, relation: null });
        },
      });
      return;
    }

    if (activeRelationId) {
      openInspector({
        title: relationLabel ?? activeRelationId,
        content: (
          <RelationInspector
            projectId={projectId}
            relationId={activeRelationId}
            onSelectObject={(objectId) => {
              commit({ view: "graph", object: objectId, relation: null });
            }}
          />
        ),
        onClose: () => {
          commit({ object: null, relation: null });
        },
      });
    }
  }, [
    activeObjectId,
    activeRelationId,
    closeInspector,
    commit,
    objectLabel,
    openInspector,
    projectId,
    relationLabel,
  ]);

  useEffect(() => {
    return () => {
      if (ownsInspector.current) {
        closeInspector();
        ownsInspector.current = false;
      }
    };
  }, [closeInspector]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape" || commandOpen) {
        return;
      }

      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      commit({ object: null, relation: null });
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [commandOpen, commit]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <h1 className="sr-only">{shell("navMorphology")}</h1>
      <MorphologyToolbar
        projectId={projectId}
        search={search}
        layoutPhase={layoutPhase}
        onChange={commit}
        onFit={() => {
          canvasHandle.current?.fit();
        }}
      />
      {hiddenLabel ? (
        <p className="shrink-0 px-4 py-2 text-sm text-muted-foreground">
          {t("selectionHidden", { label: hiddenLabel })}
        </p>
      ) : null}
      <div className="min-h-0 flex-1">
        {loading ? (
          <Skeleton className="m-4 h-[calc(100%-2rem)]" />
        ) : failed ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">{t("loadError")}</p>
        ) : objectsQuery.data?.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground">{t("empty")}</p>
        ) : search.view === "objects" ? (
          <MorphologyObjectsView
            objects={visibleObjects}
            relationCounts={relationCounts}
            selectedId={activeObjectId}
            onSelect={(id) => {
              commit({ object: id, relation: null });
            }}
          />
        ) : search.view === "relations" ? (
          <MorphologyRelationsView
            relations={visibleRelations}
            labels={labels}
            selectedId={activeRelationId}
            onSelect={(id) => {
              commit({ relation: id, object: null });
            }}
          />
        ) : rendered ? (
          <MorphologyGraphView
            graph={rendered}
            truncated={graphQuery.data?.meta.truncated ?? false}
            shown={rendered.order}
            total={graphQuery.data?.meta.totalNodes ?? rendered.order}
            selectedNodeId={activeObjectId}
            selectedEdgeId={activeRelationId}
            hiddenNodeIds={hiddenNodeIds}
            hiddenEdgeIds={hiddenEdgeIds}
            emphasisedNodeIds={emphasisedNodeIds}
            handleRef={canvasHandle}
            onSelectNode={(id) => {
              commit({ object: id, relation: null });
            }}
            onSelectEdge={(id) => {
              commit({ relation: id, object: null });
            }}
            onClearSelection={() => {
              commit({ object: null, relation: null });
            }}
            onLayoutChange={setLayoutPhase}
            {...(rendered.order > 0 && renderedNodes.size === 0
              ? { emptyMessage: search.conflict ? t("noConflicts") : t("filterEmpty") }
              : {})}
          />
        ) : null}
      </div>
    </div>
  );
}
