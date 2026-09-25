"use client";

import { PasswordResetInputSchema, type PasswordResetInput } from "@elmorf/domain";
import { Button } from "@elmorf/ui/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMockReady } from "@/components/app-providers";
import { useApiClient } from "@/lib/use-api";
import { AuthField } from "./auth-field";
import { AuthFrame } from "./auth-frame";

export function ResetPanel() {
  const t = useTranslations("Auth");
  const ready = useMockReady();
  const api = useApiClient();
  const [accepted, setAccepted] = useState(false);
  const form = useForm<PasswordResetInput>({
    defaultValues: { email: "" },
  });
  const reset = useMutation({
    mutationFn: (input: PasswordResetInput) => api.auth.requestPasswordReset(input),
    onSuccess: () => {
      setAccepted(true);
    },
    onError: () => {
      setAccepted(false);
      form.setError("root", { message: t("requestFailed") });
    },
  });

  function onSubmit(values: PasswordResetInput) {
    setAccepted(false);
    form.clearErrors("root");
    const parsed = PasswordResetInputSchema.safeParse(values);
    if (!parsed.success) {
      form.setError("email", { message: t("emailInvalid") });
      return;
    }

    reset.mutate(parsed.data);
  }

  const emailError = form.formState.errors.email?.message;
  const rootError = form.formState.errors.root?.message;

  return (
    <AuthFrame title={t("resetTitle")} description={t("resetDescription")}>
      <form className="flex flex-col gap-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
        <AuthField
          id="email"
          label={t("email")}
          type="email"
          autoComplete="email"
          {...(emailError ? { error: emailError } : {})}
          {...form.register("email")}
        />
        {accepted ? (
          <p className="text-sm text-muted-foreground" role="status">
            {t("resetAccepted")}
          </p>
        ) : null}
        {rootError ? (
          <p className="text-sm text-destructive" role="alert">
            {rootError}
          </p>
        ) : null}
        <Button type="submit" className="h-10" disabled={!ready || reset.isPending}>
          {t("resetTitle")}
        </Button>
        <Link href="/login" className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
          {t("backToSignIn")}
        </Link>
      </form>
    </AuthFrame>
  );
}
