"use client";

import { Button } from "@elmorf/ui/components/ui/button";
import { cn } from "@elmorf/ui/lib/utils";
import { useState } from "react";
import { LazyProductVisual } from "@/components/landing/lazy-product-visual";
import type { DemoStep } from "@/components/landing/product-visual";

const steps: DemoStep[] = ["load", "compile", "get"];

export function SdkDemo({
  title,
  body,
  exampleName,
  install,
  snippet,
  sourcesLabel,
  sourceList,
  sourceRoles,
  compiledCounts,
  awaitingModel,
  resultLabel,
  resultValue,
  copyLabel,
  copiedLabel,
  copyErrorLabel,
  codeLabel,
  hint,
  fictional,
  pipeline,
}: {
  title: string;
  body: string;
  exampleName: string;
  install: string;
  snippet: string;
  sourcesLabel: string;
  sourceList: string;
  sourceRoles: string[];
  compiledCounts: string;
  awaitingModel: string;
  resultLabel: string;
  resultValue: string;
  copyLabel: string;
  copiedLabel: string;
  copyErrorLabel: string;
  codeLabel: string;
  hint: string;
  fictional: string;
  pipeline: { index: string; title: string; body: string }[];
}) {
  const [step, setStep] = useState<DemoStep>("compile");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const lines = snippet.split("\n");
  const sources = sourceList.split("\n").filter((name) => name.length > 0);

  return (
    <section id="demo" className="flex scroll-mt-20 flex-col gap-8 py-20 lg:py-28">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)]">
        <p className="text-sm font-medium text-muted-foreground">{hint}</p>
        <div>
          <h2 className="text-3xl font-medium tracking-tight text-balance sm:text-5xl">{title}</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">{body}</p>
        </div>
      </div>
      <ol className="grid gap-px overflow-hidden rounded-xl border border-border bg-border md:grid-cols-3">
        {pipeline.map((item, index) => {
          const active = steps[index] === step;
          return (
            <li key={item.index}>
              <button
                type="button"
                aria-pressed={active}
                className={cn(
                  "flex h-full w-full flex-col bg-background p-5 text-start transition-colors duration-150 hover:bg-muted/50",
                  active && "bg-muted",
                )}
                onClick={() => {
                  const value = steps[index];
                  if (value) setStep(value);
                }}
              >
                <p className="font-mono text-xs text-muted-foreground">{item.index}</p>
                <h3 className="mt-4 text-base font-medium">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.body}</p>
              </button>
            </li>
          );
        })}
      </ol>
      <div className="grid min-w-0 grid-cols-[minmax(0,1fr)] gap-4 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
        <div className="order-2 min-w-0 flex flex-col gap-3 lg:order-1">
          <p className="font-mono text-xs text-muted-foreground">{install}</p>
          <div className="flex min-h-80 flex-col gap-3 rounded-xl border border-border bg-[var(--elmorf-code-surface)] p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="sr-only">{codeLabel}</p>
              <p className="text-xs text-muted-foreground" aria-live="polite">
                {copyState === "copied" ? copiedLabel : copyState === "error" ? copyErrorLabel : ""}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard.writeText(snippet).then(
                    () => {
                      setCopyState("copied");
                    },
                    () => {
                      setCopyState("error");
                    },
                  );
                }}
              >
                {copyLabel}
              </Button>
            </div>
            <pre className="mt-4 overflow-x-auto font-mono text-sm leading-8 whitespace-pre">
              {lines.map((line, index) => (
                <code
                  key={`${index}-${line}`}
                  className={cn(
                    "block px-2",
                    isActiveLine(step, line) && "bg-[var(--elmorf-brass-soft)]",
                  )}
                >
                  {line.length > 0 ? line : " "}
                </code>
              ))}
            </pre>
          </div>
        </div>
        <div className="order-1 min-w-0 flex flex-col gap-3 lg:order-2">
          <LazyProductVisual
            step={step}
            className="min-h-80 p-5"
            sourcesLabel={`${sourcesLabel} · ${sources.length}`}
            sources={sources}
            sourceRoles={sourceRoles}
            modelLabel={exampleName}
            fictional={fictional}
            counts={compiledCounts}
            awaiting={awaitingModel}
            resultLabel={resultLabel}
            result={resultValue}
          />
        </div>
      </div>
    </section>
  );
}

function isActiveLine(step: DemoStep, line: string): boolean {
  if (step === "load") {
    return line.includes(".load(");
  }
  if (step === "compile") {
    return line.includes(".compile(");
  }
  return line.includes(".get(");
}
