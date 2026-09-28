"use client";

import { cn } from "@elmorf/ui/lib/utils";
import { useTranslations } from "next-intl";
import { useState } from "react";

interface ModelNode {
  id: string;
  label: string;
  kind: string;
  fields: { key: string; value: string }[];
  relations: { from: string; type: string; to: string }[];
  conflict?: string;
  evidence: { fact: string; source: string; excerpt: string }[];
}

export function ModelExplorer() {
  const t = useTranslations("Landing");
  const groups: { title: string; nodes: ModelNode[] }[] = [
    {
      title: t("modelPeople"),
      nodes: [
        {
          id: "ada",
          label: "Ada Lang",
          kind: t("modelKindPerson"),
          fields: [{ key: "title", value: "procurement lead" }],
          relations: [
            { from: "Ada Lang", type: "WORKS_FOR", to: "Harbor & Pine Supplies" },
            { from: "Ada Lang", type: "SIGNED", to: "MSA-1842" },
          ],
          evidence: [
            {
              fact: "title = procurement lead",
              source: "harbor-pine-master-services.pdf",
              excerpt: "Ada Lang, procurement lead, appears as the signing party.",
            },
          ],
        },
      ],
    },
    {
      title: t("modelVendors"),
      nodes: [
        {
          id: "harbor",
          label: "Harbor & Pine Supplies",
          kind: t("modelKindCompany"),
          fields: [{ key: "role", value: "vendor" }],
          relations: [
            { from: "Ada Lang", type: "WORKS_FOR", to: "Harbor & Pine Supplies" },
            { from: "MSA-1842", type: "BELONGS_TO", to: "Harbor & Pine Supplies" },
            { from: "Harbor & Pine Supplies", type: "SUPPLIES", to: "Brass Valve 12mm" },
            { from: "Harbor & Pine Supplies", type: "LOCATED_AT", to: "18 Cedar Wharf" },
          ],
          evidence: [
            {
              fact: "role = vendor",
              source: "vendor-master.csv",
              excerpt: "Harbor & Pine Supplies, vendor, role vendor.",
            },
            {
              fact: "name = Harbor & Pine",
              source: "harbor-pine-master-services.pdf",
              excerpt: "Supplier named Harbor & Pine.",
            },
          ],
        },
      ],
    },
    {
      title: t("modelPlaces"),
      nodes: [
        {
          id: "wharf",
          label: "18 Cedar Wharf",
          kind: t("modelKindAddress"),
          fields: [{ key: "city", value: "Port Meridian" }],
          relations: [{ from: "Harbor & Pine Supplies", type: "LOCATED_AT", to: "18 Cedar Wharf" }],
          evidence: [
            {
              fact: "city = Port Meridian",
              source: "vendor-master.csv",
              excerpt: "Registered address 18 Cedar Wharf, Port Meridian.",
            },
          ],
        },
      ],
    },
    {
      title: t("modelContracts"),
      nodes: [
        {
          id: "msa",
          label: "MSA-1842",
          kind: t("modelKindContract"),
          fields: [{ key: "effective", value: "2024-04-01" }],
          relations: [
            { from: "Ada Lang", type: "SIGNED", to: "MSA-1842" },
            { from: "MSA-1842", type: "BELONGS_TO", to: "Harbor & Pine Supplies" },
            { from: "INV-2041", type: "BELONGS_TO", to: "MSA-1842" },
          ],
          conflict: t("compileConflictBody"),
          evidence: [
            {
              fact: "effective = 2024-04-01",
              source: "harbor-pine-master-services.pdf",
              excerpt: "Master services agreement MSA-1842, effective 2024-04-01.",
            },
            {
              fact: "effective",
              source: "annex-b.docx",
              excerpt: "Annex B records a second effective date for MSA-1842.",
            },
          ],
        },
      ],
    },
    {
      title: t("modelInvoices"),
      nodes: [
        {
          id: "inv",
          label: "INV-2041",
          kind: t("modelKindInvoice"),
          fields: [{ key: "currency", value: "USD" }],
          relations: [{ from: "INV-2041", type: "BELONGS_TO", to: "MSA-1842" }],
          evidence: [
            {
              fact: "currency = USD",
              source: "pricing-2026.xlsx",
              excerpt: "Invoice INV-2041, currency USD.",
            },
          ],
        },
      ],
    },
    {
      title: t("modelProducts"),
      nodes: [
        {
          id: "valve",
          label: "Brass Valve 12mm",
          kind: t("modelKindProduct"),
          fields: [{ key: "sku", value: "BV-12" }],
          relations: [{ from: "Harbor & Pine Supplies", type: "SUPPLIES", to: "Brass Valve 12mm" }],
          evidence: [
            {
              fact: "sku = BV-12",
              source: "pricing-2026.xlsx",
              excerpt: "Brass Valve 12mm, sku BV-12.",
            },
          ],
        },
      ],
    },
  ];
  const nodes = groups.flatMap((group) => group.nodes);
  const [selectedId, setSelectedId] = useState("msa");
  const [panel, setPanel] = useState<"model" | "evidence">("model");
  const selected = nodes.find((node) => node.id === selectedId) ?? nodes[0];

  if (!selected) return null;

  return (
    <div className="grid overflow-hidden rounded-xl border border-border lg:grid-cols-[minmax(15rem,0.72fr)_minmax(0,1.28fr)]">
      <div className="border-b border-border bg-[var(--elmorf-surface-1)] p-4 lg:border-b-0 lg:border-e">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">
          {t("exampleName")}
        </p>
        <div className="mt-3 flex flex-col">
          {groups.map((group) => (
            <div key={group.title} className="border-b border-border py-2 last:border-b-0">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{group.title}</p>
              <ul className="mt-1">
                {group.nodes.map((node) => {
                  const active = node.id === selected.id;
                  return (
                    <li key={node.id}>
                      <button
                        type="button"
                        aria-pressed={active}
                        className={cn(
                          "w-full rounded-md px-2 py-1.5 text-start transition-colors duration-150 hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                          active && "bg-muted",
                        )}
                        onClick={() => {
                          setSelectedId(node.id);
                          setPanel("model");
                        }}
                      >
                        <span className={cn("block text-[15px] leading-5", active && "font-medium")}>{node.label}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">{node.kind}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-background p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
              {selected.kind}
            </p>
            <h3 className="mt-1 text-[clamp(1.5rem,2vw,1.875rem)] font-medium tracking-tight">{selected.label}</h3>
          </div>
          <div className="flex rounded-lg border border-border p-0.5" role="tablist" aria-label={selected.label}>
            {(["model", "evidence"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={panel === value}
                className={cn(
                  "h-8 rounded-md px-3 text-sm focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  panel === value ? "bg-muted font-medium" : "text-muted-foreground",
                )}
                onClick={() => setPanel(value)}
              >
                {value === "model" ? t("modelPanel") : t("modelEvidence")}
              </button>
            ))}
          </div>
        </div>
        {panel === "model" ? (
          <div className="mt-6 flex flex-col gap-5">
            {selected.conflict ? (
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                  {t("compileConflictsTitle")}
                </p>
                <div className="mt-2 flex flex-col gap-1.5 text-[15px] leading-6">
                  <p className="flex items-baseline justify-between gap-3 border-b border-border pb-1.5">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                      {t("compileKept")}
                    </span>
                    <span className="font-medium whitespace-nowrap">2024-04-01</span>
                  </p>
                  <p className="flex items-baseline justify-between gap-3 border-b border-dashed border-primary pb-1.5">
                    <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">
                      {t("compileUnresolved")}
                    </span>
                    <span className="font-medium text-muted-foreground" aria-hidden>
                      —
                    </span>
                  </p>
                  <p className="font-mono text-[12px] text-muted-foreground">annex-b.docx</p>
                </div>
              </div>
            ) : (
              <dl className="grid gap-2">
                {selected.fields.map((field) => (
                  <div key={field.key} className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3 border-b border-border py-2 text-[15px] leading-6">
                    <dt className="font-mono text-muted-foreground">{field.key}</dt>
                    <dd className="font-medium">{field.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{t("modelRelations")}</p>
              <ul className="mt-1">
                {selected.relations.map((relation) => (
                  <li
                    key={`${relation.from}-${relation.type}-${relation.to}`}
                    className="border-b border-border py-2 text-[15px] leading-6 last:border-b-0"
                  >
                    <span className="font-medium">{relation.from}</span>{" "}
                    <span className="font-mono text-[11px] text-muted-foreground">
                      {relation.type} <span aria-hidden>→</span>
                    </span>{" "}
                    <span className="font-medium">{relation.to}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <ul className="mt-7 flex flex-col gap-3">
            {selected.evidence.map((item) => (
              <li key={item.source} className="rounded-lg border border-border bg-[var(--elmorf-surface-1)] p-5">
                <p className="font-mono text-base">{item.fact}</p>
                <p className="mt-2 font-mono text-sm text-primary" aria-hidden>
                  ↓
                </p>
                <p className="mt-2 font-mono text-base">{item.source}</p>
                <p className="mt-2 text-base leading-7">{item.excerpt}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
