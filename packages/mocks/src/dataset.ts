import { faker } from "@faker-js/faker";
import {
  ApiKeySchema,
  CompilationSchema,
  CompiledObjectSchema,
  ConflictSchema,
  ModelSummarySchema,
  ProjectSchema,
  QueryExecutionSchema,
  RelationSchema,
  SessionSchema,
  SourceSchema,
  UserPreferencesSchema,
  type ApiKey,
  type Compilation,
  type CompiledObject,
  type Conflict,
  type ModelSummary,
  type Project,
  type ProjectCapabilities,
  type QueryExecution,
  type Relation,
  type Session,
  type Source,
  type UserPreferences,
  DEMO_EMAIL,
  DEMO_PASSWORD,
  DEMO_PROJECT_ID,
} from "@elmorf/domain";
import { z } from "zod";
import type { MockScenario } from "./scenarios";

export { DEMO_EMAIL, DEMO_PASSWORD, DEMO_PROJECT_ID };
export const DEMO_MODEL_ID = "mdl_v7";

const fullCapabilities: ProjectCapabilities = {
  canAddData: true,
  canCompile: true,
  canManageApiKeys: true,
  canDeleteProject: true,
};

const limitedCapabilities: ProjectCapabilities = {
  canAddData: false,
  canCompile: false,
  canManageApiKeys: false,
  canDeleteProject: false,
};

const ready = {
  status: "ready" as const,
  completedAt: "2026-03-18T15:00:00.000Z",
};

function source(
  id: string,
  name: string,
  kind: Source["kind"],
  sizeBytes: number,
  createdAt: string,
  processing: Source["processing"],
): Source {
  return SourceSchema.parse({
    id,
    projectId: DEMO_PROJECT_ID,
    name,
    kind,
    sizeBytes,
    createdAt,
    processing,
  });
}

const sources: Source[] = [
  source(
    "src_msa_pdf",
    "harbor-pine-master-services.pdf",
    "pdf",
    842_113,
    "2026-03-02T09:12:00.000Z",
    ready,
  ),
  source(
    "src_vendor_csv",
    "vendor-master.csv",
    "csv",
    28_440,
    "2026-03-04T11:20:00.000Z",
    ready,
  ),
  source(
    "src_pricing_xlsx",
    "pricing-2026.xlsx",
    "xlsx",
    116_902,
    "2026-03-06T08:05:00.000Z",
    ready,
  ),
  source(
    "src_annex_docx",
    "annex-b.docx",
    "docx",
    54_220,
    "2026-03-09T16:40:00.000Z",
    ready,
  ),
  source(
    "src_batch_zip",
    "intake-batch-march.zip",
    "zip",
    4_420_881,
    "2026-03-11T13:15:00.000Z",
    ready,
  ),
];

const objects: CompiledObject[] = [
  {
    id: "obj_harbor_pine",
    type: "company",
    label: "Harbor & Pine Supplies",
    attributes: [{ key: "role", value: "vendor" }],
  },
  {
    id: "obj_ada_lang",
    type: "person",
    label: "Ada Lang",
    attributes: [{ key: "title", value: "procurement lead" }],
  },
  {
    id: "obj_msa_1842",
    type: "contract",
    label: "MSA-1842",
    attributes: [{ key: "effective", value: "2024-04-01" }],
  },
  {
    id: "obj_inv_2041",
    type: "invoice",
    label: "INV-2041",
    attributes: [{ key: "currency", value: "USD" }],
  },
  {
    id: "obj_cedar_wharf",
    type: "address",
    label: "18 Cedar Wharf",
    attributes: [{ key: "city", value: "Port Meridian" }],
  },
  {
    id: "obj_brass_valve",
    type: "product",
    label: "Brass Valve 12mm",
    attributes: [{ key: "sku", value: "BV-12" }],
  },
].map((item) =>
  CompiledObjectSchema.parse({
    ...item,
    projectId: DEMO_PROJECT_ID,
    modelVersionId: DEMO_MODEL_ID,
    confidence: 0.92,
    conflictCount: 0,
  }),
);

const relations: Relation[] = (
  [
    ["rel_works_for", "WORKS_FOR", "obj_ada_lang", "obj_harbor_pine"],
    ["rel_signed", "SIGNED", "obj_ada_lang", "obj_msa_1842"],
    ["rel_belongs", "BELONGS_TO", "obj_msa_1842", "obj_harbor_pine"],
    ["rel_supplies", "SUPPLIES", "obj_harbor_pine", "obj_brass_valve"],
    ["rel_located", "LOCATED_AT", "obj_harbor_pine", "obj_cedar_wharf"],
  ] as const
).map(([id, type, sourceObjectId, targetObjectId]) =>
  RelationSchema.parse({
    id,
    projectId: DEMO_PROJECT_ID,
    modelVersionId: DEMO_MODEL_ID,
    type,
    sourceObjectId,
    targetObjectId,
    directed: true,
    confidence: 0.9,
  }),
);

