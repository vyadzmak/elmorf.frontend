"use client";

import type { CompiledObject } from "@elmorf/domain";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";
import { objectTypeLabelKey } from "@/components/shell/nav";
import { ModelTable, type ModelColumn } from "@/features/morphology/model-table";

interface ObjectRow {
  id: string;
  typeLabel: string;
  label: string;
  confidenceLabel: string;
  confidence: number;
  relationCount: number;
  conflictCount: number;
}

export function MorphologyObjectsView({
  objects,
  relationCounts,
  selectedId,
  onSelect,
}: {
  objects: CompiledObject[];
  relationCounts: ReadonlyMap<string, number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("Morphology");
  const shell = useTranslations("Shell");
  const format = useFormatter();
  const uniformConfidence =
    objects.length > 1 &&
    objects.every((object) => object.confidence !== undefined && object.confidence === objects[0]?.confidence);
  const rows = useMemo<ObjectRow[]>(
    () =>
      objects.map((object) => ({
        id: object.id,
        typeLabel: shell(objectTypeLabelKey[object.type]),
        label: object.label,
        confidenceLabel:
          object.confidence === undefined
            ? t("confidenceUnknown")
            : uniformConfidence
              ? t("confidenceHigh")
              : format.number(object.confidence, { style: "percent", maximumFractionDigits: 0 }),
        confidence: object.confidence ?? -1,
        relationCount: relationCounts.get(object.id) ?? 0,
        conflictCount: object.conflictCount,
      })),
    [format, objects, relationCounts, shell, t, uniformConfidence],
  );
  const columns = useMemo<ModelColumn<ObjectRow>[]>(
    () => [
      { id: "type", header: t("columnType"), width: "140px", cell: (row) => row.typeLabel, sortValue: (row) => row.typeLabel },
      { id: "identity", header: t("columnIdentity"), width: "minmax(180px,1fr)", cell: (row) => row.label, sortValue: (row) => row.label },
      { id: "confidence", header: t("columnConfidence"), width: "120px", cell: (row) => row.confidenceLabel, sortValue: (row) => row.confidence },
      { id: "relations", header: t("columnRelations"), width: "110px", cell: (row) => format.number(row.relationCount), sortValue: (row) => row.relationCount },
      { id: "conflicts", header: t("columnConflicts"), width: "110px", cell: (row) => format.number(row.conflictCount), sortValue: (row) => row.conflictCount },
    ],
    [format, t],
  );

  return (
    <ModelTable
      rows={rows}
      columns={columns}
      selectedId={selectedId}
      emptyLabel={t("empty")}
      countLabel={t("objectCount", { count: rows.length })}
      lockColumnId="identity"
      onSelect={onSelect}
    />
  );
}
