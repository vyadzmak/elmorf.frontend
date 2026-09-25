import {
  EvidenceSchema,
  ObjectDetailSchema,
  RelationDetailSchema,
  type CompiledObject,
  type Evidence,
  type ObjectDetail,
  type Relation,
  type RelationDetail,
} from "@elmorf/domain";
import type { MockDataset } from "./dataset";

const coreEvidence: Record<string, { sourceId: string; excerpt: string }> = {
  obj_harbor_pine: {
    sourceId: "src_vendor_csv",
    excerpt: "Harbor & Pine Supplies, vendor, role vendor.",
  },
  obj_ada_lang: {
    sourceId: "src_msa_pdf",
    excerpt: "Ada Lang, procurement lead, appears as the signing party.",
  },
  obj_msa_1842: {
    sourceId: "src_msa_pdf",
    excerpt: "Master services agreement MSA-1842, effective 2024-04-01.",
  },
  obj_inv_2041: {
    sourceId: "src_pricing_xlsx",
    excerpt: "Invoice INV-2041, currency USD.",
  },
  obj_cedar_wharf: {
    sourceId: "src_vendor_csv",
    excerpt: "Registered address 18 Cedar Wharf, Port Meridian.",
  },
  obj_brass_valve: {
    sourceId: "src_pricing_xlsx",
    excerpt: "Brass Valve 12mm, sku BV-12.",
  },
};

function sourceLabel(dataset: MockDataset, sourceId: string): string {
  return dataset.sources.find((item) => item.id === sourceId)?.name ?? sourceId;
}

export function evidenceForObject(dataset: MockDataset, object: CompiledObject): Evidence[] {
  const preset = coreEvidence[object.id];
  const sourceId = preset?.sourceId ?? dataset.sources[0]?.id ?? "src_vendor_csv";
  return [
    EvidenceSchema.parse({
      id: `ev_${object.id}`,
      sourceId,
      label: sourceLabel(dataset, sourceId),
      excerpt: preset?.excerpt ?? `${object.label} is listed in the compiled vendor records.`,
    }),
  ];
}

export function objectDetail(dataset: MockDataset, projectId: string, objectId: string): ObjectDetail | null {
  const object = dataset.objects.find((item) => item.id === objectId && item.projectId === projectId);
  if (!object) {
    return null;
  }

  return ObjectDetailSchema.parse({
    ...object,
    evidence: evidenceForObject(dataset, object),
    conflicts: dataset.conflicts.filter((item) => item.objectId === object.id),
  });
}

export function relationDetail(
  dataset: MockDataset,
  projectId: string,
  relationId: string,
): RelationDetail | null {
  const relation = dataset.relations.find((item) => item.id === relationId && item.projectId === projectId);
  if (!relation) {
    return null;
  }

  const source = dataset.objects.find((item) => item.id === relation.sourceObjectId);
  const target = dataset.objects.find((item) => item.id === relation.targetObjectId);
  if (!source || !target) {
    return null;
  }

  return RelationDetailSchema.parse({
    ...relation,
    sourceLabel: source.label,
    targetLabel: target.label,
    evidence: evidenceForRelation(dataset, relation, source.label, target.label),
  });
}

function evidenceForRelation(
  dataset: MockDataset,
  relation: Relation,
  sourceLabelText: string,
  targetLabelText: string,
): Evidence[] {
  const sourceId = coreEvidence[relation.sourceObjectId]?.sourceId ?? dataset.sources[0]?.id ?? "src_msa_pdf";
  return [
    EvidenceSchema.parse({
      id: `ev_${relation.id}`,
      sourceId,
      label: sourceLabel(dataset, sourceId),
      excerpt: `${sourceLabelText} ${relation.type} ${targetLabelText}.`,
    }),
  ];
}
