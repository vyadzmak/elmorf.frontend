"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { cn } from "../lib/utils";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export type ThemeChoice = "light" | "dark" | "system";

const themeChoices = ["light", "dark", "system"] as const;

function isThemeChoice(value: string): value is ThemeChoice {
  return themeChoices.some((choice) => choice === value);
}

export function ThemeControl({
  label,
  options,
  onThemeChange,
  layout = "stack",
}: {
  label: string;
  options: { value: ThemeChoice; label: string }[];
  onThemeChange?: (theme: ThemeChoice) => void;
  layout?: "stack" | "row" | "segment";
}) {
  const { theme, setTheme, forcedTheme } = useTheme();
  const isClient = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  );
  const activeTheme = forcedTheme ?? theme;
  const value =
    isClient && activeTheme && isThemeChoice(activeTheme)
      ? activeTheme
      : "system";

  if (layout === "segment") {
    return (
      <div className="flex flex-wrap items-center gap-3">
        <p className="text-sm font-medium">{label}</p>
        <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg border border-border p-0.5">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={value === option.value}
              className={cn(
                "h-7 rounded-md px-2.5 text-sm transition-colors duration-150",
                value === option.value ? "bg-muted font-medium text-foreground" : "text-muted-foreground",
              )}
              onClick={() => {
                setTheme(option.value);
                onThemeChange?.(option.value);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <fieldset className={layout === "row" ? "flex flex-wrap items-center gap-3" : "flex flex-col gap-3"}>
      <legend className="text-sm font-medium">{label}</legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => {
          if (isThemeChoice(next)) {
            setTheme(next);
            onThemeChange?.(next);
          }
        }}
        className={layout === "row" ? "flex flex-row flex-wrap gap-3" : "gap-3"}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 text-sm text-foreground"
          >
            <RadioGroupItem value={option.value} />
            {option.label}
          </label>
        ))}
      </RadioGroup>
    </fieldset>
  );
}
