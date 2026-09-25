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
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{title}</h2>
      <dl className="flex flex-col divide-y divide-border rounded-lg border border-border">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-sm">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
