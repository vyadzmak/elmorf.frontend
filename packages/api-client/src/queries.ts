import type { Source } from "@elmorf/domain";
import { queryOptions } from "@tanstack/react-query";
import type { ApiClient } from "./client";

function sourceIsActive(source: Source): boolean {
  const status = source.processing.status;
  return status === "queued" || status === "uploading" || status === "processing";
}

export const sessionKeys = {
  current: ["session"] as const,
};

export const projectKeys = {
  all: ["projects"] as const,
  detail: (projectId: string) => ["projects", projectId] as const,
};

export const sourceKeys = {
  list: (projectId: string) => ["projects", projectId, "sources"] as const,
};

export const compileKeys = {
  current: (projectId: string) =>
    ["projects", projectId, "compilations", "current"] as const,
  history: (projectId: string) =>
    ["projects", projectId, "compilations"] as const,
  logs: (projectId: string, compilationId: string) =>
    ["projects", projectId, "compilations", compilationId, "logs"] as const,
};

export const modelKeys = {
  current: (projectId: string) => ["projects", projectId, "model"] as const,
  list: (projectId: string) => ["projects", projectId, "models"] as const,
};

export const settingsKeys = {
  preferences: ["preferences"] as const,
  apiKeys: (projectId: string) => ["projects", projectId, "api-keys"] as const,
};

export const queryKeys = {
  list: (projectId: string) => ["projects", projectId, "queries"] as const,
  detail: (projectId: string, queryId: string) =>
    ["projects", projectId, "queries", queryId] as const,
};

export const morphologyKeys = {
  graph: (projectId: string, focusId?: string) =>
    focusId === undefined
      ? (["projects", projectId, "morphology", "graph"] as const)
      : (["projects", projectId, "morphology", "graph", focusId] as const),
  objects: (projectId: string) =>
    ["projects", projectId, "morphology", "objects"] as const,
  relations: (projectId: string) =>
    ["projects", projectId, "morphology", "relations"] as const,
  object: (projectId: string, objectId: string) =>
    ["projects", projectId, "morphology", "objects", objectId] as const,
  relation: (projectId: string, relationId: string) =>
    ["projects", projectId, "morphology", "relations", relationId] as const,
  search: (projectId: string, query: string) =>
    ["projects", projectId, "morphology", "search", query] as const,
};

export function sessionOptions(client: ApiClient) {
  return queryOptions({
    queryKey: sessionKeys.current,
    queryFn: ({ signal }) => client.auth.getSession({ signal }),
  });
}

export function projectListOptions(client: ApiClient) {
  return queryOptions({
    queryKey: projectKeys.all,
    queryFn: ({ signal }) => client.projects.list({ signal }),
  });
}

export function projectOptions(client: ApiClient, projectId: string) {
  return queryOptions({
    queryKey: projectKeys.detail(projectId),
    queryFn: ({ signal }) => client.projects.get(projectId, { signal }),
  });
}

export function sourceListOptions(client: ApiClient, projectId: string) {
  return queryOptions({
    queryKey: sourceKeys.list(projectId),
    queryFn: ({ signal }) => client.sources.list(projectId, { signal }),
    refetchInterval: (query) =>
      query.state.data?.some(sourceIsActive) ? 800 : false,
  });
}

function compilationIsActive(status: string | undefined): boolean {
  return status === "queued" || status === "running";
}

export function currentCompilationOptions(client: ApiClient, projectId: string) {
  return queryOptions({
    queryKey: compileKeys.current(projectId),
    queryFn: ({ signal }) => client.compilations.current(projectId, { signal }),
    refetchInterval: (query) =>
      compilationIsActive(query.state.data?.state.status) ? 800 : false,
  });
}

export function compilationHistoryOptions(client: ApiClient, projectId: string) {
  return queryOptions({
    queryKey: compileKeys.history(projectId),
    queryFn: ({ signal }) => client.compilations.history(projectId, { signal }),
    refetchInterval: (query) =>
      query.state.data?.some((item) => compilationIsActive(item.state.status)) ? 800 : false,
  });
}

export function compilationLogsOptions(
  client: ApiClient,
  projectId: string,
  compilationId: string,
  active: boolean,
) {
  return queryOptions({
    queryKey: compileKeys.logs(projectId, compilationId),
    queryFn: ({ signal }) => client.compilations.logs(projectId, compilationId, { signal }),
    refetchInterval: active ? 800 : false,
  });
}

export function modelOptions(client: ApiClient, projectId: string) {
  return queryOptions({
    queryKey: modelKeys.current(projectId),
    queryFn: ({ signal }) => client.models.current(projectId, { signal }),
  });
}

export function modelListOptions(client: ApiClient, projectId: string) {
  return queryOptions({
    queryKey: modelKeys.list(projectId),
    queryFn: ({ signal }) => client.models.list(projectId, { signal }),
  });
}

function queryIsActive(status: string | undefined): boolean {
  return status === "queued" || status === "running";
}

export function apiKeyListOptions(client: ApiClient, projectId: string) {
  return queryOptions({
    queryKey: settingsKeys.apiKeys(projectId),
    queryFn: ({ signal }) => client.apiKeys.list(projectId, { signal }),
  });
}

export function queryDetailOptions(
  client: ApiClient,
  projectId: string,
  queryId: string,
) {
  return queryOptions({
    queryKey: queryKeys.detail(projectId, queryId),
    queryFn: ({ signal }) => client.queries.get(projectId, queryId, { signal }),
    refetchInterval: (query) =>
      queryIsActive(query.state.data?.state.status) ? 400 : false,
  });
}

export function queryListOptions(client: ApiClient, projectId: string) {
  return queryOptions({
    queryKey: queryKeys.list(projectId),
    queryFn: ({ signal }) => client.queries.list(projectId, { signal }),
    refetchInterval: (query) =>
      query.state.data?.some((item) => queryIsActive(item.state.status)) ? 400 : false,
  });
}

export function morphologyGraphOptions(
  client: ApiClient,
  projectId: string,
  focusId?: string,
) {
  return queryOptions({
    queryKey: morphologyKeys.graph(projectId, focusId),
    queryFn: ({ signal }) =>
      client.morphology.graph(projectId, {
        signal,
        ...(focusId === undefined ? {} : { focusId }),
      }),
  });
}

export function morphologyObjectsOptions(client: ApiClient, projectId: string) {
  return queryOptions({
    queryKey: morphologyKeys.objects(projectId),
    queryFn: ({ signal }) => client.morphology.objects(projectId, { signal }),
  });
}

export function morphologyRelationsOptions(client: ApiClient, projectId: string) {
  return queryOptions({
    queryKey: morphologyKeys.relations(projectId),
    queryFn: ({ signal }) => client.morphology.relations(projectId, { signal }),
  });
}

export function morphologyObjectOptions(
  client: ApiClient,
  projectId: string,
  objectId: string,
) {
  return queryOptions({
    queryKey: morphologyKeys.object(projectId, objectId),
    queryFn: ({ signal }) => client.morphology.object(projectId, objectId, { signal }),
  });
}

export function morphologyRelationOptions(
  client: ApiClient,
  projectId: string,
  relationId: string,
) {
  return queryOptions({
    queryKey: morphologyKeys.relation(projectId, relationId),
    queryFn: ({ signal }) => client.morphology.relation(projectId, relationId, { signal }),
  });
}

export function morphologySearchOptions(
  client: ApiClient,
  projectId: string,
  query: string,
) {
  return queryOptions({
    queryKey: morphologyKeys.search(projectId, query),
    queryFn: ({ signal }) => client.morphology.search(projectId, query, { signal }),
  });
}
