export interface SourceMixSegment {
  key: string;
  label: string;
  count: number;
  className: string;
}

export function SourceMix({
  title,
  segments,
}: {
  title: string;
  segments: SourceMixSegment[];
}) {
  const total = segments.reduce((sum, segment) => sum + segment.count, 0);
  const active = segments.filter((segment) => segment.count > 0);

  return (
    <section className="flex flex-col rounded-xl border border-border bg-[var(--elmorf-surface-1)] p-5">
      <h2 className="text-lg font-medium tracking-tight">{title}</h2>
      {active.length > 1 ? (
        <div className="mt-6 flex h-2 overflow-hidden rounded-full bg-muted">
          {segments.map((segment) =>
            segment.count > 0 ? (
              <div
                key={segment.key}
                className={segment.className}
                style={{ width: `${(segment.count / total) * 100}%` }}
              />
            ) : null,
          )}
        </div>
      ) : (
        <p className="mt-5 text-2xl font-medium">
          {active[0] ? `${active[0].label} ${active[0].count}` : title}
        </p>
      )}
      {active.length > 1 ? (
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
          {segments.map((segment) => (
            <li key={segment.key} className="flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full ${segment.className}`} />
              {segment.label}
              <span className="tabular-nums text-foreground">{segment.count}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
