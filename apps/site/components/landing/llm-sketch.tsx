export function LlmSketch({
  llmLabel,
  elmorfLabel,
  documentLabel,
  promptLabel,
  structureLabel,
  observationsLabel,
}: {
  llmLabel: string;
  elmorfLabel: string;
  documentLabel: string;
  promptLabel: string;
  structureLabel: string;
  observationsLabel: string;
}) {
  const files = ["pdf", "csv", "xlsx", "docx", "zip"];

  return (
    <div className="mt-5 grid gap-6 border-t border-border pt-5 lg:grid-cols-2 lg:gap-10">
      <div>
        <p className="text-[15px] leading-6 text-foreground/80">{llmLabel}</p>
        <div className="mt-3 flex items-stretch gap-3">
          <span className="flex w-2.5 shrink-0 flex-col items-center self-stretch" aria-hidden>
            <span className="mt-1.5 size-2 shrink-0 rounded-full border-2 border-foreground" />
            <span className="min-h-10 w-px flex-1 bg-border" />
          </span>
          <div className="flex flex-col gap-3 pb-1">
            <p className="text-[15px] font-medium leading-6">{documentLabel}</p>
            <p className="font-mono text-[12px] text-muted-foreground">{promptLabel}</p>
            <p className="font-mono text-[13px] text-muted-foreground">{structureLabel}</p>
          </div>
        </div>
      </div>
      <div>
        <p className="text-[15px] font-medium leading-6">{elmorfLabel}</p>
        <p className="mt-3 flex flex-wrap items-center gap-1.5 font-mono text-[12px] text-muted-foreground">
          {files.map((file, index) => (
            <span key={file} className="inline-flex items-center gap-1.5">
              {index > 0 ? <span aria-hidden>·</span> : null}
              {file}
            </span>
          ))}
        </p>
        <p className="mt-3 flex items-center gap-3 font-mono text-[12px] text-muted-foreground">
          <span className="h-px w-8 bg-border" aria-hidden />
          {observationsLabel}
          <span className="h-px w-8 bg-border" aria-hidden />
          <span className="text-primary">compile()</span>
        </p>
        <p className="mt-3 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-[15px] leading-6">
          <span className="font-medium">MSA-1842</span>
          <span className="font-mono text-[11px] text-muted-foreground">
            BELONGS_TO <span aria-hidden>→</span>
          </span>
          <span className="font-medium">Harbor & Pine Supplies</span>
        </p>
      </div>
    </div>
  );
}
