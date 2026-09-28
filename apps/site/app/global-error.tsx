"use client";

import { reportError } from "@elmorf/config/report-error";
import { crashCopy, isLocale, type Locale } from "@elmorf/i18n";
import { useEffect } from "react";

function readLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const segment = window.location.pathname.split("/").find((part) => part.length > 0);
  return isLocale(segment) ? segment : "en";
}

function readThemeClass(): string {
  if (typeof window === "undefined") return "";

  const stored = window.localStorage.getItem("theme");
  if (stored === "dark") return "dark";
  if (stored === "light") return "";

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "";
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const copy = crashCopy(readLocale());

  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <html lang={readLocale()} className={readThemeClass()} suppressHydrationWarning>
      <body>
        <style>{crashCss}</style>
        <main>
          <h1 suppressHydrationWarning>{copy.title}</h1>
          <p suppressHydrationWarning>{copy.description}</p>
          <button type="button" onClick={() => reset()} suppressHydrationWarning>
            {copy.retry}
          </button>
        </main>
      </body>
    </html>
  );
}

// Replaces the root layout, so globals.css cannot be imported here. A static
// import registers a CSS chunk that Turbopack hot-reloads on pages where that
// stylesheet link is not mounted.
const crashCss = `
  :root { color-scheme: light; background: #f4f2ee; color: #191b1d; }
  :root.dark { color-scheme: dark; background: #111315; color: #e8e6e3; }
  body { margin: 0; min-height: 100%; font-family: Geist, ui-sans-serif, system-ui, sans-serif; }
  main { box-sizing: border-box; max-width: 36rem; margin: 0 auto; display: flex; flex-direction: column; gap: 0.75rem; padding: 4rem 1.5rem; }
  h1 { margin: 0; font-size: 1.75rem; font-weight: 600; letter-spacing: -0.025em; }
  p { margin: 0; font-size: 0.875rem; line-height: 1.5; color: #6f6a63; }
  :root.dark p { color: #a6a19a; }
  button { width: fit-content; border: 0; border-radius: 0.5rem; background: #c89b45; color: #151719; padding: 0.375rem 0.75rem; font: inherit; font-size: 0.875rem; cursor: pointer; }
  :root.dark button { color: #111315; }
`;
