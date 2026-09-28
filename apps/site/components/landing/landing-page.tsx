import { Button } from "@elmorf/ui/components/ui/button";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CompilationBoard } from "@/components/landing/compilation-board";
import { HeroVisual } from "@/components/landing/hero-visual";
import { LlmSketch } from "@/components/landing/llm-sketch";
import { ModelExplorer } from "@/components/landing/model-explorer";

const h2 =
  "max-w-3xl text-[clamp(1.875rem,3.2vw,3rem)] font-medium leading-[1.05] tracking-[-0.035em] text-balance";
const copy = "text-base leading-[1.55] text-foreground/80";

export async function LandingPage() {
  const t = await getTranslations("Landing");
  const traditional = [
    t("schemaStepSchema"),
    t("schemaEntities"),
    t("schemaRelationships"),
    t("schemaMappings"),
    t("schemaStepData"),
    t("schemaModel"),
  ];
  const elmorf = [t("schemaStepData"), "compile()", t("schemaModel")];
  const cases = [
    { title: "useCaseReconcileTitle", body: "useCaseReconcileBody", example: "useCaseReconcileOut" },
    { title: "useCaseContractsTitle", body: "useCaseContractsBody", example: "useCaseContractsOut" },
    { title: "useCaseProductsTitle", body: "useCaseProductsBody", example: "useCaseProductsOut" },
    { title: "useCaseAiTitle", body: "useCaseAiBody", example: "useCaseAiOut" },
  ] as const;

  return (
    <>
      <section className="grid items-center gap-10 py-12 xl:grid-cols-[minmax(0,0.48fr)_minmax(0,0.52fr)] xl:gap-12 xl:py-16">
        <div className="flex flex-col gap-5">
          <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-primary">{t("heroEyebrow")}</p>
          <h1 className="max-w-xl text-[clamp(2.4rem,4.6vw,3.75rem)] font-medium leading-[0.98] tracking-[-0.045em] text-balance">
            {t("headlineLead")}
            <span className="mt-1 block">{t("headlineMid")}</span>
          </h1>
          <p className={`max-w-lg ${copy}`}>{t("support")}</p>
          <p className="max-w-lg text-base font-medium leading-[1.5]">{t("heroNoSchema")}</p>
          <p className="text-2xl font-medium leading-tight tracking-tight">
            {t("heroPunchLead")}
            <span className="mt-1 block text-primary">{t("heroPunchTail")}</span>
          </p>
          <Button asChild className="h-11 w-full px-5 sm:w-fit">
            <Link href="/try">{t("openCorpus")}</Link>
          </Button>
        </div>
        <HeroVisual
          sourcesLabel={t("sourcesLabel")}
          modelLabel={t("heroModelLabel")}
          compileLabel="compile()"
          inputs={[
            t("heroInputDocuments"),
            t("heroInputTables"),
            t("heroInputRecords"),
            t("heroInputApplication"),
          ]}
          outputs={[
            t("heroOutputVendor"),
            t("heroOutputContract"),
            t("heroOutputInvoice"),
            t("heroOutputRelations"),
            t("heroOutputEvidence"),
          ]}
        />
      </section>

      <section className="scroll-mt-24 py-12 lg:py-16">
        <h2 className={h2}>{t("schemaTitle")}</h2>
        <p className={`mt-3 max-w-xl ${copy}`}>{t("schemaBody")}</p>
        <div className="mt-8 flex flex-col gap-7">
          <Path label={t("schemaTraditional")} steps={traditional} quiet />
          <Path label={t("schemaElmorf")} steps={elmorf} quiet={false} />
        </div>
        <p className="mt-8 max-w-3xl text-[clamp(1.75rem,3vw,2.5rem)] font-medium leading-[1.1] tracking-[-0.03em]">
          {t("schemaPunchLead")}
          <span className="mt-1 block text-primary">{t("schemaPunchTail")}</span>
        </p>
      </section>

      <section id="output" className="scroll-mt-24 py-16 lg:py-20">
        <h2 className={h2}>{t("outputTitle")}</h2>
        <p className="mt-3 font-mono text-[12px] tracking-[0.04em] text-muted-foreground">{t("outputStructure")}</p>
        <div className="mt-6">
          <ModelExplorer />
        </div>
      </section>

      <section id="use-cases" className="scroll-mt-24 py-16 lg:py-20">
        <h2 className={h2}>{t("useCasesTitle")}</h2>
        <ul className="mt-8 grid gap-x-10 gap-y-8 sm:grid-cols-2 xl:grid-cols-4">
          {cases.map((item) => (
            <li key={item.title} className="flex flex-col">
              <h3 className="text-base font-medium tracking-tight">{t(item.title)}</h3>
              <p className={`mt-2 ${copy}`}>{t(item.body)}</p>
              <p className="mt-auto pt-3 font-mono text-[12px] leading-5 text-muted-foreground">{t(item.example)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section id="how-it-works" className="scroll-mt-24 py-16 lg:py-24">
        <h2 className={h2}>{t("compileQuestion")}</h2>
        <p className={`mt-3 max-w-xl ${copy}`}>{t("compileLead")}</p>
        <div className="mt-8">
          <CompilationBoard
            sameObjectLabel={t("compileSameObject")}
            sameFieldLabel={t("compileSameField")}
            joinedLabel={t("compileJoined")}
            keptLabel={t("compileKept")}
            unresolvedLabel={t("compileUnresolved")}
            conflictTitle={t("compileConflictsTitle")}
            companyLabel={t("modelKindCompany")}
            contractLabel={t("modelKindContract")}
          />
        </div>
        <p className="mt-4 font-mono text-[12px] text-muted-foreground">{t("compileFacets")}</p>
        <p className={`mt-2 max-w-xl ${copy}`}>{t("observationsLine")}</p>

        <div className="mt-8 border-t border-border pt-6">
          <h3 className="max-w-3xl text-xl font-medium tracking-tight">{t("llmTitle")}</h3>
          <p className={`mt-2 max-w-xl ${copy}`}>{t("llmBody")}</p>
          <LlmSketch
            llmLabel={t("llmExtract")}
            elmorfLabel={t("llmKeeps")}
            documentLabel={t("llmDocument")}
            promptLabel={t("llmPrompt")}
            structureLabel={t("llmStructure")}
            observationsLabel={t("compileObservations")}
          />
        </div>
      </section>

      <section id="sdk" className="scroll-mt-24 py-16 lg:py-24">
        <h2 className={h2}>{t("codeTitle")}</h2>
        <div className="mt-6 max-w-xl overflow-hidden rounded-xl border border-border bg-[var(--elmorf-surface-1)]">
          <p className="border-b border-border px-5 py-4 font-mono text-lg">{t("install")}</p>
          <pre className="overflow-x-auto px-5 py-5 font-mono text-[15px] leading-8">
            <code>
              <span className="text-muted-foreground">{"import elmorf\n\nproject = \"prj_vendor_contracts\"\n"}</span>
              <span className="text-primary">elmorf.load</span>
              <span className="text-muted-foreground">{"(project=project)\n"}</span>
              <span className="text-primary">elmorf.compile</span>
              <span className="text-muted-foreground">{"(project=project)\n"}</span>
              {"result = "}
              <span className="text-primary">elmorf.get</span>
              <span className="text-muted-foreground">
                {"(\n    project=project,\n    model=\"v7\",\n    query=\"open invoices\",\n)\n# INV-2041 · open"}
              </span>
            </code>
          </pre>
        </div>
      </section>

      <section className="mb-6 grid items-end gap-10 py-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-24">
        <div>
          <h2 className={h2}>{t("finalTitleLead")}</h2>
          <p className={`mt-3 max-w-xl ${copy}`}>{t("finalBody")}</p>
          <Button asChild className="mt-6 h-11 w-full px-5 sm:w-fit">
            <Link href="/try">{t("openCorpus")}</Link>
          </Button>
        </div>
        <FinalModel keptLabel={t("compileKept")} unresolvedLabel={t("compileUnresolved")} />
      </section>
    </>
  );
}

function FinalModel({ keptLabel, unresolvedLabel }: { keptLabel: string; unresolvedLabel: string }) {
  return (
    <div className="border-t border-border pt-4 lg:border-t-0 lg:border-s lg:pt-0 lg:ps-8">
      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">v7</p>
      <p className="mt-3 text-[clamp(1.5rem,2vw,2rem)] font-medium tracking-tight">MSA-1842</p>
      <p className="mt-1 font-mono text-[12px] text-muted-foreground">effective</p>
      <div className="mt-3 flex max-w-sm flex-col gap-1.5 text-sm">
        <p className="flex items-baseline justify-between gap-6">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{keptLabel}</span>
          <span className="font-medium whitespace-nowrap">2024-04-01</span>
        </p>
        <p className="flex items-baseline justify-between gap-6 border-t border-dashed border-primary pt-1.5">
          <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{unresolvedLabel}</span>
          <span className="font-medium text-muted-foreground" aria-hidden>
            —
          </span>
        </p>
      </div>
      <p className="mt-3 font-mono text-[12px] text-muted-foreground">harbor-pine-master-services.pdf</p>
      <p className="font-mono text-[12px] text-muted-foreground">annex-b.docx</p>
    </div>
  );
}

function Path({ label, steps, quiet }: { label: string; steps: string[]; quiet: boolean }) {
  return (
    <div>
      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={`mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2 ${quiet ? "text-base text-muted-foreground" : "text-xl"}`}>
        {steps.map((step, index) => (
          <span key={`${step}-${index}`} className="inline-flex items-center gap-2.5">
            {index > 0 ? (
              <span className={quiet ? "text-muted-foreground/70" : "text-primary"} aria-hidden>
                →
              </span>
            ) : null}
            <span className={!quiet && step === "compile()" ? "font-mono text-primary" : undefined}>{step}</span>
          </span>
        ))}
      </p>
    </div>
  );
}
