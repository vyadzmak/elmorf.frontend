export function WorkspacePage({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto px-6 py-6">
      <h1 className="text-lg font-medium tracking-tight">{title}</h1>
      {children}
    </div>
  );
}
