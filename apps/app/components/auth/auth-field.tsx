import { Input } from "@elmorf/ui/components/ui/input";
import type { ComponentProps } from "react";

export function AuthField({
  label,
  error,
  id,
  ...props
}: ComponentProps<typeof Input> & {
  label: string;
  error?: string;
}) {
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm">
        {label}
      </label>
      <Input
        id={id}
        {...(error
          ? { "aria-invalid": true as const, "aria-describedby": errorId }
          : {})}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