function stages(
  bones: "completed" | "running" | "failed" | "pending",
  flesh: "completed" | "running" | "failed" | "pending",
  compile: "completed" | "running" | "failed" | "pending",
): Compilation["stages"] {
  return [
    { name: "bones", state: bones, warningCount: 0, errorCount: 0 },
    { name: "flesh", state: flesh, warningCount: 0, errorCount: flesh === "failed" ? 1 : 0 },
    { name: "compile", state: compile, warningCount: 0, errorCount: 0 },
  ];
}

const completedCompilation = CompilationSchema.parse({
  id: "cmp_v7",
  projectId: DEMO_PROJECT_ID,
  version: "v7",
  startedAt: "2026-03-18T14:10:00.000Z",
  stages: stages("completed", "completed", "completed"),
  state: {
    status: "completed",
    completedAt: "2026-03-18T14:42:00.000Z",
    modelVersionId: DEMO_MODEL_ID,
  },
});

const model = ModelSummarySchema.parse({
  id: DEMO_MODEL_ID,
  projectId: DEMO_PROJECT_ID,
  version: "v7",
  createdAt: "2026-03-18T14:42:00.000Z",
  sourceCount: sources.length,
  objectCount: objects.length,
  relationCount: relations.length,
  conflictCount: 0,
});

const session = SessionSchema.parse({
  user: {
    id: "usr_ada",
    email: DEMO_EMAIL,
    name: "Ada Lang",
  },
});

const queryExecution = QueryExecutionSchema.parse({
  id: "qry_open_invoices",
  projectId: DEMO_PROJECT_ID,
  text: "Which invoices are still open for Harbor & Pine Supplies?",
  language: "natural",
  state: {
    status: "completed",
    completedAt: "2026-03-20T09:30:00.000Z",
    elapsedMs: 186,
    modelVersion: "v7",
    evidence: [
      {
        id: "ev_inv_2041",
        sourceId: "src_pricing_xlsx",
        label: "pricing-2026.xlsx",
        excerpt: "Invoice INV-2041, currency USD.",
      },
    ],
    result: {
      kind: "table",
      columns: ["invoice", "status"],
      rows: [["INV-2041", "open"]],
    },
  },
});

const apiKey = ApiKeySchema.parse({
  id: "key_primary",
  projectId: DEMO_PROJECT_ID,
  name: "Local demo",
  prefix: "elm_demo",
  createdAt: "2026-03-01T08:00:00.000Z",
});

const preferences = UserPreferencesSchema.parse({
  theme: "system",
  locale: "en",
});

export interface MockDataset {
  session: Session | null;
  projects: Project[];
  sources: Source[];
  compilations: Compilation[];
  models: ModelSummary[];
  objects: CompiledObject[];
  relations: Relation[];
  conflicts: Conflict[];
  queries: QueryExecution[];
  apiKeys: ApiKey[];
  preferences: UserPreferences;
}

const MockDatasetSchema = z.object({
  session: SessionSchema.nullable(),
  projects: z.array(ProjectSchema),
  sources: z.array(SourceSchema),
  compilations: z.array(CompilationSchema),
  models: z.array(ModelSummarySchema),
  objects: z.array(CompiledObjectSchema),
  relations: z.array(RelationSchema),
  conflicts: z.array(ConflictSchema),
  queries: z.array(QueryExecutionSchema),
  apiKeys: z.array(ApiKeySchema),
  preferences: UserPreferencesSchema,
});

function happyDataset(): MockDataset {
  return {
    session,
    projects: [
      ProjectSchema.parse({
        id: DEMO_PROJECT_ID,
        name: "Vendor Contracts",
        capabilities: fullCapabilities,
        currentModelVersionId: DEMO_MODEL_ID,
      }),
    ],
    sources,
    compilations: [completedCompilation],
    models: [model],
    objects,
    relations,
    conflicts: [],
    queries: [queryExecution],
    apiKeys: [apiKey],
    preferences,
  };
}

function withProject(
  dataset: MockDataset,
  patch: Partial<Project>,
): MockDataset {
  const current = dataset.projects[0];
  if (!current) {
    return dataset;
  }

  return {
    ...dataset,
    projects: [ProjectSchema.parse({ ...current, ...patch })],
  };
}

