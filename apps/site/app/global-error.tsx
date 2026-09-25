"use client";

import { reportError } from "@elmorf/config/report-error";
import { crashCopy, isLocale, type Locale } from "@elmorf/i18n";
import { useEffect } from "react";
import "./globals.css";

function readLocale(): Locale {
  if (typeof window === "undefined") {
    return "en";
  }

  const segment = window.location.pathname.split("/").find((part) => part.length > 0);
  return isLocale(segment) ? segment : "en";
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
    <html lang={readLocale()}>
      <body className="min-h-full bg-background font-sans text-foreground">
        <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-6 py-16">
          <h1 className="text-[1.75rem] font-semibold tracking-tight" suppressHydrationWarning>
            {copy.title}
          </h1>
          <p className="text-sm text-muted-foreground" suppressHydrationWarning>
            {copy.description}
          </p>
          <button
            type="button"
            className="w-fit rounded-lg bg-primary px-3 py-1.5 text-sm text-primary-foreground"
            onClick={() => reset()}
            suppressHydrationWarning
          >
            {copy.retry}
          </button>
        </main>
      </body>
    </html>
  );
}
