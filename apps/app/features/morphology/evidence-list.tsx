"use client";

import type { Evidence } from "@elmorf/domain";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { sectionHref } from "@/lib/workspace-path";

export function EvidenceList({
  items,
  projectId,
}: {
  items: Evidence[];
  projectId?: string;
}) {
  const t = useTranslations("Morphology");
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="text-xs font-medium text-muted-foreground">{t("evidenceTitle")}</h3>
      <ul className="mt-2 grid gap-2">
        {items.map((item) => (
          <li key={item.id} className="grid gap-1 rounded-lg border border-border px-3 py-2">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="font-mono text-xs">{item.excerpt}</p>
            {projectId ? (
              <Link
                href={`${sectionHref(projectId, "data")}?source=${encodeURIComponent(item.sourceId)}`}
                className="text-xs underline-offset-4 hover:underline"
              >
                {t("openSource")}
              </Link>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
