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
    <section className="flex w-full max-w-[400px] flex-col">
      <a
        href={process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001"}
        className="mb-10 flex w-fit items-center gap-2.5 text-sm font-medium"
      >
        <ElmorfMark className="size-7" />
        {brand}
      </a>
      <div className="rounded-xl border border-border bg-[var(--elmorf-surface-1)] p-6 sm:p-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-medium tracking-[-0.025em]">{title}</h1>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <div className="mt-7">
          {children}
        </div>
      </div>
    </section>
  );
}
