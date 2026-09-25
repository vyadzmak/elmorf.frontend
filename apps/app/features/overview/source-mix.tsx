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

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{title}</h2>
      <div className="flex h-2 overflow-hidden rounded-full bg-muted">
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
      <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {segments.map((segment) => (
          <li key={segment.key} className="flex items-center gap-1.5">
            <span className={`size-1.5 rounded-full ${segment.className}`} />
            {segment.label}
            <span className="tabular-nums text-foreground">{segment.count}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
