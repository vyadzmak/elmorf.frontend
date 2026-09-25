import { localeLabels, locales } from "@elmorf/i18n";
import { Button } from "@elmorf/ui/components/ui/button";
import { Link } from "@/i18n/navigation";

export function LocaleSwitcher({
  activeLocale,
  label,
  inline = false,
}: {
  activeLocale: string;
  label: string;
  inline?: boolean;
}) {
  const links = locales.map((code) => (
    <Button
      key={code}
      variant={code === activeLocale ? "default" : "outline"}
      size={inline ? "sm" : "default"}
      asChild
    >
      <Link href="/" locale={code}>
        {localeLabels[code]}
      </Link>
    </Button>
  ));

  if (inline) {
    return (
      <div className="flex gap-2" role="group" aria-label={label}>
        {links}
      </div>
    );
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">{label}</h2>
      <div className="flex gap-2">{links}</div>
    </section>
  );
}
