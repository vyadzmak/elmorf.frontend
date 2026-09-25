import Link from "next/link";

export interface ActivityItem {
  id: string;
  href: string;
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
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{title}</h2>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <ul className="flex flex-col divide-y divide-border rounded-lg border border-border">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className="flex items-baseline justify-between gap-4 px-4 py-2.5 hover:bg-muted/60"
              >
                <span className="truncate text-sm">{item.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{item.detail}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
