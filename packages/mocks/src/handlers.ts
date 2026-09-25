import {
  ApiErrorSchema,
  ApiKeyCreatedSchema,
  ApiKeySchema,
  CompilationSchema,
  CreateApiKeyInputSchema,
  QueryExecutionSchema,
  QueryRequestSchema,
  CreateSourcesInputSchema,
  UpdatePreferencesSchema,
  SOURCE_MAX_BYTES,
  PasswordResetInputSchema,
  SessionSchema,
  SignInInputSchema,
  SignUpInputSchema,
  SourceSchema,
  sourceKindFromName,
  type Compilation,
  type Source,
} from "@elmorf/domain";
import { delay, http, HttpResponse, type PathParams } from "msw";
import {
  advanceCompilationJobs,
  appendCancellationLog,
  beginCompileJob,
  compilationLogs,
  forgetCompileJob,
  nextCompilationVersion,
} from "./compile-jobs";
import { createMockDataset, DEMO_EMAIL, DEMO_PASSWORD } from "./dataset";
import { objectDetail, relationDetail } from "./evidence";
import { toGraphResponse } from "./graph";
import { resolveMockLatency } from "./latency";
import { advanceSourceJobs, beginSourceJob, forgetSourceJob, isActiveSource } from "./source-jobs";
import { advanceQueryJobs, beginQueryJob, nextQueryId } from "./query-jobs";
import { getMockDataset, getMockScenario, replaceMockDataset, setMockSession } from "./store";

function readParam(params: PathParams, key: string): string {
  const value = params[key];
  if (typeof value === "string") {
    return value;
  }

  return value?.[0] ?? "";
}

async function wait(): Promise<void> {
  await delay(resolveMockLatency(getMockScenario()));
}

function errorResponse(
  status: number,
  code: string,
  retryable: boolean,
  message?: string,
) {
  return HttpResponse.json(
    ApiErrorSchema.parse({
      code,
      status,
      retryable,
      ...(message === undefined ? {} : { message }),
    }),
    { status },
  );
}

function guarded() {
  if (!getMockDataset().session) {
    return errorResponse(401, "unauthorized", false);
  }

  if (getMockScenario() === "api-error") {
    return errorResponse(503, "upstream_unavailable", true);
  }

  return null;
}

function route(path: string): string {
  return `*${path}`;
}

function syncCompilations(): void {
  const dataset = getMockDataset();
  const advanced = advanceCompilationJobs(dataset.compilations, Date.now());
  if (advanced.compilations === dataset.compilations && advanced.model === null) {
    return;
  }

  const model = advanced.model;
  replaceMockDataset({
    ...dataset,
    compilations: advanced.compilations,
    models: model
      ? [model, ...dataset.models.filter((item) => item.id !== model.id)]
      : dataset.models,
    projects: model
      ? dataset.projects.map((project) =>
          project.id === model.projectId
            ? { ...project, currentModelVersionId: model.id }
            : project,
        )
      : dataset.projects,
  });
}

function projectCompilations(projectId: string): Compilation[] {
  syncCompilations();
  return getMockDataset()
    .compilations.filter((item) => item.projectId === projectId)
    .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
}

function projectQueries(projectId: string) {
  const dataset = getMockDataset();
  const advanced = advanceQueryJobs(dataset.queries, Date.now());
  if (advanced !== dataset.queries) {
    replaceMockDataset({ ...dataset, queries: advanced });
  }

  return getMockDataset()
    .queries.filter((item) => item.projectId === projectId)
    .sort((left, right) => queryRank(right).localeCompare(queryRank(left)));
}

function queryRank(query: { state: { status: string; completedAt?: string; cancelledAt?: string } }): string {
  if (query.state.status === "queued" || query.state.status === "running") {
    return "9";
  }
  if ("completedAt" in query.state && query.state.completedAt) {
    return query.state.completedAt;
  }
  if ("cancelledAt" in query.state && query.state.cancelledAt) {
    return query.state.cancelledAt;
  }
  return "0";
}

function projectSources(): Source[] {
  const dataset = getMockDataset();
  const advanced = advanceSourceJobs(dataset.sources, Date.now());
  if (advanced !== dataset.sources) {
    replaceMockDataset({ ...dataset, sources: advanced });
  }

  return getMockDataset().sources;
}

function sourceFor(projectId: string, sourceId: string): Source | undefined {
  return projectSources().find(
    (item) => item.projectId === projectId && item.id === sourceId,
  );
}

