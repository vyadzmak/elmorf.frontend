import { cn } from "@elmorf/ui/lib/utils";
import Link from "next/link";

export interface MetricItem {
  label: string;
  value: string;
  href: string;
}

export function MetricStrip({ items }: { items: MetricItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
      {items.map((item) => (
        <Link
          key={item.label}
          href={item.href}
          className={cn(
            "flex flex-col gap-1 bg-background px-4 py-3",
            "hover:bg-muted/60",
          )}
        >
          <span className="text-xs text-muted-foreground">{item.label}</span>
          <span className="text-lg font-medium tabular-nums">{item.value}</span>
        </Link>
      ))}
    </div>
  );
}