export function createMockDataset(scenario: MockScenario): MockDataset {
  const dataset = structuredClone(happyDataset());

  switch (scenario) {
    case "happy":
    case "slow-network":
    case "api-error":
      return MockDatasetSchema.parse(dataset);
    case "permission-limited":
      return MockDatasetSchema.parse(
        withProject(dataset, { capabilities: limitedCapabilities }),
      );
    case "empty":
      return MockDatasetSchema.parse({
        ...withProject(dataset, { currentModelVersionId: null }),
        sources: [],
        compilations: [],
        models: [],
        objects: [],
        relations: [],
        conflicts: [],
        queries: [],
      });
    case "processing":
      return MockDatasetSchema.parse({
        ...dataset,
        sources: dataset.sources.map((item) =>
          item.id === "src_batch_zip"
            ? SourceSchema.parse({
                ...item,
                processing: {
                  status: "processing",
                  stage: "extract",
                  progress: 0.4,
                },
              })
            : item,
        ),
      });
    case "partial":
      return MockDatasetSchema.parse({
        ...dataset,
        sources: dataset.sources.map((item) => {
          if (item.id === "src_batch_zip") {
            return SourceSchema.parse({
              ...item,
              processing: {
                status: "failed",
                error: {
                  code: "source_unreadable",
                  retryable: false,
                },
              },
            });
          }

          if (item.id === "src_annex_docx") {
            return SourceSchema.parse({
              ...item,
              processing: { status: "queued" },
            });
          }

          return item;
        }),
      });
    case "compile-running":
      return MockDatasetSchema.parse({
        ...dataset,
        compilations: [
          completedCompilation,
          CompilationSchema.parse({
            id: "cmp_v8",
            projectId: DEMO_PROJECT_ID,
            version: "v8",
            startedAt: "2026-03-21T10:00:00.000Z",
            stages: stages("completed", "running", "pending"),
            state: {
              status: "running",
              stage: "flesh",
              progress: 0.55,
            },
          }),
        ],
      });
    case "compile-failed":
      return MockDatasetSchema.parse({
        ...dataset,
        compilations: [
          completedCompilation,
          CompilationSchema.parse({
            id: "cmp_v8",
            projectId: DEMO_PROJECT_ID,
            version: "v8",
            startedAt: "2026-03-21T10:00:00.000Z",
            stages: stages("completed", "failed", "pending"),
            state: {
              status: "failed",
              error: {
                code: "compile_failed",
                message: "Flesh processing stopped.",
                retryable: false,
              },
            },
          }),
        ],
      });
    case "conflicts": {
      const conflict = ConflictSchema.parse({
        id: "cnf_msa_date",
        objectId: "obj_msa_1842",
        summary: "Two effective dates were extracted for MSA-1842.",
      });
      return MockDatasetSchema.parse({
        ...dataset,
        conflicts: [conflict],
        objects: dataset.objects.map((item) =>
          item.id === "obj_msa_1842"
            ? CompiledObjectSchema.parse({ ...item, conflictCount: 1 })
            : item,
        ),
        models: dataset.models.map((item) =>
          ModelSummarySchema.parse({ ...item, conflictCount: 1 }),
        ),
      });
    }
    case "large-graph":
      return MockDatasetSchema.parse(withLargeGraph(dataset));
    default: {
      const exhaustive: never = scenario;
      return exhaustive;
    }
  }
}

function withLargeGraph(dataset: MockDataset): MockDataset {
  faker.seed(20260925);
  const extraObjects: CompiledObject[] = [];
  const extraRelations: Relation[] = [];

  for (let index = 0; index < 494; index += 1) {
    const id = `obj_extra_${index}`;
    const isPerson = index % 2 === 1;
    extraObjects.push(
      CompiledObjectSchema.parse({
        id,
        projectId: DEMO_PROJECT_ID,
        modelVersionId: DEMO_MODEL_ID,
        type: isPerson ? "person" : "company",
        label: isPerson ? faker.person.fullName() : faker.company.name(),
        confidence: 0.7,
        attributes: [],
        conflictCount: 0,
      }),
    );

    if (isPerson) {
      extraRelations.push(
        RelationSchema.parse({
          id: `rel_extra_${index}`,
          projectId: DEMO_PROJECT_ID,
          modelVersionId: DEMO_MODEL_ID,
          type: "WORKS_FOR",
          sourceObjectId: id,
          targetObjectId: "obj_harbor_pine",
          directed: true,
          confidence: 0.7,
        }),
      );
    }
  }

  const objectsNext = [...dataset.objects, ...extraObjects];
  const relationsNext = [...dataset.relations, ...extraRelations];

  return {
    ...dataset,
    objects: objectsNext,
    relations: relationsNext,
    models: dataset.models.map((item) =>
      ModelSummarySchema.parse({
        ...item,
        objectCount: objectsNext.length,
        relationCount: relationsNext.length,
      }),
    ),
  };
}

export const invalidProjectFixture = {
  id: "prj_broken",
  name: "",
  capabilities: { canAddData: true },
  currentModelVersionId: null,
};
