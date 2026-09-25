export function SettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h2 className="text-xl font-medium tracking-tight">{title}</h2>
        {description ? (
          <p className="max-w-prose text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function SettingRow({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-border py-5">
      <div className="flex flex-col gap-1">
        <p className="text-sm font-medium">{label}</p>
        {description ? (
          <p className="max-w-prose text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </div>
  );
}
