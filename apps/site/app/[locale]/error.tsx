"use client";

import { reportError } from "@elmorf/config/report-error";
import { Button } from "@elmorf/ui/components/ui/button";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("Foundation");

  useEffect(() => {
    reportError(error);
  }, [error]);

  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-3 px-6 py-16">
      <h1 className="text-[1.75rem] font-semibold tracking-tight">{t("errorTitle")}</h1>
      <p className="text-sm text-muted-foreground">{t("errorDescription")}</p>
      <Button type="button" className="w-fit" onClick={() => reset()}>
        {t("errorRetry")}
      </Button>
    </main>
  );
}
