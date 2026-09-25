import {
  GraphResponseSchema,
  QueryExecutionSchema,
  QueryResultSchema,
  type CompiledObject,
  type Evidence,
  type QueryExecution,
  type QueryResult,
} from "@elmorf/domain";
import type { MockDataset } from "./dataset";
import { evidenceForObject } from "./evidence";

const QUEUED_MS = 400;
const RUNNING_MS = 900;

export const QUERY_JOB_DONE_MS = QUEUED_MS + RUNNING_MS;

interface QueryJob {
  startedAt: number;
  modelVersion: string;
  evidence: Evidence[];
  result: QueryResult | null;
  error: { code: string; message: string; retryable: boolean } | null;
}

const jobs = new Map<string, QueryJob>();
let sequence = 0;

export function clearQueryJobs(): void {
  jobs.clear();
  sequence = 0;
}

export function nextQueryId(now: number): string {
  sequence += 1;
  return `qry_${now.toString(36)}_${sequence}`;
}

export function beginQueryJob(
  id: string,
  now: number,
  dataset: MockDataset,
  projectId: string,
  text: string,
  modelVersion: string,
): void {
  const resolved = resolveQuery(dataset, projectId, text, modelVersion);
  jobs.set(id, {
    startedAt: now,
    modelVersion,
    evidence: resolved.evidence,
    result: resolved.result,
    error: resolved.error,
  });
}

export function advanceQueryJobs(queries: QueryExecution[], now: number): QueryExecution[] {
  if (jobs.size === 0) {
    return queries;
  }

  let changed = false;
  const next = queries.map((query) => {
    const job = jobs.get(query.id);
    if (!job) {
      return query;
    }

    const elapsed = Math.max(0, now - job.startedAt);
    if (elapsed < QUEUED_MS) {
      return query;
    }

    if (elapsed < QUERY_JOB_DONE_MS) {
      if (query.state.status === "running") {
        return query;
      }
      changed = true;
      return QueryExecutionSchema.parse({
        ...query,
        state: { status: "running" },
      });
    }

    jobs.delete(query.id);
    changed = true;
    if (job.error || !job.result) {
      return QueryExecutionSchema.parse({
        ...query,
        state: {
          status: "failed",
          error: job.error ?? {
            code: "query_failed",
            message: "Query execution stopped.",
            retryable: true,
          },
        },
      });
    }

    return QueryExecutionSchema.parse({
      ...query,
      state: {
        status: "completed",
        completedAt: new Date(now).toISOString(),
        elapsedMs: QUERY_JOB_DONE_MS,
        modelVersion: job.modelVersion,
        evidence: job.evidence,
        result: job.result,
      },
    });
  });

  return changed ? next : queries;
}

function resolveQuery(
  dataset: MockDataset,
  projectId: string,
  text: string,
  modelVersion: string,
): { result: QueryResult | null; evidence: Evidence[]; error: QueryJob["error"] } {
  const haystack = text.toLowerCase();
  if (/\bfail\b/i.test(text)) {
    return {
      result: null,
      evidence: [],
      error: {
        code: "query_failed",
        message: "Query execution stopped.",
        retryable: true,
      },
    };
  }

  const objects = dataset.objects.filter((item) => item.projectId === projectId);
  if (/\bnothing\b/i.test(text) || haystack.includes("no matches")) {
    return { result: QueryResultSchema.parse({ kind: "empty" }), evidence: [], error: null };
  }

  if (/\bgraph\b/i.test(text)) {
    const focus = matchedObjects(objects, haystack);
    const graph = projectGraph(dataset, projectId, modelVersion, focus);
    return {
      result: QueryResultSchema.parse({ kind: "graph", graph }),
      evidence: evidenceFor(dataset, focus.length > 0 ? focus : objects),
      error: null,
    };
  }

  if (/\btable\b/i.test(text) || /\binvoices?\b/i.test(text)) {
    const invoices = objects.filter((item) => item.type === "invoice");
    const rows = invoices.length > 0 ? invoices : matchedObjects(objects, haystack);
    if (rows.length === 0) {
      return { result: QueryResultSchema.parse({ kind: "empty" }), evidence: [], error: null };
    }
    return {
      result: tableResult(rows),
      evidence: evidenceFor(dataset, rows),
      error: null,
    };
  }

  const matches = matchedObjects(objects, haystack);
  if (matches.length === 1) {
    const object = matches[0];
    if (!object) {
      return { result: QueryResultSchema.parse({ kind: "empty" }), evidence: [], error: null };
    }
    return {
      result: QueryResultSchema.parse({ kind: "object", object }),
      evidence: evidenceFor(dataset, [object]),
      error: null,
    };
  }

  if (matches.length > 1) {
    return {
      result: tableResult(matches),
      evidence: evidenceFor(dataset, matches),
      error: null,
    };
  }

  return { result: QueryResultSchema.parse({ kind: "empty" }), evidence: [], error: null };
}

function matchedObjects(objects: CompiledObject[], haystack: string): CompiledObject[] {
  return objects.filter((object) => {
    const label = object.label.toLowerCase();
    return haystack.includes(label) || (haystack.length >= 3 && label.includes(haystack)) || haystack.includes(object.type);
  });
}

function tableResult(objects: CompiledObject[]): QueryResult {
  return QueryResultSchema.parse({
    kind: "table",
    columns: ["object", "type", "detail"],
    rows: objects.map((object) => [
      object.label,
      object.type,
      object.attributes[0] ? `${object.attributes[0].key}: ${object.attributes[0].value}` : "",
    ]),
  });
}

function evidenceFor(dataset: MockDataset, objects: CompiledObject[]): Evidence[] {
  return objects.slice(0, 6).flatMap((object) => evidenceForObject(dataset, object));
}

function projectGraph(
  dataset: MockDataset,
  projectId: string,
  modelVersion: string,
  focus: CompiledObject[],
): ReturnType<typeof GraphResponseSchema.parse> {
  const objects = dataset.objects.filter((item) => item.projectId === projectId);
  const relations = dataset.relations.filter((item) => item.projectId === projectId);
  const ids = new Set(focus.map((item) => item.id));
  if (ids.size === 0) {
    for (const object of objects) {
      ids.add(object.id);
    }
  } else {
    for (const relation of relations) {
      if (ids.has(relation.sourceObjectId) || ids.has(relation.targetObjectId)) {
        ids.add(relation.sourceObjectId);
        ids.add(relation.targetObjectId);
      }
    }
  }

  const nodes = objects.filter((item) => ids.has(item.id));
  const edges = relations.filter(
    (item) => ids.has(item.sourceObjectId) && ids.has(item.targetObjectId),
  );

  return GraphResponseSchema.parse({
    modelVersion,
    nodes: nodes.map((object) => ({
      id: object.id,
      type: object.type,
      label: object.label,
      ...(object.confidence === undefined ? {} : { confidence: object.confidence }),
      conflictCount: object.conflictCount,
    })),
    edges: edges.map((relation) => ({
      id: relation.id,
      source: relation.sourceObjectId,
      target: relation.targetObjectId,
      type: relation.type,
      directed: relation.directed,
      ...(relation.confidence === undefined ? {} : { confidence: relation.confidence }),
    })),
    meta: {
      totalNodes: nodes.length,
      totalEdges: edges.length,
      truncated: false,
    },
  });
}
