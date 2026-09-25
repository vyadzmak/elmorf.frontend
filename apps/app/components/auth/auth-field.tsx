"use client";

import { Button } from "@elmorf/ui/components/ui/button";
import { Input } from "@elmorf/ui/components/ui/input";
import { cn } from "@elmorf/ui/lib/utils";
import { useTranslations } from "next-intl";
import { useState, type ComponentProps } from "react";

export function AuthField({
  label,
  error,
  id,
  type,
  className,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  error?: string;
}) {
  const t = useTranslations("Auth");
  const errorId = `${id}-error`;
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <div className="relative">
        <Input
          id={id}
          type={isPassword && visible ? "text" : type}
          className={cn("h-10", className)}
          {...(error
            ? { "aria-invalid": true as const, "aria-describedby": errorId }
            : {})}
          {...props}
        />
        {isPassword ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute end-1 top-1/2 h-7 -translate-y-1/2 px-2 text-xs"
            onClick={() => {
              setVisible((current) => !current);
            }}
          >
            {visible ? t("hidePassword") : t("showPassword")}
          </Button>
        ) : null}
      </div>
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
