export interface HealthRow {
  label: string;
  value: string;
}

export function ProjectHealth({
  title,
  rows,
}: {
  title: string;
  rows: HealthRow[];
}) {
  return (
    <section className="flex flex-col rounded-xl border border-border bg-[var(--elmorf-surface-1)] p-5">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
      <dl className="mt-5 flex flex-col divide-y divide-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-sm font-medium">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
