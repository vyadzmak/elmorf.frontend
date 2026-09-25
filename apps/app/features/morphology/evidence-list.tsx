"use client";

import type { Evidence } from "@elmorf/domain";
import { useTranslations } from "next-intl";

export function EvidenceList({ items }: { items: Evidence[] }) {
  const t = useTranslations("Morphology");
  if (items.length === 0) {
    return null;
  }

  return (
    <section>
      <h3 className="text-xs font-medium text-muted-foreground">{t("evidenceTitle")}</h3>
      <ul className="mt-2 grid gap-3">
        {items.map((item) => (
          <li key={item.id} className="grid gap-1">
            <p className="text-xs text-muted-foreground">{item.label}</p>
            <p className="text-sm">{item.excerpt}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
