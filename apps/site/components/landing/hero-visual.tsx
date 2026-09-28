import { ElmorfMark } from "@elmorf/ui/components/elmorf-mark";

export function HeroVisual({
  sourcesLabel,
  modelLabel,
  compileLabel,
  inputs,
  outputs,
}: {
  sourcesLabel: string;
  modelLabel: string;
  compileLabel: string;
  inputs: string[];
  outputs: string[];
}) {
  return (
    <div className="flex min-w-0 flex-col items-stretch gap-5 sm:flex-row sm:items-center sm:gap-0">
      <div className="min-w-0 sm:shrink-0">
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">{sourcesLabel}</p>
        <ul className="mt-3 flex flex-col gap-2 sm:items-end sm:border-e sm:border-border sm:py-1">
          {inputs.map((input, index) => (
            <li key={input} className="elmorf-seq flex items-center" style={{ animationDelay: `${index * 120}ms` }}>
              <span className="rounded-lg border border-border bg-[var(--elmorf-surface-1)] px-3 py-2 text-[15px] leading-5">
                {input}
              </span>
              <span
                className="elmorf-line hidden h-px w-8 shrink-0 bg-border sm:block"
                style={{ animationDelay: `${480 + index * 80}ms` }}
                aria-hidden
              />
            </li>
          ))}
        </ul>
      </div>
      <div className="flex items-center sm:-ms-px sm:shrink-0">
        <span className="elmorf-line hidden h-px w-8 bg-border sm:block" aria-hidden />
        <div
          className="elmorf-seq elmorf-pulse flex w-fit flex-col items-center gap-2 rounded-2xl border border-primary/50 bg-[var(--elmorf-surface-2)] px-4 py-4"
          style={{ animationDelay: "980ms" }}
        >
          <ElmorfMark className="size-8 text-primary" />
          <p className="font-mono text-sm text-primary">{compileLabel}</p>
        </div>
        <span className="elmorf-line hidden h-px w-10 bg-border sm:block" aria-hidden />
      </div>
      <div
        className="elmorf-seq min-w-0 flex-1 rounded-xl border border-border bg-[var(--elmorf-surface-1)] p-4 sm:-ms-px sm:p-5"
        style={{ animationDelay: "1280ms" }}
      >
        <p className="font-mono text-[12px] uppercase tracking-[0.14em] text-muted-foreground">{modelLabel}</p>
        <ul className="mt-4">
          {outputs.map((output, index) => (
            <li key={output} className="flex min-w-0 items-stretch gap-3">
              <span className="flex w-2.5 shrink-0 flex-col items-center" aria-hidden>
                <span className={`w-px flex-1 ${index === 0 ? "bg-transparent" : "bg-border"}`} />
                <span className="size-2 shrink-0 rounded-full border-2 border-foreground bg-[var(--elmorf-surface-1)]" />
                <span className={`w-px flex-1 ${index === outputs.length - 1 ? "bg-transparent" : "bg-border"}`} />
              </span>
              <span className="min-w-0 py-1.5 text-[15px] font-medium leading-6">{output}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
