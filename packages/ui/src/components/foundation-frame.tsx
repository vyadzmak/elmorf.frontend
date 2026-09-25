import type { ReactNode } from "react";
import { ElmorfMark } from "./elmorf-mark";

export function FoundationFrame({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto flex w-full max-w-xl flex-col gap-8 px-6 py-16">
      <header className="flex flex-col gap-3">
        <ElmorfMark className="size-8 text-primary" />
        <h1 className="text-[1.75rem] font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </header>
      {children}
    </main>
  );
}
