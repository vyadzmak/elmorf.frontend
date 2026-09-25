import { Button } from "@elmorf/ui/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SdkDemo } from "@/components/landing/sdk-demo";
import { ProductVisual } from "@/components/landing/product-visual";
import { appSignInHref } from "@/lib/app-link";

const useCases = [
  ["useCaseContractsTitle", "useCaseContractsBody", "useCaseContractsExample", "obj_msa_1842"],
  ["useCaseProductsTitle", "useCaseProductsBody", "useCaseProductsExample", "obj_brass_valve"],
  ["useCaseReconcileTitle", "useCaseReconcileBody", "useCaseReconcileExample", "obj_inv_2041"],
] as const;

export async function LandingPage() {
  const t = await getTranslations("Landing");
  const locale = await getLocale();
  const signIn = appSignInHref(locale);
  const roles = [
    t("sourceRoleContract"),
    t("sourceRoleRegistry"),
    t("sourceRolePrice"),
    t("sourceRoleAnnex"),
    t("sourceRoleArchive"),
  ];

  return (
    <>
      <section className="grid min-h-[calc(100svh-4rem)] items-center gap-12 py-14 lg:grid-cols-[minmax(0,.95fr)_minmax(32rem,1.05fr)] lg:py-20">
        <div className="flex flex-col gap-7">
          <p className="w-fit rounded-full border border-border px-3 py-1 text-xs font-medium text-foreground">
            {t("eyebrow")}
          </p>
          <h1 className="max-w-2xl text-[2.625rem] font-medium leading-[1.02] tracking-[-0.04em] text-balance sm:text-6xl">
            {t("headlineLead")}
            <span className="mt-2 block text-muted-foreground">{t("headlineTail")}</span>
          </h1>
          <p className="max-w-xl text-lg leading-8 text-foreground/75">{t("support")}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild className="h-11 w-full px-5 sm:w-auto">
              <Link href="/try">{t("openCorpus")}</Link>
            </Button>
            <Button variant="ghost" asChild className="h-11 w-full px-5 sm:w-auto">
              <a href="#demo">{t("seeDemo")}</a>
            </Button>
          </div>
          <dl className="grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
            <HeroFact value={t("heroFormatsValue")} label={t("heroFormatsLabel")} />
            <HeroFact value={t("heroObjectsValue")} label={t("heroObjectsLabel")} />
            <HeroFact value={t("heroEvidenceValue")} label={t("heroEvidenceLabel")} />
          </dl>
        </div>
        <div className="relative">
          <ProductVisual
            step="get"
            className="min-h-[30rem] p-5 sm:min-h-[34rem] sm:p-6"
            sourcesLabel={t("sourcesLabel")}
            sources={[]}
            sourceRoles={roles}
            modelLabel={t("exampleName")}
            counts={t("compiledCounts")}
            awaiting={t("awaitingModel")}
            resultLabel={t("resultLabel")}
            result={t("resultValue")}
            fictional={t("fictional")}
          />
          <div className="absolute -bottom-5 start-4 end-4 rounded-lg border border-border bg-background p-4 sm:start-auto sm:end-6 sm:w-80">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="size-1.5 rounded-full bg-primary" aria-hidden />
              {t("heroEvidenceSource")}
            </div>
            <p className="mt-2 font-mono text-sm">{t("heroEvidenceExcerpt")}</p>
          </div>
        </div>
      </section>

      <section id="product" className="py-20 lg:py-28">
        <div className="mb-10 grid gap-6 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)]">
          <p className="text-sm font-medium text-muted-foreground">{t("transformationEyebrow")}</p>
          <div>
            <h2 className="max-w-3xl text-3xl font-medium tracking-tight text-balance sm:text-5xl">
              {t("transformationTitle")}
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
              {t("transformationBody")}
            </p>
          </div>
        </div>
        <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-[minmax(0,.8fr)_4rem_minmax(0,1.2fr)] lg:gap-px">
          <div className="min-w-0 bg-[var(--elmorf-surface-1)] p-5 sm:p-7">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
              {t("beforeTitle")}
            </p>
            <ul className="grid gap-2">
              {t("sourceList").split("\n").map((name, index) => (
                <li
                  key={name}
                  className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-3 py-3"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="h-4 w-3 shrink-0 rounded-sm border border-border" aria-hidden />
                    <span className="truncate font-mono text-xs">{name}</span>
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">{roles[index]}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden items-center justify-center bg-[var(--elmorf-surface-2)] lg:flex">
            <span className="text-xl text-primary" aria-hidden>→</span>
          </div>
          <div className="min-w-0 bg-[var(--elmorf-surface-1)] p-5 sm:p-7">
            <div className="flex items-center justify-between gap-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                {t("afterTitle")}
              </p>
              <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                {t("modelReady")}
              </span>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <ModelFact label={t("modelFactIdentity")} value="Harbor & Pine Supplies" />
              <ModelFact label={t("modelFactContract")} value="MSA-1842" />
              <ModelFact label={t("modelFactInvoice")} value="INV-2041 · open" />
              <ModelFact label={t("modelFactEvidence")} value="pricing-2026.xlsx" />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-10 py-20 lg:grid-cols-[minmax(0,.78fr)_minmax(0,1.22fr)] lg:items-start lg:py-28">
        <div className="lg:sticky lg:top-24">
          <p className="text-sm font-medium text-muted-foreground">{t("proofEyebrow")}</p>
          <h2 className="mt-4 max-w-lg text-3xl font-medium tracking-tight text-balance sm:text-5xl">
            {t("proofTitle")}
          </h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">{t("proofBody")}</p>
          <Button asChild variant="outline" className="mt-7 h-10">
            <Link href={{ pathname: "/try", query: { object: "obj_inv_2041" } }}>
              {t("proofAction")}
            </Link>
          </Button>
        </div>
        <div className="overflow-hidden rounded-xl border border-border">
          <div className="border-b border-border bg-[var(--elmorf-surface-1)] p-5 sm:p-6">
            <p className="text-xs text-muted-foreground">{t("proofQueryLabel")}</p>
            <p className="mt-2 font-mono text-base">open invoices</p>
          </div>
          <div className="grid gap-px bg-border sm:grid-cols-2">
            <ProofPanel label={t("proofAnswerLabel")}>
              <p className="text-2xl font-medium">INV-2041</p>
              <p className="mt-1 text-sm text-muted-foreground">{t("proofAnswerValue")}</p>
              <p className="mt-5 text-xs text-muted-foreground">{t("proofRelation")}</p>
            </ProofPanel>
            <ProofPanel label={t("proofEvidenceLabel")}>
              <p className="font-mono text-xs text-muted-foreground">pricing-2026.xlsx</p>
              <p className="mt-3 font-mono text-sm">{t("heroEvidenceExcerpt")}</p>
              <p className="mt-5 text-xs text-muted-foreground">{t("proofTrace")}</p>
            </ProofPanel>
          </div>
        </div>
      </section>

      <SdkDemo
        title={t("demoTitle")}
        body={t("demoBody")}
        hint={t("demoHint")}
        exampleName={t("exampleName")}
        install={t("install")}
        snippet={t("snippet")}
        sourcesLabel={t("sourcesLabel")}
        sourceList={t("sourceList")}
        sourceRoles={roles}
        compiledCounts={t("compiledCounts")}
        awaitingModel={t("awaitingModel")}
        resultLabel={t("resultLabel")}
        resultValue={t("resultValue")}
        copyLabel={t("copy")}
        copiedLabel={t("copied")}
        copyErrorLabel={t("copyError")}
        codeLabel={t("codeLabel")}
        fictional={t("fictional")}
        pipeline={[
          { index: "1", title: t("loadTitle"), body: t("loadBody") },
          { index: "2", title: t("compileTitle"), body: t("compileBody") },
          { index: "3", title: t("getTitle"), body: t("getBody") },
        ]}
      />
      <section className="py-20 lg:py-28">
        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{t("useCasesEyebrow")}</p>
            <h2 className="mt-3 text-3xl font-medium tracking-tight sm:text-4xl">{t("useCasesTitle")}</h2>
          </div>
          <p className="max-w-lg text-sm leading-6 text-muted-foreground">{t("useCasesBody")}</p>
        </div>
        <ul className="grid gap-px overflow-hidden rounded-xl border border-border bg-border lg:grid-cols-3">
          {useCases.map(([titleKey, bodyKey, exampleKey, objectId]) => (
            <li key={titleKey} className="h-full">
              <Link
                href={{ pathname: "/try", query: { object: objectId } }}
                className="group flex h-full min-h-56 flex-col bg-background p-6 transition-colors duration-150 hover:bg-muted/50"
              >
                <p className="font-mono text-xs text-muted-foreground">{t(exampleKey)}</p>
                <h3 className="mt-8 text-xl font-medium">{t(titleKey)}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{t(bodyKey)}</p>
                <span className="mt-auto text-base transition-transform duration-150 group-hover:translate-x-1" aria-hidden>
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        id="try"
        className="mb-16 grid gap-8 rounded-xl border border-border bg-[var(--elmorf-surface-1)] p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-end"
      >
        <div>
          <p className="text-sm font-medium text-muted-foreground">{t("finalEyebrow")}</p>
          <h2 className="mt-4 max-w-3xl text-3xl font-medium tracking-tight text-balance sm:text-5xl">
            {t("tryTitle")}
          </h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{t("tryBody")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Button asChild className="h-11 w-full px-5 lg:w-auto">
            <Link href="/try">{t("openCorpus")}</Link>
          </Button>
          <Button variant="ghost" asChild className="h-11 w-full px-5 lg:w-auto">
            <a href={signIn}>{t("signInDemo")}</a>
          </Button>
        </div>
      </section>
    </>
  );
}

function HeroFact({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-background px-3 py-3">
      <dt className="text-sm font-medium">{value}</dt>
      <dd className="mt-0.5 text-xs text-muted-foreground">{label}</dd>
    </div>
  );
}

function ModelFact({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="size-1.5 rounded-full bg-primary" aria-hidden />
        {label}
      </div>
      <p className="mt-3 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function ProofPanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-h-60 bg-background p-5 sm:p-6">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <div className="mt-8">{children}</div>
    </div>
  );
}
