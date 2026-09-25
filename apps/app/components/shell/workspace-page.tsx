export function WorkspacePage({
  title,
  description,
  actions,
  quiet = false,
  children,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  quiet?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-6 overflow-auto px-5 py-6 lg:px-8 lg:py-8">
      {quiet ? (
        <h1 className="sr-only">{title}</h1>
      ) : (
        <header className="flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-medium tracking-[-0.025em] sm:text-3xl">{title}</h1>
            {description ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      )}
      {children}
    </div>
  );
}
