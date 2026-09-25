import { Button } from "@elmorf/ui/components/ui/button";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SdkDemo } from "@/components/landing/sdk-demo";
import { appSignInHref } from "@/lib/app-link";

const useCases = [
  ["useCaseContractsTitle", "useCaseContractsBody"],
  ["useCaseProductsTitle", "useCaseProductsBody"],
  ["useCaseCrmTitle", "useCaseCrmBody"],
  ["useCaseEntitiesTitle", "useCaseEntitiesBody"],
  ["useCaseKnowledgeTitle", "useCaseKnowledgeBody"],
  ["useCaseReconcileTitle", "useCaseReconcileBody"],
] as const;

export async function LandingPage() {
  const t = await getTranslations("Landing");
  const locale = await getLocale();
  const signIn = appSignInHref(locale);

  return (
    <>
      <section className="flex flex-col gap-6 py-16 md:py-24">
        <h1 className="max-w-3xl text-4xl font-medium tracking-tight md:text-5xl">
          {t("headlineLead")}
          <span className="mt-1 block">{t("headlineTail")}</span>
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">{t("support")}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/try">{t("try")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href="#demo">{t("seeDemo")}</a>
          </Button>
        </div>
      </section>
      <section className="flex flex-col gap-3 border-t border-border py-16">
        <h2 className="text-xl font-medium tracking-tight">{t("whatTitle")}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("whatBody")}</p>
      </section>
      <section className="flex flex-col gap-6 border-t border-border py-16">
        <h2 className="text-xl font-medium tracking-tight">{t("pipelineTitle")}</h2>
        <ol className="grid gap-6 md:grid-cols-3">
          <PipelineStep index="1" title={t("loadTitle")} body={t("loadBody")} />
          <PipelineStep index="2" title={t("compileTitle")} body={t("compileBody")} />
          <PipelineStep index="3" title={t("getTitle")} body={t("getBody")} />
        </ol>
      </section>
      <SdkDemo
        title={t("demoTitle")}
        body={t("demoBody")}
        exampleName={t("exampleName")}
        install={t("install")}
        snippet={t("snippet")}
        stepLabels={{
          load: t("stepLoad"),
          compile: t("stepCompile"),
          get: t("stepGet"),
        }}
        sourcesLabel={t("sourcesLabel")}
        sourceList={t("sourceList")}
        compiledCounts={t("compiledCounts")}
        awaitingModel={t("awaitingModel")}
        resultLabel={t("resultLabel")}
        resultValue={t("resultValue")}
        copyLabel={t("copy")}
        copiedLabel={t("copied")}
        copyErrorLabel={t("copyError")}
        codeLabel={t("codeLabel")}
      />
      <section className="flex flex-col gap-6 border-t border-border py-16">
        <h2 className="text-xl font-medium tracking-tight">{t("useCasesTitle")}</h2>
        <ul className="grid gap-6 sm:grid-cols-2">
          {useCases.map(([titleKey, bodyKey]) => (
            <li key={titleKey} className="flex flex-col gap-1">
              <h3 className="text-sm font-medium">{t(titleKey)}</h3>
              <p className="text-sm text-muted-foreground">{t(bodyKey)}</p>
            </li>
          ))}
        </ul>
      </section>
      <section id="try" className="flex flex-col gap-4 border-t border-border py-16">
        <h2 className="text-xl font-medium tracking-tight">{t("tryTitle")}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{t("tryBody")}</p>
        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/try">{t("try")}</Link>
          </Button>
          <Button variant="outline" asChild>
            <a href={signIn}>{t("ownData")}</a>
          </Button>
        </div>
      </section>
    </>
  );
}

function PipelineStep({
  index,
  title,
  body,
}: {
  index: string;
  title: string;
  body: string;
}) {
  return (
    <li className="flex flex-col gap-2">
      <p className="font-mono text-xs text-muted-foreground">{index}</p>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{body}</p>
    </li>
  );
}
