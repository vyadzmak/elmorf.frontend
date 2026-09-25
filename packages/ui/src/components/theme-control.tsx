"use client";

import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
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
}: {
  label: string;
  options: { value: ThemeChoice; label: string }[];
  onThemeChange?: (theme: ThemeChoice) => void;
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

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium">{label}</legend>
      <RadioGroup
        value={value}
        onValueChange={(next) => {
          if (isThemeChoice(next)) {
            setTheme(next);
            onThemeChange?.(next);
          }
        }}
        className="gap-3"
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
