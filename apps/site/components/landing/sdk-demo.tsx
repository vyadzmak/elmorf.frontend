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
  stepLabels,
  sourcesLabel,
  sourceList,
  compiledCounts,
  awaitingModel,
  resultLabel,
  resultValue,
  copyLabel,
  copiedLabel,
  copyErrorLabel,
  codeLabel,
}: {
  title: string;
  body: string;
  exampleName: string;
  install: string;
  snippet: string;
  stepLabels: Record<DemoStep, string>;
  sourcesLabel: string;
  sourceList: string;
  compiledCounts: string;
  awaitingModel: string;
  resultLabel: string;
  resultValue: string;
  copyLabel: string;
  copiedLabel: string;
  copyErrorLabel: string;
  codeLabel: string;
}) {
  const [step, setStep] = useState<DemoStep>("load");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const lines = snippet.split("\n");
  const sources = sourceList.split("\n").filter((name) => name.length > 0);

  return (
    <section id="demo" className="flex flex-col gap-6 border-t border-border py-16">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl font-medium tracking-tight">{title}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground">{body}</p>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={title}>
        {steps.map((value) => (
          <Button
            key={value}
            variant={value === step ? "default" : "outline"}
            onClick={() => {
              setStep(value);
            }}
          >
            {stepLabels[value]}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-[var(--elmorf-code-surface)] p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-xs text-muted-foreground">{install}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                void navigator.clipboard.writeText(`${install}\n\n${snippet}`).then(
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
          <p className="sr-only">{codeLabel}</p>
          <pre className="overflow-x-auto font-mono text-xs leading-6">
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
          <p className="text-xs text-muted-foreground" aria-live="polite">
            {copyState === "copied" ? copiedLabel : copyState === "error" ? copyErrorLabel : ""}
          </p>
        </div>
        <LazyProductVisual
          step={step}
          sourcesLabel={`${sourcesLabel} · ${sources.length}`}
          sources={sources}
          modelLabel={exampleName}
          counts={compiledCounts}
          awaiting={awaitingModel}
          resultLabel={resultLabel}
          result={resultValue}
        />
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
