import Link from "next/link";

export interface ActivityItem {
  id: string;
  href: string;
  mark: string;
  title: string;
  detail: string;
}

export function RecentActivity({
  title,
  items,
  empty,
}: {
  title: string;
  items: ActivityItem[];
  empty: string;
}) {
  return (
    <section className="flex flex-col">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="mt-4 flex flex-col divide-y divide-border rounded-xl border border-border bg-[var(--elmorf-surface-1)]">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-muted/50"
              >
                <span className="flex min-w-0 flex-col gap-1">
                  <span className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
                    {item.mark}
                  </span>
                  <span className="truncate text-sm font-medium">{item.title}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{item.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
