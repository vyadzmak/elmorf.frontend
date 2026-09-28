export function LegalDocument({
  title,
  lead,
  sections,
}: {
  title: string;
  lead: string;
  sections: { title: string; body: string }[];
}) {
  return (
    <article className="mx-auto w-full max-w-2xl py-16">
      <h1 className="text-3xl font-medium tracking-tight">{title}</h1>
      <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{lead}</p>
      <div className="mt-10 flex flex-col gap-8">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-medium">{section.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{section.body}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
