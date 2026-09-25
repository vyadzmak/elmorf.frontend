"use client";

import {
  morphologyGraphOptions,
  morphologyObjectOptions,
  morphologyRelationsOptions,
} from "@elmorf/api-client";
import { Badge } from "@elmorf/ui/components/ui/badge";
import { Skeleton } from "@elmorf/ui/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useMockReady } from "@/components/app-providers";
import { objectTypeLabelKey } from "@/components/shell/nav";
import { EvidenceList } from "@/features/morphology/evidence-list";
import { relationTypeLabelKey } from "@/features/morphology/relation-labels";
import { isNotFound, useApiClient } from "@/lib/use-api";

export function ObjectInspector({
  projectId,
  objectId,
}: {
  projectId: string;
  objectId: string;
}) {
  const t = useTranslations("Morphology");
  const shell = useTranslations("Shell");
  const format = useFormatter();
  const ready = useMockReady();
  const api = useApiClient();
  const detail = useQuery({
    ...morphologyObjectOptions(api, projectId, objectId),
    enabled: ready,
  });
  const relations = useQuery({
    ...morphologyRelationsOptions(api, projectId),
    enabled: ready,
  });
  const graph = useQuery({
    ...morphologyGraphOptions(api, projectId),
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

  const object = detail.data;
  const connected = (relations.data ?? []).filter(
    (item) => item.sourceObjectId === objectId || item.targetObjectId === objectId,
  );
  const shown = connected.slice(0, 8);
  const broughtIn = graph.data ? !graph.data.nodes.some((node) => node.id === objectId) : false;
  const confidence =
    object.confidence === undefined
      ? t("confidenceUnknown")
      : format.number(object.confidence, { style: "percent", maximumFractionDigits: 0 });

  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <div className="flex items-center gap-2">
        <Badge variant="outline">{shell(objectTypeLabelKey[object.type])}</Badge>
        <span className="text-sm text-muted-foreground">{confidence}</span>
      </div>
      {broughtIn ? <p className="text-sm text-muted-foreground">{t("broughtIn")}</p> : null}
      {object.attributes.length > 0 ? (
        <section>
          <h3 className="text-xs font-medium text-muted-foreground">{t("attributesTitle")}</h3>
          <dl className="mt-2 grid gap-2">
            {object.attributes.map((attribute) => (
              <div key={attribute.key}>
                <dt className="text-xs text-muted-foreground">{attribute.key}</dt>
                <dd className="text-sm">{attribute.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      {object.conflicts.length > 0 ? (
        <section>
          <h3 className="text-xs font-medium text-muted-foreground">{t("conflictsTitle")}</h3>
          <ul className="mt-2 grid gap-2">
            {object.conflicts.map((conflict) => (
              <li key={conflict.id} className="text-sm text-destructive">
                {conflict.summary}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <section>
        <h3 className="text-xs font-medium text-muted-foreground">{t("relationsTitle")}</h3>
        {shown.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">{t("relationsEmpty")}</p>
        ) : (
          <ul className="mt-2 grid gap-1">
            {shown.map((relation) => (
              <li key={relation.id} className="truncate text-sm">
                {t(relationTypeLabelKey[relation.type])}
              </li>
            ))}
          </ul>
        )}
        {connected.length > shown.length ? (
          <p className="mt-2 text-xs text-muted-foreground">
            {t("relationMore", { count: connected.length - shown.length })}
          </p>
        ) : null}
      </section>
      <EvidenceList items={object.evidence} />
    </div>
  );
}