export const handlers = [
  http.get(route("/session"), async () => {
    await wait();
    return HttpResponse.json({ session: getMockDataset().session });
  }),
  http.post(route("/auth/sign-in"), async ({ request }) => {
    await wait();
    const parsed = SignInInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(422, "invalid_request", false);
    }

    if (
      parsed.data.email !== DEMO_EMAIL ||
      parsed.data.password !== DEMO_PASSWORD
    ) {
      return errorResponse(401, "invalid_credentials", false);
    }

    const session = createMockDataset("happy").session;
    if (!session) {
      return errorResponse(500, "session_missing", true);
    }

    setMockSession(session);
    return HttpResponse.json({ session });
  }),
  http.post(route("/auth/sign-up"), async ({ request }) => {
    await wait();
    const parsed = SignUpInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(422, "invalid_request", false);
    }

    const session = SessionSchema.parse({
      user: {
        id: "usr_signup",
        email: parsed.data.email,
        name: parsed.data.name,
      },
    });
    setMockSession(session);
    return HttpResponse.json({ session });
  }),
  http.post(route("/auth/password-reset"), async ({ request }) => {
    await wait();
    const parsed = PasswordResetInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(422, "invalid_request", false);
    }

    return HttpResponse.json({ accepted: true });
  }),
  http.post(route("/auth/sign-out"), async () => {
    await wait();
    setMockSession(null);
    return HttpResponse.json({ ok: true });
  }),
  http.post(route("/projects/:projectId/sources"), async ({ params, request }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const parsed = CreateSourcesInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(422, "invalid_request", false);
    }

    const projectId = readParam(params, "projectId");
    const prepared: Array<{ name: string; kind: Source["kind"]; sizeBytes: number; fail: boolean }> = [];

    for (const file of parsed.data.files) {
      const name = file.name.trim();
      if (
        name.length === 0 ||
        file.sizeBytes > SOURCE_MAX_BYTES ||
        sourceKindFromName(name) !== file.kind
      ) {
        return errorResponse(422, "invalid_request", false);
      }

      prepared.push({
        name,
        kind: file.kind,
        sizeBytes: file.sizeBytes,
        fail: /fail/i.test(name),
      });
    }

    const now = Date.now();
    const created = prepared.map((file, index) => {
      const id = `src_${now.toString(36)}_${index}`;
      beginSourceJob(id, now, file.fail);
      return SourceSchema.parse({
        id,
        projectId,
        name: file.name,
        kind: file.kind,
        sizeBytes: file.sizeBytes,
        createdAt: new Date(now).toISOString(),
        processing: { status: "queued" },
      });
    });

    const dataset = getMockDataset();
    replaceMockDataset({
      ...dataset,
      sources: [...created, ...dataset.sources],
    });
    return HttpResponse.json({ sources: created });
  }),
  http.post(
    route("/projects/:projectId/sources/:sourceId/retry"),
    async ({ params }) => {
      await wait();
      const denied = guarded();
      if (denied) {
        return denied;
      }

      const projectId = readParam(params, "projectId");
      const sourceId = readParam(params, "sourceId");
      const current = sourceFor(projectId, sourceId);
      if (!current) {
        return errorResponse(404, "source_not_found", false);
      }

      if (current.processing.status !== "failed" || !current.processing.error.retryable) {
        return errorResponse(409, "source_not_retryable", false);
      }

      const now = Date.now();
      beginSourceJob(sourceId, now, false);
      const next = SourceSchema.parse({
        ...current,
        processing: { status: "queued" },
      });
      replaceMockDataset({
        ...getMockDataset(),
        sources: getMockDataset().sources.map((item) => (item.id === sourceId ? next : item)),
      });
      return HttpResponse.json(next);
    },
  ),
  http.post(
    route("/projects/:projectId/sources/:sourceId/cancel"),
    async ({ params }) => {
      await wait();
      const denied = guarded();
      if (denied) {
        return denied;
      }

      const projectId = readParam(params, "projectId");
      const sourceId = readParam(params, "sourceId");
      const current = sourceFor(projectId, sourceId);
      if (!current) {
        return errorResponse(404, "source_not_found", false);
      }

      if (!isActiveSource(current)) {
        return errorResponse(409, "source_not_cancellable", false);
      }

      forgetSourceJob(sourceId);
      const next = SourceSchema.parse({
        ...current,
        processing: {
          status: "cancelled",
          cancelledAt: new Date(Date.now()).toISOString(),
        },
      });
      replaceMockDataset({
        ...getMockDataset(),
        sources: getMockDataset().sources.map((item) => (item.id === sourceId ? next : item)),
      });
      return HttpResponse.json(next);
    },
  ),
  http.delete(
    route("/projects/:projectId/sources/:sourceId"),
    async ({ params }) => {
      await wait();
      const denied = guarded();
      if (denied) {
        return denied;
      }

      const projectId = readParam(params, "projectId");
      const sourceId = readParam(params, "sourceId");
      const current = sourceFor(projectId, sourceId);
      if (!current) {
        return errorResponse(404, "source_not_found", false);
      }

      forgetSourceJob(sourceId);
      replaceMockDataset({
        ...getMockDataset(),
        sources: getMockDataset().sources.filter((item) => item.id !== sourceId),
      });
      return HttpResponse.json({ ok: true });
    },
  ),
  http.get(route("/projects/:projectId/sources"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    return HttpResponse.json({
      sources: projectSources().filter((item) => item.projectId === projectId),
    });
  }),
  http.get(
    route("/projects/:projectId/compilations/current"),
    async ({ params }) => {
      await wait();
      const denied = guarded();
      if (denied) {
        return denied;
      }

      const projectId = readParam(params, "projectId");
      const current = projectCompilations(projectId)[0];
      if (!current) {
        return errorResponse(404, "compilation_not_found", false);
      }

      return HttpResponse.json(current);
    },
  ),
  http.get(
    route("/projects/:projectId/compilations/:compilationId/logs"),
    async ({ params }) => {
      await wait();
      const denied = guarded();
      if (denied) {
        return denied;
      }

      const projectId = readParam(params, "projectId");
      const compilationId = readParam(params, "compilationId");
      const current = projectCompilations(projectId).find((item) => item.id === compilationId);
      if (!current) {
        return errorResponse(404, "compilation_not_found", false);
      }

      return HttpResponse.json({ logs: compilationLogs(compilationId) });
    },
  ),
  http.post(
    route("/projects/:projectId/compilations/:compilationId/cancel"),
    async ({ params }) => {
      await wait();
      const denied = guarded();
      if (denied) {
        return denied;
      }

      const projectId = readParam(params, "projectId");
      const compilationId = readParam(params, "compilationId");
      const current = projectCompilations(projectId).find((item) => item.id === compilationId);
      if (!current) {
        return errorResponse(404, "compilation_not_found", false);
      }

      if (current.state.status !== "queued" && current.state.status !== "running") {
        return errorResponse(409, "compilation_not_cancellable", false);
      }

      const now = Date.now();
      forgetCompileJob(compilationId);
      const next = CompilationSchema.parse({
        ...current,
        state: { status: "cancelled", cancelledAt: new Date(now).toISOString() },
      });
      appendCancellationLog(next, now);
      replaceMockDataset({
        ...getMockDataset(),
        compilations: getMockDataset().compilations.map((item) =>
          item.id === compilationId ? next : item,
        ),
      });
      return HttpResponse.json(next);
    },
  ),
  http.post(route("/projects/:projectId/compilations"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    const dataset = getMockDataset();
    const project = dataset.projects.find((item) => item.id === projectId);
    if (!project) {
      return errorResponse(404, "project_not_found", false);
    }

    if (!project.capabilities.canCompile) {
      return errorResponse(403, "forbidden", false);
    }

    const sources = dataset.sources.filter((item) => item.projectId === projectId);
    const ready = sources.filter((item) => item.processing.status === "ready");
    if (ready.length === 0) {
      return errorResponse(409, "no_ready_sources", false);
    }

    const active = projectCompilations(projectId).some(
      (item) => item.state.status === "queued" || item.state.status === "running",
    );
    if (active) {
      return errorResponse(409, "compilation_active", false);
    }

    const currentModel = getMockDataset().models.find(
      (item) => item.id === project.currentModelVersionId,
    );
    const version = nextCompilationVersion(
      getMockDataset().compilations.filter((item) => item.projectId === projectId),
    );
    const now = Date.now();
    const compilation = CompilationSchema.parse({
      id: `cmp_${version}`,
      projectId,
      version,
      startedAt: new Date(now).toISOString(),
      stages: [
        { name: "bones", state: "pending", warningCount: 0, errorCount: 0 },
        { name: "flesh", state: "pending", warningCount: 0, errorCount: 0 },
        { name: "compile", state: "pending", warningCount: 0, errorCount: 0 },
      ],
      state: { status: "queued" },
    });
    beginCompileJob({
      id: compilation.id,
      startedAt: now,
      failAtFlesh: sources.some((item) => item.processing.status === "failed"),
      sourceCount: ready.length,
      objectCount: currentModel?.objectCount ?? 0,
      relationCount: currentModel?.relationCount ?? 0,
      conflictCount: currentModel?.conflictCount ?? 0,
    });
    replaceMockDataset({
      ...getMockDataset(),
      compilations: [...getMockDataset().compilations, compilation],
    });
    const started = projectCompilations(projectId).find((item) => item.id === compilation.id);
    return HttpResponse.json(started ?? compilation);
  }),
  http.get(route("/projects/:projectId/compilations"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    return HttpResponse.json({
      compilations: projectCompilations(projectId),
    });
  }),
  http.get(route("/projects/:projectId/model"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    const dataset = getMockDataset();
    const project = dataset.projects.find((item) => item.id === projectId);
    const model =
      dataset.models.find((item) => item.id === project?.currentModelVersionId) ??
      dataset.models.find((item) => item.projectId === projectId);
    if (!model) {
      return errorResponse(404, "model_not_found", false);
    }

    return HttpResponse.json(model);
  }),
  http.get(route("/projects/:projectId/models"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    return HttpResponse.json({
      models: getMockDataset().models.filter((item) => item.projectId === projectId),
    });
  }),
  http.post(route("/projects/:projectId/queries"), async ({ request, params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    const raw: unknown = await request.json();
    const parsed = QueryRequestSchema.safeParse(
      raw && typeof raw === "object" ? { ...raw, projectId } : { projectId },
    );
    if (!parsed.success) {
      return errorResponse(422, "query_invalid", false);
    }

    if (parsed.data.language === "structured") {
      return errorResponse(422, "structured_unavailable", false);
    }

    const dataset = getMockDataset();
    const project = dataset.projects.find((item) => item.id === projectId);
    if (!project) {
      return errorResponse(404, "project_not_found", false);
    }

    const model =
      dataset.models.find((item) => item.id === project.currentModelVersionId) ?? null;
    if (!model) {
      return errorResponse(409, "model_unavailable", false);
    }

    const now = Date.now();
    const execution = QueryExecutionSchema.parse({
      id: nextQueryId(now),
      projectId,
      text: parsed.data.text,
      language: parsed.data.language,
      state: { status: "queued" },
    });
    beginQueryJob(execution.id, now, dataset, projectId, parsed.data.text, model.version);
    replaceMockDataset({
      ...getMockDataset(),
      queries: [execution, ...getMockDataset().queries],
    });
    return HttpResponse.json(execution);
  }),
  http.get(route("/projects/:projectId/queries/:queryId"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    const queryId = readParam(params, "queryId");
    const current = projectQueries(projectId).find((item) => item.id === queryId);
    if (!current) {
      return errorResponse(404, "query_not_found", false);
    }

    return HttpResponse.json(current);
  }),
  http.get(route("/projects/:projectId/queries"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    return HttpResponse.json({
      queries: projectQueries(projectId),
    });
  }),
  http.get(route("/projects/:projectId/morphology/search"), async ({ request, params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? "";
    const objects = query
      ? getMockDataset()
          .objects.filter(
            (item) =>
              item.projectId === projectId &&
              item.label.toLowerCase().includes(query),
          )
          .slice(0, 8)
          .map((item) => ({
            id: item.id,
            projectId: item.projectId,
            type: item.type,
            label: item.label,
          }))
      : [];

    return HttpResponse.json({ objects });
  }),
  http.get(route("/projects/:projectId/morphology/objects/:objectId"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const detail = objectDetail(
      getMockDataset(),
      readParam(params, "projectId"),
      readParam(params, "objectId"),
    );
    if (!detail) {
      return errorResponse(404, "object_not_found", false);
    }

    return HttpResponse.json(detail);
  }),
  http.get(route("/projects/:projectId/morphology/relations/:relationId"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const detail = relationDetail(
      getMockDataset(),
      readParam(params, "projectId"),
      readParam(params, "relationId"),
    );
    if (!detail) {
      return errorResponse(404, "relation_not_found", false);
    }

    return HttpResponse.json(detail);
  }),
  http.get(route("/projects/:projectId/morphology/objects"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    return HttpResponse.json({
      objects: getMockDataset().objects.filter((item) => item.projectId === projectId),
    });
  }),
  http.get(route("/projects/:projectId/morphology/relations"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    return HttpResponse.json({
      relations: getMockDataset().relations.filter((item) => item.projectId === projectId),
    });
  }),
  http.get(route("/projects/:projectId/morphology/graph"), async ({ request }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const focusId = new URL(request.url).searchParams.get("focus");
    return HttpResponse.json(toGraphResponse(getMockDataset(), focusId));
  }),
  http.get(route("/preferences"), async () => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    return HttpResponse.json(getMockDataset().preferences);
  }),
  http.patch(route("/preferences"), async ({ request }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const parsed = UpdatePreferencesSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(422, "preferences_invalid", false);
    }

    const dataset = getMockDataset();
    const next = { ...dataset.preferences };
    if (parsed.data.theme !== undefined) {
      next.theme = parsed.data.theme;
    }
    if (parsed.data.locale !== undefined) {
      next.locale = parsed.data.locale;
    }
    dataset.preferences = next;
    return HttpResponse.json(dataset.preferences);
  }),
  http.get(route("/projects/:projectId/api-keys"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    const project = getMockDataset().projects.find((item) => item.id === projectId);
    if (!project) {
      return errorResponse(404, "project_not_found", false);
    }

    return HttpResponse.json({
      keys: getMockDataset().apiKeys.filter((item) => item.projectId === projectId),
    });
  }),
  http.post(route("/projects/:projectId/api-keys"), async ({ params, request }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    const project = getMockDataset().projects.find((item) => item.id === projectId);
    if (!project) {
      return errorResponse(404, "project_not_found", false);
    }
    if (!project.capabilities.canManageApiKeys) {
      return errorResponse(403, "forbidden", false);
    }

    const parsed = CreateApiKeyInputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return errorResponse(422, "api_key_invalid", false);
    }

    const token = crypto.randomUUID().replaceAll("-", "");
    const secret = `elm_${token}`;
    const key = ApiKeySchema.parse({
      id: `key_${token.slice(0, 8)}`,
      projectId,
      name: parsed.data.name,
      prefix: secret.slice(0, 12),
      createdAt: new Date().toISOString(),
    });
    getMockDataset().apiKeys.unshift(key);
    return HttpResponse.json(
      ApiKeyCreatedSchema.parse({ ...key, secret }),
      { status: 201 },
    );
  }),
  http.delete(
    route("/projects/:projectId/api-keys/:keyId"),
    async ({ params }) => {
      await wait();
      const denied = guarded();
      if (denied) {
        return denied;
      }

      const projectId = readParam(params, "projectId");
      const project = getMockDataset().projects.find((item) => item.id === projectId);
      if (!project) {
        return errorResponse(404, "project_not_found", false);
      }
      if (!project.capabilities.canManageApiKeys) {
        return errorResponse(403, "forbidden", false);
      }

      const keyId = readParam(params, "keyId");
      const dataset = getMockDataset();
      const index = dataset.apiKeys.findIndex(
        (item) => item.id === keyId && item.projectId === projectId,
      );
      if (index < 0) {
        return errorResponse(404, "api_key_not_found", false);
      }

      dataset.apiKeys.splice(index, 1);
      return HttpResponse.json({ ok: true });
    },
  ),
  http.delete(route("/projects/:projectId"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    const dataset = getMockDataset();
    const project = dataset.projects.find((item) => item.id === projectId);
    if (!project) {
      return errorResponse(404, "project_not_found", false);
    }
    if (!project.capabilities.canDeleteProject) {
      return errorResponse(403, "forbidden", false);
    }

    dataset.projects = dataset.projects.filter((item) => item.id !== projectId);
    return HttpResponse.json({ ok: true });
  }),
  http.get(route("/projects/:projectId"), async ({ params }) => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    const projectId = readParam(params, "projectId");
    const project = getMockDataset().projects.find(
      (item) => item.id === projectId,
    );
    if (!project) {
      return errorResponse(404, "project_not_found", false);
    }

    return HttpResponse.json(project);
  }),
  http.get(route("/projects"), async () => {
    await wait();
    const denied = guarded();
    if (denied) {
      return denied;
    }

    return HttpResponse.json({ projects: getMockDataset().projects });
  }),
];
