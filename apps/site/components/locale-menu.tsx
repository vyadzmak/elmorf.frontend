"use client";

import { isLocale, localeLabels, locales } from "@elmorf/i18n";
import { Button } from "@elmorf/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@elmorf/ui/components/ui/dropdown-menu";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

export function LocaleMenu() {
  const foundation = useTranslations("Foundation");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const active = isLocale(locale) ? locale : "en";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="px-2"
          aria-label={foundation("localeLabel")}
        >
          {localeLabels[active]}
          <ChevronIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto min-w-40">
        {locales.map((code) => (
          <DropdownMenuItem
            key={code}
            aria-current={code === active ? "true" : undefined}
            onSelect={() => {
              if (code !== active) {
                router.replace(pathname, { locale: code });
              }
            }}
          >
            {localeLabels[code]}
            {code === active ? <CheckIcon /> : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" fill="none" aria-hidden="true">
      <path d="M4 6.5 8 10.5 12 6.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" className="ms-auto size-3.5" fill="none" aria-hidden="true">
      <path d="M3.5 8.5 6.5 11.5 12.5 4.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
