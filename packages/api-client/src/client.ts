import {
  ApiErrorSchema,
  ApiKeyCreatedSchema,
  ApiKeySchema,
  AuthResultSchema,
  CompilationLogEntrySchema,
  CompilationSchema,
  CompiledObjectSchema,
  GraphResponseSchema,
  ModelSummarySchema,
  ObjectDetailSchema,
  ObjectSearchResponseSchema,
  ProjectSchema,
  RelationDetailSchema,
  RelationSchema,
  QueryExecutionSchema,
  CreateSourcesInputSchema,
  PasswordResetInputSchema,
  PasswordResetResultSchema,
  SessionResponseSchema,
  SignInInputSchema,
  SignUpInputSchema,
  SourceSchema,
  UserPreferencesSchema,
  type ApiKey,
  type ApiKeyCreated,
  type Compilation,
  type CompilationLogEntry,
  type CompiledObject,
  type GraphResponse,
  type ObjectDetail,
  type ObjectSearchHit,
  type Relation,
  type RelationDetail,
  type ModelSummary,
  type Project,
  type QueryExecution,
  type QueryLanguage,
  type Session,
  type PasswordResetInput,
  type SignInInput,
  type CreateSourcesInput,
  type SignUpInput,
  type Source,
  type UpdatePreferences,
  type UserPreferences,
} from "@elmorf/domain";
import { z } from "zod";
import { ElmorfApiError, isRetryableStatus } from "./error";

const ProjectListSchema = z.object({
  projects: z.array(ProjectSchema),
});

const SourceListSchema = z.object({
  sources: z.array(SourceSchema),
});

const CompilationListSchema = z.object({
  compilations: z.array(CompilationSchema),
});

const CompilationLogListSchema = z.object({
  logs: z.array(CompilationLogEntrySchema),
});

const ModelListSchema = z.object({
  models: z.array(ModelSummarySchema),
});

const QueryListSchema = z.object({
  queries: z.array(QueryExecutionSchema),
});

const ApiKeyListSchema = z.object({
  keys: z.array(ApiKeySchema),
});

const OkSchema = z.object({
  ok: z.literal(true),
});

const ObjectListSchema = z.object({
  objects: z.array(CompiledObjectSchema),
});

const RelationListSchema = z.object({
  relations: z.array(RelationSchema),
});

export interface ApiClientOptions {
  baseUrl: string;
  fetchFn?: typeof fetch;
}

export interface RequestOptions {
  signal?: AbortSignal;
}

