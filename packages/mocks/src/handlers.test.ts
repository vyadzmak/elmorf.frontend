import { createApiClient } from "@elmorf/api-client";
import { ProjectSchema } from "@elmorf/domain";
import { setupServer } from "msw/node";
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { COMPILE_JOB_DONE_MS } from "./compile-jobs";
import { QUERY_JOB_DONE_MS } from "./query-jobs";
import { SOURCE_JOB_DONE_MS } from "./source-jobs";
import {
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_PROJECT_ID,
  createMockDataset,
  invalidProjectFixture,
} from "./dataset";
import { handlers } from "./handlers";
import { setMockLatency } from "./latency";
import { resetMockStore } from "./store";

const server = setupServer(...handlers);
const client = createApiClient({ baseUrl: "http://localhost:4000" });

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

beforeEach(() => {
  setMockLatency(0);
  resetMockStore("happy");
});

afterEach(() => {
  server.resetHandlers();
});

afterAll(() => {
  server.close();
});

describe("mock API", () => {
  it("signs in, returns the demo project, and signs out", async () => {
    resetMockStore("happy");
    await client.auth.signOut();
    await expect(client.projects.list()).rejects.toMatchObject({
      code: "unauthorized",
    });

    const session = await client.auth.signIn({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });
    expect(session.user.name).toBe("Ada Lang");

    const projects = await client.projects.list();
    expect(projects[0]?.name).toBe("Vendor Contracts");
    expect(projects[0]?.id).toBe(DEMO_PROJECT_ID);

    const sources = await client.sources.list(DEMO_PROJECT_ID);
    expect(sources).toHaveLength(5);

    await client.auth.signOut();
    expect(await client.auth.getSession()).toBeNull();
  });

  it("records a password reset without signing anyone in", async () => {
    await client.auth.signOut();
    await client.auth.requestPasswordReset({ email: DEMO_EMAIL });
    expect(await client.auth.getSession()).toBeNull();

    const rejected = await fetch("http://localhost:4000/auth/password-reset", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "not-an-email" }),
    });
    expect(rejected.status).toBe(422);
  });

  it("rejects an invalid project fixture", () => {
    expect(() => ProjectSchema.parse(invalidProjectFixture)).toThrow();
  });

  it("parses every scenario dataset", () => {
    expect(createMockDataset("permission-limited").projects[0]?.capabilities.canCompile).toBe(false);
    expect(createMockDataset("empty").sources).toHaveLength(0);
    expect(createMockDataset("compile-running").compilations.at(-1)?.state.status).toBe("running");
    expect(createMockDataset("compile-failed").compilations.at(-1)?.state.status).toBe("failed");
    expect(createMockDataset("conflicts").conflicts).toHaveLength(1);
    expect(createMockDataset("large-graph").objects.length).toBeGreaterThanOrEqual(500);
    expect(createMockDataset("processing").sources.find((item) => item.id === "src_batch_zip")?.processing.status).toBe("processing");
  });

  it("serves a limited project and a failing API scenario", async () => {
    resetMockStore("permission-limited");
    const project = await client.projects.get(DEMO_PROJECT_ID);
    expect(project.capabilities.canAddData).toBe(false);

    resetMockStore("api-error");
    await expect(client.projects.list()).rejects.toMatchObject({
      code: "upstream_unavailable",
      retryable: true,
    });
    expect((await client.auth.getSession())?.user.email).toBe(DEMO_EMAIL);
  });

  it("returns the whole happy graph and truncates the large one", async () => {
    const happy = await client.morphology.graph(DEMO_PROJECT_ID);
    expect(happy.meta.truncated).toBe(false);
    expect(happy.nodes).toHaveLength(6);

    const ada = await client.morphology.object(DEMO_PROJECT_ID, "obj_ada_lang");
    expect(ada.label).toBe("Ada Lang");
    expect(ada.evidence.length).toBeGreaterThan(0);
    await expect(client.morphology.object(DEMO_PROJECT_ID, "obj_missing")).rejects.toMatchObject({
      status: 404,
    });

    resetMockStore("large-graph");
    const large = await client.morphology.graph(DEMO_PROJECT_ID);
    expect(large.meta.totalNodes).toBeGreaterThanOrEqual(500);
    expect(large.meta.truncated).toBe(true);
    expect(large.nodes.length).toBeLessThan(large.meta.totalNodes);
    expect(await client.morphology.objects(DEMO_PROJECT_ID)).toHaveLength(large.meta.totalNodes);

    const focused = await client.morphology.graph(DEMO_PROJECT_ID, {
      focusId: "obj_extra_490",
    });
    expect(focused.nodes.some((node) => node.id === "obj_extra_490")).toBe(true);
    expect(focused.meta.truncated).toBe(true);
  });

  it("creates sources, finishes or fails them, then retries, cancels, and deletes", async () => {
    const start = Date.parse("2026-09-25T12:00:00.000Z");
    const now = vi.spyOn(Date, "now").mockReturnValue(start);

    try {
      const created = await client.sources.create(DEMO_PROJECT_ID, {
        files: [
          { name: "notes.csv", kind: "csv", sizeBytes: 24 },
          { name: "fail.csv", kind: "csv", sizeBytes: 24 },
        ],
      });
      expect(created.map((item) => item.processing.status)).toEqual(["queued", "queued"]);

      now.mockReturnValue(start + SOURCE_JOB_DONE_MS);
      const finished = await client.sources.list(DEMO_PROJECT_ID);
      expect(finished.find((item) => item.name === "notes.csv")?.processing.status).toBe("ready");
      const failed = finished.find((item) => item.name === "fail.csv");
      expect(failed?.processing.status).toBe("failed");
      if (failed?.processing.status !== "failed") {
        return;
      }

      expect(failed.processing.error.retryable).toBe(true);
      const retryAt = start + SOURCE_JOB_DONE_MS;
      now.mockReturnValue(retryAt);
      const retried = await client.sources.retry(DEMO_PROJECT_ID, failed.id);
      expect(retried.processing.status).toBe("queued");
      now.mockReturnValue(retryAt + SOURCE_JOB_DONE_MS);
      const recovered = await client.sources.list(DEMO_PROJECT_ID);
      expect(recovered.find((item) => item.id === failed.id)?.processing.status).toBe("ready");

      now.mockReturnValue(retryAt + SOURCE_JOB_DONE_MS);
      const fresh = await client.sources.create(DEMO_PROJECT_ID, {
        files: [{ name: "hold.pdf", kind: "pdf", sizeBytes: 8 }],
      });
      const held = fresh[0];
      expect(held?.processing.status).toBe("queued");
      if (!held) {
        return;
      }

      const cancelled = await client.sources.cancel(DEMO_PROJECT_ID, held.id);
      expect(cancelled.processing.status).toBe("cancelled");
      now.mockReturnValue(retryAt + SOURCE_JOB_DONE_MS * 3);
      const parked = await client.sources.list(DEMO_PROJECT_ID);
      expect(parked.find((item) => item.id === held.id)?.processing.status).toBe("cancelled");

      await client.sources.delete(DEMO_PROJECT_ID, held.id);
      const remaining = await client.sources.list(DEMO_PROJECT_ID);
      expect(remaining.some((item) => item.id === held.id)).toBe(false);
      await expect(client.sources.delete(DEMO_PROJECT_ID, held.id)).rejects.toMatchObject({
        status: 404,
      });
      await expect(
        client.sources.create(DEMO_PROJECT_ID, {
          files: [{ name: "notes.csv", kind: "pdf", sizeBytes: 8 }],
        }),
      ).rejects.toMatchObject({ status: 422 });

      resetMockStore("processing");
      const processing = await client.sources.list(DEMO_PROJECT_ID);
      expect(processing.find((item) => item.id === "src_batch_zip")?.processing.status).toBe(
        "processing",
      );
    } finally {
      now.mockRestore();
    }
  });

  it("starts a compilation, finishes or fails it, and keeps a cancelled job cancelled", async () => {
    const start = Date.parse("2026-09-25T12:00:00.000Z");
    const now = vi.spyOn(Date, "now").mockReturnValue(start);
    try {
      const queued = await client.compilations.start(DEMO_PROJECT_ID);
      expect(queued.state.status).toBe("queued");
      expect(queued.version).toBe("v8");
      await expect(client.compilations.start(DEMO_PROJECT_ID)).rejects.toMatchObject({
        status: 409,
      });

      now.mockReturnValue(start + 1_000);
      const running = await client.compilations.current(DEMO_PROJECT_ID);
      expect(running.state.status).toBe("running");
      if (running.state.status === "running") {
        expect(running.state.stage).toBe("bones");
      }

      now.mockReturnValue(start + COMPILE_JOB_DONE_MS);
      const done = await client.compilations.current(DEMO_PROJECT_ID);
      expect(done.state.status).toBe("completed");
      if (done.state.status !== "completed") {
        return;
      }

      expect(done.state.modelVersionId).toBe("mdl_v8");
      expect(done.version).toBe("v8");
      const model = await client.models.current(DEMO_PROJECT_ID);
      expect(model.version).toBe("v8");
      expect(model.objectCount).toBe(6);
      const history = await client.compilations.history(DEMO_PROJECT_ID);
      expect(history.some((item) => item.version === "v7")).toBe(true);
      const logs = await client.compilations.logs(DEMO_PROJECT_ID, done.id);
      expect(logs.some((item) => item.level === "warning")).toBe(true);
      expect(logs.some((item) => item.message.includes("v8"))).toBe(true);

      now.mockReturnValue(start + COMPILE_JOB_DONE_MS);
      const created = await client.sources.create(DEMO_PROJECT_ID, {
        files: [{ name: "fail.csv", kind: "csv", sizeBytes: 8 }],
      });
      const failingSource = created[0];
      expect(failingSource?.processing.status).toBe("queued");
      now.mockReturnValue(start + COMPILE_JOB_DONE_MS + SOURCE_JOB_DONE_MS);
      const sources = await client.sources.list(DEMO_PROJECT_ID);
      expect(sources.find((item) => item.id === failingSource?.id)?.processing.status).toBe(
        "failed",
      );

      const retryAt = start + COMPILE_JOB_DONE_MS + SOURCE_JOB_DONE_MS;
      now.mockReturnValue(retryAt);
      const failing = await client.compilations.start(DEMO_PROJECT_ID);
      expect(failing.version).toBe("v9");
      now.mockReturnValue(retryAt + COMPILE_JOB_DONE_MS);
      const failed = await client.compilations.current(DEMO_PROJECT_ID);
      expect(failed.state.status).toBe("failed");
      if (failed.state.status === "failed") {
        expect(failed.state.error.code).toBe("compile_failed");
      }
      expect((await client.models.current(DEMO_PROJECT_ID)).version).toBe("v8");

      if (failingSource) {
        await client.sources.delete(DEMO_PROJECT_ID, failingSource.id);
      }

      now.mockReturnValue(retryAt + COMPILE_JOB_DONE_MS);
      const fresh = await client.compilations.start(DEMO_PROJECT_ID);
      const cancelled = await client.compilations.cancel(DEMO_PROJECT_ID, fresh.id);
      expect(cancelled.state.status).toBe("cancelled");
      now.mockReturnValue(retryAt + COMPILE_JOB_DONE_MS * 3);
      const parked = await client.compilations.current(DEMO_PROJECT_ID);
      expect(parked.id).toBe(fresh.id);
      expect(parked.state.status).toBe("cancelled");

      resetMockStore("compile-running");
      now.mockReturnValue(Date.parse("2026-04-01T00:00:00.000Z"));
      const fixture = await client.compilations.current(DEMO_PROJECT_ID);
      expect(fixture.version).toBe("v8");
      expect(fixture.state.status).toBe("running");

      resetMockStore("empty");
      await expect(client.compilations.current(DEMO_PROJECT_ID)).rejects.toMatchObject({
        status: 404,
      });
      await expect(client.compilations.start(DEMO_PROJECT_ID)).rejects.toMatchObject({
        status: 409,
      });

      resetMockStore("permission-limited");
      await expect(client.compilations.start(DEMO_PROJECT_ID)).rejects.toMatchObject({
        status: 403,
      });
    } finally {
      now.mockRestore();
    }
  });

  it("runs a natural query into an object, a table, a graph, an empty result, or a failure", async () => {
    const start = Date.parse("2026-09-25T13:00:00.000Z");
    const now = vi.spyOn(Date, "now").mockReturnValue(start);
    try {
      const history = await client.queries.list(DEMO_PROJECT_ID);
      expect(history[0]?.state.status).toBe("completed");
      if (history[0]?.state.status === "completed") {
        expect(history[0].state.modelVersion).toBe("v7");
        expect(history[0].state.result.kind).toBe("table");
      }

      const queued = await client.queries.run(DEMO_PROJECT_ID, {
        text: "Ada Lang",
        language: "natural",
      });
      expect(queued.state.status).toBe("queued");
      now.mockReturnValue(start + QUERY_JOB_DONE_MS);
      const objectQuery = await client.queries.get(DEMO_PROJECT_ID, queued.id);
      expect(objectQuery.state.status).toBe("completed");
      if (objectQuery.state.status === "completed") {
        expect(objectQuery.state.result.kind).toBe("object");
        expect(objectQuery.state.modelVersion).toBe("v7");
        expect(objectQuery.state.evidence.length).toBeGreaterThan(0);
      }

      now.mockReturnValue(start + QUERY_JOB_DONE_MS);
      const tableRun = await client.queries.run(DEMO_PROJECT_ID, {
        text: "open invoices",
        language: "natural",
      });
      now.mockReturnValue(start + QUERY_JOB_DONE_MS * 2);
      const tableQuery = await client.queries.get(DEMO_PROJECT_ID, tableRun.id);
      expect(tableQuery.state.status).toBe("completed");
      if (tableQuery.state.status === "completed" && tableQuery.state.result.kind === "table") {
        expect(tableQuery.state.result.rows.some((row) => row[0] === "INV-2041")).toBe(true);
      }

      now.mockReturnValue(start + QUERY_JOB_DONE_MS * 2);
      const graphRun = await client.queries.run(DEMO_PROJECT_ID, {
        text: "show the graph",
        language: "natural",
      });
      now.mockReturnValue(start + QUERY_JOB_DONE_MS * 3);
      const graphQuery = await client.queries.get(DEMO_PROJECT_ID, graphRun.id);
      expect(graphQuery.state.status).toBe("completed");
      if (graphQuery.state.status === "completed" && graphQuery.state.result.kind === "graph") {
        expect(graphQuery.state.result.graph.nodes.length).toBeGreaterThan(1);
      }

      now.mockReturnValue(start + QUERY_JOB_DONE_MS * 3);
      const emptyRun = await client.queries.run(DEMO_PROJECT_ID, {
        text: "nothing",
        language: "natural",
      });
      now.mockReturnValue(start + QUERY_JOB_DONE_MS * 4);
      const emptyQuery = await client.queries.get(DEMO_PROJECT_ID, emptyRun.id);
      expect(emptyQuery.state.status).toBe("completed");
      if (emptyQuery.state.status === "completed") {
        expect(emptyQuery.state.result.kind).toBe("empty");
      }

      now.mockReturnValue(start + QUERY_JOB_DONE_MS * 4);
      const failRun = await client.queries.run(DEMO_PROJECT_ID, {
        text: "fail this query",
        language: "natural",
      });
      now.mockReturnValue(start + QUERY_JOB_DONE_MS * 5);
      const failed = await client.queries.get(DEMO_PROJECT_ID, failRun.id);
      expect(failed.state.status).toBe("failed");
      expect((await client.models.current(DEMO_PROJECT_ID)).version).toBe("v7");

      await expect(
        client.queries.run(DEMO_PROJECT_ID, { text: "objects", language: "structured" }),
      ).rejects.toMatchObject({ status: 422, code: "structured_unavailable" });

      resetMockStore("empty");
      await expect(
        client.queries.run(DEMO_PROJECT_ID, { text: "Ada Lang", language: "natural" }),
      ).rejects.toMatchObject({ status: 409, code: "model_unavailable" });
    } finally {
      now.mockRestore();
    }
  });

  it("creates an API key secret once, revokes it, and stores preferences", async () => {
    const listed = await client.apiKeys.list(DEMO_PROJECT_ID);
    expect(listed.map((key) => key.prefix)).toContain("elm_demo");
    expect(listed.some((key) => "secret" in key)).toBe(false);

    const created = await client.apiKeys.create(DEMO_PROJECT_ID, { name: "Harbor" });
    expect(created.secret.startsWith(created.prefix)).toBe(true);
    expect(created.prefix.startsWith("elm_")).toBe(true);

    const raw = await fetch("http://localhost:4000/projects/prj_vendor_contracts/api-keys");
    const body = (await raw.json()) as { keys: Array<Record<string, unknown>> };
    const stored = body.keys.find((key) => key.id === created.id);
    expect(stored?.secret).toBeUndefined();
    expect(JSON.stringify(body)).not.toContain(created.secret);

    await client.apiKeys.revoke(DEMO_PROJECT_ID, created.id);
    const after = await client.apiKeys.list(DEMO_PROJECT_ID);
    expect(after.some((key) => key.id === created.id)).toBe(false);

    const saved = await client.preferences.update({ theme: "dark", locale: "ru" });
    expect(saved).toEqual({ theme: "dark", locale: "ru" });
    expect(await client.preferences.get()).toEqual(saved);

    resetMockStore("permission-limited");
    await expect(
      client.apiKeys.create(DEMO_PROJECT_ID, { name: "Blocked" }),
    ).rejects.toMatchObject({ status: 403, code: "forbidden" });
    await expect(client.projects.delete(DEMO_PROJECT_ID)).rejects.toMatchObject({
      status: 403,
      code: "forbidden",
    });

    resetMockStore("happy");
    await client.projects.delete(DEMO_PROJECT_ID);
    await expect(client.projects.get(DEMO_PROJECT_ID)).rejects.toMatchObject({
      status: 404,
      code: "project_not_found",
    });
  });
});
