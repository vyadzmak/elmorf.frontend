export function CompilationBoard({
  sameObjectLabel,
  sameFieldLabel,
  joinedLabel,
  keptLabel,
  unresolvedLabel,
  conflictTitle,
  companyLabel,
  contractLabel,
}: {
  sameObjectLabel: string;
  sameFieldLabel: string;
  joinedLabel: string;
  keptLabel: string;
  unresolvedLabel: string;
  conflictTitle: string;
  companyLabel: string;
  contractLabel: string;
}) {
  return (
    <div className="flex flex-col gap-12">
      <Merge
        kicker={sameObjectLabel}
        observations={[
          { value: "Harbor & Pine Supplies", source: "vendor-master.csv" },
          { value: "Harbor & Pine", source: "harbor-pine-master-services.pdf" },
        ]}
        result={
          <>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{companyLabel}</p>
            <p className="mt-1 text-[clamp(1.5rem,2vw,2rem)] font-medium leading-tight tracking-tight whitespace-nowrap">
              Harbor & Pine Supplies
            </p>
            <p className="mt-2 font-mono text-[15px]">
              <span className="text-muted-foreground">role</span>
              <span className="px-1.5 text-muted-foreground" aria-hidden>
                ·
              </span>
              <span className="text-primary">vendor</span>
            </p>
            <p className="mt-3 font-mono text-[12px] text-muted-foreground">{joinedLabel}</p>
          </>
        }
      />
      <Merge
        kicker={sameFieldLabel}
        observations={[
          { value: "2024-04-01", source: "harbor-pine-master-services.pdf" },
          { value: "—", source: "annex-b.docx", mark: true, caption: unresolvedLabel },
        ]}
        result={
          <>
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{contractLabel}</p>
            <p className="mt-1 text-[clamp(1.5rem,2vw,2rem)] font-medium leading-tight tracking-tight">MSA-1842</p>
            <p className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-primary">{conflictTitle}</p>
            <FieldSlots keptLabel={keptLabel} unresolvedLabel={unresolvedLabel} />
            <p className="mt-2 font-mono text-[12px] text-muted-foreground">annex-b.docx</p>
          </>
        }
      />
    </div>
  );
}

function FieldSlots({ keptLabel, unresolvedLabel }: { keptLabel: string; unresolvedLabel: string }) {
  return (
    <div className="mt-2 flex max-w-sm flex-col gap-1.5 text-sm">
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
  );
}

function Merge({
  kicker,
  observations,
  result,
}: {
  kicker: string;
  observations: { value: string; source: string; mark?: boolean; caption?: string }[];
  result: React.ReactNode;
}) {
  return (
    <div>
      <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">{kicker}</p>
      <div className="mt-4 flex flex-col gap-4 xl:flex-row xl:items-center xl:gap-0">
        <ul className="flex flex-col gap-3 xl:border-e xl:border-border xl:py-1">
          {observations.map((item, index) => (
            <li key={item.source} className="elmorf-merge flex items-center" style={{ animationDelay: `${index * 180}ms` }}>
              <div className="grid items-baseline gap-x-6 gap-y-0.5 sm:grid-cols-[16rem_max-content]">
                <p className={`text-base font-medium whitespace-nowrap sm:text-end ${item.mark ? "text-primary" : ""}`}>
                  {item.caption ? <span className="font-mono text-[12px]">{item.caption} </span> : null}
                  {item.value}
                </p>
                <p className="font-mono text-[13px] whitespace-nowrap text-muted-foreground sm:text-end">{item.source}</p>
              </div>
              <span className="elmorf-line hidden h-px w-10 shrink-0 bg-border xl:block" aria-hidden />
            </li>
          ))}
        </ul>
        <div className="flex items-center xl:-ms-px">
          <span className="hidden h-px w-8 bg-border xl:block" aria-hidden />
          <p className="font-mono text-base text-primary xl:px-3">compile()</p>
          <span className="hidden h-px w-8 bg-border xl:block" aria-hidden />
        </div>
        <div className="elmorf-seq min-w-0 xl:-ms-px xl:ps-4" style={{ animationDelay: "520ms" }}>
          {result}
        </div>
      </div>
    </div>
  );
}