interface RequestInitJson {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  signal?: AbortSignal;
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}${path}`;
}

export function createApiClient({ baseUrl, fetchFn }: ApiClientOptions) {
  async function request<TSchema extends z.ZodType>(
    path: string,
    schema: TSchema,
    init: RequestInitJson = {},
  ): Promise<z.infer<TSchema>> {
    const requestId = crypto.randomUUID();
    const fetchImpl = fetchFn ?? fetch;
    let response: Response;

    try {
      response = await fetchImpl(joinUrl(baseUrl, path), {
        method: init.method ?? "GET",
        headers: {
          accept: "application/json",
          "x-request-id": requestId,
          ...(init.body === undefined
            ? {}
            : { "content-type": "application/json" }),
        },
        ...(init.body === undefined ? {} : { body: JSON.stringify(init.body) }),
        ...(init.signal ? { signal: init.signal } : {}),
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      throw new ElmorfApiError({
        code: "network_error",
        message: error instanceof Error ? error.message : undefined,
        requestId,
        retryable: true,
      });
    }

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const parsed = ApiErrorSchema.safeParse(payload);
      if (parsed.success) {
        throw new ElmorfApiError({
          ...parsed.data,
          status: parsed.data.status ?? response.status,
          requestId: parsed.data.requestId ?? requestId,
        });
      }

      throw new ElmorfApiError({
        code: "http_error",
        status: response.status,
        requestId,
        retryable: isRetryableStatus(response.status),
      });
    }

    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new ElmorfApiError({
        code: "invalid_response",
        status: response.status,
        requestId,
        retryable: false,
      });
    }

    return parsed.data;
  }

  return {
    auth: {
      getSession(options?: RequestOptions): Promise<Session | null> {
        return request("/session", SessionResponseSchema, options).then(
          (body) => body.session,
        );
      },
      signIn(input: SignInInput, options?: RequestOptions): Promise<Session> {
        return request("/auth/sign-in", AuthResultSchema, {
          method: "POST",
          body: SignInInputSchema.parse(input),
          ...options,
        }).then((body) => body.session);
      },
      signUp(input: SignUpInput, options?: RequestOptions): Promise<Session> {
        return request("/auth/sign-up", AuthResultSchema, {
          method: "POST",
          body: SignUpInputSchema.parse(input),
          ...options,
        }).then((body) => body.session);
      },
      signOut(options?: RequestOptions): Promise<void> {
        return request("/auth/sign-out", z.object({ ok: z.literal(true) }), {
          method: "POST",
          ...options,
        }).then(() => undefined);
      },
      requestPasswordReset(
        input: PasswordResetInput,
        options?: RequestOptions,
      ): Promise<void> {
        return request("/auth/password-reset", PasswordResetResultSchema, {
          method: "POST",
          body: PasswordResetInputSchema.parse(input),
          ...options,
        }).then(() => undefined);
      },
    },
    projects: {
      list(options?: RequestOptions): Promise<Project[]> {
        return request("/projects", ProjectListSchema, options).then(
          (body) => body.projects,
        );
      },
      get(projectId: string, options?: RequestOptions): Promise<Project> {
        return request(
          `/projects/${encodeURIComponent(projectId)}`,
          ProjectSchema,
          options,
        );
      },
      delete(projectId: string, options?: RequestOptions): Promise<{ ok: true }> {
        return request(
          `/projects/${encodeURIComponent(projectId)}`,
          OkSchema,
          { method: "DELETE", ...options },
        );
      },
    },
    apiKeys: {
      list(projectId: string, options?: RequestOptions): Promise<ApiKey[]> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/api-keys`,
          ApiKeyListSchema,
          options,
        ).then((body) => body.keys);
      },
      create(
        projectId: string,
        input: { name: string },
        options?: RequestOptions,
      ): Promise<ApiKeyCreated> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/api-keys`,
          ApiKeyCreatedSchema,
          { method: "POST", body: input, ...options },
        );
      },
      revoke(
        projectId: string,
        keyId: string,
        options?: RequestOptions,
      ): Promise<{ ok: true }> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/api-keys/${encodeURIComponent(keyId)}`,
          OkSchema,
          { method: "DELETE", ...options },
        );
      },
    },
    preferences: {
      get(options?: RequestOptions): Promise<UserPreferences> {
        return request("/preferences", UserPreferencesSchema, options);
      },
      update(
        input: UpdatePreferences,
        options?: RequestOptions,
      ): Promise<UserPreferences> {
        return request("/preferences", UserPreferencesSchema, {
          method: "PATCH",
          body: input,
          ...options,
        });
      },
    },
    sources: {
      list(projectId: string, options?: RequestOptions): Promise<Source[]> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/sources`,
          SourceListSchema,
          options,
        ).then((body) => body.sources);
      },
      create(
        projectId: string,
        input: CreateSourcesInput,
        options?: RequestOptions,
      ): Promise<Source[]> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/sources`,
          SourceListSchema,
          {
            method: "POST",
            body: CreateSourcesInputSchema.parse(input),
            ...options,
          },
        ).then((body) => body.sources);
      },
      retry(
        projectId: string,
        sourceId: string,
        options?: RequestOptions,
      ): Promise<Source> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/sources/${encodeURIComponent(sourceId)}/retry`,
          SourceSchema,
          { method: "POST", ...options },
        );
      },
      cancel(
        projectId: string,
        sourceId: string,
        options?: RequestOptions,
      ): Promise<Source> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/sources/${encodeURIComponent(sourceId)}/cancel`,
          SourceSchema,
          { method: "POST", ...options },
        );
      },
      delete(
        projectId: string,
        sourceId: string,
        options?: RequestOptions,
      ): Promise<void> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/sources/${encodeURIComponent(sourceId)}`,
          z.object({ ok: z.literal(true) }),
          { method: "DELETE", ...options },
        ).then(() => undefined);
      },
    },
    compilations: {
      current(
        projectId: string,
        options?: RequestOptions,
      ): Promise<Compilation> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/compilations/current`,
          CompilationSchema,
          options,
        );
      },
      history(
        projectId: string,
        options?: RequestOptions,
      ): Promise<Compilation[]> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/compilations`,
          CompilationListSchema,
          options,
        ).then((body) => body.compilations);
      },
      start(projectId: string, options?: RequestOptions): Promise<Compilation> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/compilations`,
          CompilationSchema,
          { method: "POST", ...options },
        );
      },
      cancel(
        projectId: string,
        compilationId: string,
        options?: RequestOptions,
      ): Promise<Compilation> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/compilations/${encodeURIComponent(compilationId)}/cancel`,
          CompilationSchema,
          { method: "POST", ...options },
        );
      },
      logs(
        projectId: string,
        compilationId: string,
        options?: RequestOptions,
      ): Promise<CompilationLogEntry[]> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/compilations/${encodeURIComponent(compilationId)}/logs`,
          CompilationLogListSchema,
          options,
        ).then((body) => body.logs);
      },
    },
    models: {
      list(
        projectId: string,
        options?: RequestOptions,
      ): Promise<ModelSummary[]> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/models`,
          ModelListSchema,
          options,
        ).then((body) => body.models);
      },
      current(
        projectId: string,
        options?: RequestOptions,
      ): Promise<ModelSummary> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/model`,
          ModelSummarySchema,
          options,
        );
      },
    },
    queries: {
      list(
        projectId: string,
        options?: RequestOptions,
      ): Promise<QueryExecution[]> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/queries`,
          QueryListSchema,
          options,
        ).then((body) => body.queries);
      },
      get(
        projectId: string,
        queryId: string,
        options?: RequestOptions,
      ): Promise<QueryExecution> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/queries/${encodeURIComponent(queryId)}`,
          QueryExecutionSchema,
          options,
        );
      },
      run(
        projectId: string,
        input: { text: string; language: QueryLanguage },
        options?: RequestOptions,
      ): Promise<QueryExecution> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/queries`,
          QueryExecutionSchema,
          {
            method: "POST",
            body: input,
            ...options,
          },
        );
      },
    },
    morphology: {
      graph(
        projectId: string,
        options?: RequestOptions & { focusId?: string },
      ): Promise<GraphResponse> {
        const params = new URLSearchParams();
        if (options?.focusId) {
          params.set("focus", options.focusId);
        }
        const query = params.toString();
        return request(
          `/projects/${encodeURIComponent(projectId)}/morphology/graph${query ? `?${query}` : ""}`,
          GraphResponseSchema,
          options?.signal ? { signal: options.signal } : {},
        );
      },
      objects(projectId: string, options?: RequestOptions): Promise<CompiledObject[]> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/morphology/objects`,
          ObjectListSchema,
          options,
        ).then((body) => body.objects);
      },
      relations(projectId: string, options?: RequestOptions): Promise<Relation[]> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/morphology/relations`,
          RelationListSchema,
          options,
        ).then((body) => body.relations);
      },
      object(
        projectId: string,
        objectId: string,
        options?: RequestOptions,
      ): Promise<ObjectDetail> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/morphology/objects/${encodeURIComponent(objectId)}`,
          ObjectDetailSchema,
          options,
        );
      },
      relation(
        projectId: string,
        relationId: string,
        options?: RequestOptions,
      ): Promise<RelationDetail> {
        return request(
          `/projects/${encodeURIComponent(projectId)}/morphology/relations/${encodeURIComponent(relationId)}`,
          RelationDetailSchema,
          options,
        );
      },
      search(
        projectId: string,
        query: string,
        options?: RequestOptions,
      ): Promise<ObjectSearchHit[]> {
        const params = new URLSearchParams({ q: query });
        return request(
          `/projects/${encodeURIComponent(projectId)}/morphology/search?${params.toString()}`,
          ObjectSearchResponseSchema,
          options,
        ).then((body) => body.objects);
      },
    },
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
