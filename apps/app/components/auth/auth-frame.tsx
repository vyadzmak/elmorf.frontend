"use client";

import { ElmorfMark } from "@elmorf/ui/components/elmorf-mark";
import { useTranslations } from "next-intl";

export function AuthFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const brand = useTranslations("Shell")("brand");

  return (
    <section className="flex w-full max-w-[400px] flex-col gap-6">
      <div className="flex items-center gap-2 text-sm font-medium">
        <ElmorfMark className="size-5" />
        {brand}
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-lg font-medium tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}
