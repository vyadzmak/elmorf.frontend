"use client";

import type { Relation } from "@elmorf/domain";
import { useFormatter, useTranslations } from "next-intl";
import { useMemo } from "react";
import { ModelTable, type ModelColumn } from "@/features/morphology/model-table";
import { relationTypeLabelKey } from "@/features/morphology/relation-labels";

interface RelationRow {
  id: string;
  sourceLabel: string;
  relationLabel: string;
  targetLabel: string;
  confidenceLabel: string;
  confidence: number;
}

export function MorphologyRelationsView({
  relations,
  labels,
  selectedId,
  onSelect,
}: {
  relations: Relation[];
  labels: ReadonlyMap<string, string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const t = useTranslations("Morphology");
  const format = useFormatter();
  const rows = useMemo<RelationRow[]>(
    () =>
      relations.map((relation) => ({
        id: relation.id,
        sourceLabel: labels.get(relation.sourceObjectId) ?? relation.sourceObjectId,
        relationLabel: t(relationTypeLabelKey[relation.type]),
        targetLabel: labels.get(relation.targetObjectId) ?? relation.targetObjectId,
        confidenceLabel:
          relation.confidence === undefined
            ? t("confidenceUnknown")
            : format.number(relation.confidence, { style: "percent", maximumFractionDigits: 0 }),
        confidence: relation.confidence ?? -1,
      })),
    [format, labels, relations, t],
  );
  const columns = useMemo<ModelColumn<RelationRow>[]>(
    () => [
      { id: "from", header: t("columnFrom"), width: "minmax(160px,1fr)", cell: (row) => row.sourceLabel, sortValue: (row) => row.sourceLabel },
      { id: "relation", header: t("columnRelation"), width: "160px", cell: (row) => row.relationLabel, sortValue: (row) => row.relationLabel },
      { id: "to", header: t("columnTo"), width: "minmax(160px,1fr)", cell: (row) => row.targetLabel, sortValue: (row) => row.targetLabel },
      { id: "confidence", header: t("columnConfidence"), width: "120px", cell: (row) => row.confidenceLabel, sortValue: (row) => row.confidence },
    ],
    [t],
  );

  return (
    <ModelTable
      rows={rows}
      columns={columns}
      selectedId={selectedId}
      emptyLabel={t("empty")}
      countLabel={t("relationCount", { count: rows.length })}
      lockColumnId="from"
      onSelect={onSelect}
    />
  );
}
