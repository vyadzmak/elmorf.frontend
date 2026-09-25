"use client";

import { morphologyRelationOptions } from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import { Skeleton } from "@elmorf/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useMockReady } from "@/components/app-providers";
import { EvidenceList } from "@/features/morphology/evidence-list";
import { relationTypeLabelKey } from "@/features/morphology/relation-labels";
import { isNotFound, useApiClient } from "@/lib/use-api";

export function RelationInspector({
  projectId,
  relationId,
  onSelectObject,
}: {
  projectId: string;
  relationId: string;
  onSelectObject: (objectId: string) => void;
}) {
  const t = useTranslations("Morphology");
  const format = useFormatter();
  const ready = useMockReady();
  const api = useApiClient();
  const detail = useQuery({
    ...morphologyRelationOptions(api, projectId, relationId),
    enabled: ready,
  });

  if (detail.isPending) {
    return <Skeleton className="m-4 h-24" />;
  }

  if (detail.isError) {
    return (
      <p className="px-4 py-4 text-sm text-muted-foreground">
        {isNotFound(detail.error) ? t("missing") : t("loadError")}
      </p>
    );
  }

  const relation = detail.data;
  const confidence =
    relation.confidence === undefined
      ? t("confidenceUnknown")
      : format.number(relation.confidence, { style: "percent", maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <p className="text-sm font-medium">{t(relationTypeLabelKey[relation.type])}</p>
      <p className="text-sm text-muted-foreground">{confidence}</p>
      <div className="grid gap-2">
        <Button
          type="button"
          variant="outline"
          className="justify-start"
          onClick={() => {
            onSelectObject(relation.sourceObjectId);
          }}
        >
          {relation.sourceLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="justify-start"
          onClick={() => {
            onSelectObject(relation.targetObjectId);
          }}
        >
          {relation.targetLabel}
        </Button>
      </div>
      <EvidenceList items={relation.evidence} />
    </div>
  );
}
