import { cn } from "@elmorf/ui/lib/utils";
import Link from "next/link";

export interface MetricItem {
  label: string;
  value: string;
  href: string;
}

export function MetricStrip({ items }: { items: MetricItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-y-5 sm:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex min-w-0 flex-col gap-1 border-s border-border px-4 first:border-s-0 first:ps-0",
            "group focus-visible:outline-none",
          )}
        >
          <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
            {item.label}
          </span>
          <span className="text-xl leading-tight font-medium tabular-nums tracking-tight transition-colors group-hover:text-primary sm:text-3xl">
            {item.value}
          </span>
        </Link>
      ))}
    </div>
  );
}
