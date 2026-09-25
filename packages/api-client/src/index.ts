export { createApiClient, type ApiClient, type ApiClientOptions } from "./client";
export { ElmorfApiError } from "./error";
export { createQueryClient } from "./query-client";
export {
  compilationHistoryOptions,
  compilationLogsOptions,
  compileKeys,
  currentCompilationOptions,
  modelKeys,
  modelListOptions,
  modelOptions,
  morphologyGraphOptions,
  morphologyKeys,
  morphologyObjectOptions,
  morphologyObjectsOptions,
  morphologyRelationOptions,
  morphologyRelationsOptions,
  morphologySearchOptions,
  apiKeyListOptions,
  projectKeys,
  projectListOptions,
  projectOptions,
  queryDetailOptions,
  queryKeys,
  queryListOptions,
  sessionKeys,
  sessionOptions,
  settingsKeys,
  sourceKeys,
  sourceListOptions,
} from "./queries";

export const packageId = "api-client" as const;
