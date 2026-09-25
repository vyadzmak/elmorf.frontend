"use client";

import { ElmorfApiError, sessionOptions } from "@elmorf/api-client";
import { DEMO_EMAIL, DEMO_PASSWORD, SignInInputSchema, type SignInInput } from "@elmorf/domain";
import { Button } from "@elmorf/ui/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMockReady } from "@/components/app-providers";
import { useApiClient } from "@/lib/use-api";
import { AuthField } from "./auth-field";
import { AuthFrame } from "./auth-frame";

export function SignInPanel() {
  const t = useTranslations("Auth");
  const signInLabel = useTranslations("Foundation")("signIn");
  const router = useRouter();
  const ready = useMockReady();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const form = useForm<SignInInput>({
    defaultValues: { email: DEMO_EMAIL, password: DEMO_PASSWORD },
  });
  const sessionQuery = useQuery({
    ...sessionOptions(api),
    enabled: ready,
  });
  const signedIn = sessionQuery.isSuccess && sessionQuery.data !== null;
  const signIn = useMutation({
    mutationFn: (input: SignInInput) => api.auth.signIn(input),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionOptions(api).queryKey, session);
      router.replace("/");
    },
    onError: (error) => {
      const invalid =
        error instanceof ElmorfApiError && error.code === "invalid_credentials";
      form.setError("root", {
        message: invalid ? t("invalidCredentials") : t("requestFailed"),
      });
    },
  });

  useEffect(() => {
    if (signedIn) {
      router.replace("/");
    }
  }, [router, signedIn]);

  function onSubmit(values: SignInInput) {
    form.clearErrors("root");
    const parsed = SignInInputSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "email") {
          form.setError("email", { message: t("emailInvalid") });
        }
        if (field === "password") {
          form.setError("password", { message: t("passwordRequired") });
        }
      }
      return;
    }

    signIn.mutate(parsed.data);
  }

  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const rootError = form.formState.errors.root?.message;

  return (
    <AuthFrame title={t("signInTitle")} description={t("signInDescription")}>
      {signedIn ? null : (
        <form
          className="flex flex-col gap-4"
          noValidate
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <AuthField
            id="email"
            label={t("email")}
            type="email"
            autoComplete="email"
            {...(emailError ? { error: emailError } : {})}
            {...form.register("email")}
          />
          <AuthField
            id="password"
            label={t("password")}
            type="password"
            autoComplete="current-password"
            {...(passwordError ? { error: passwordError } : {})}
            {...form.register("password")}
          />
          {rootError ? (
            <p className="text-sm text-destructive" role="alert">
              {rootError}
            </p>
          ) : null}
          <Button type="submit" disabled={!ready || signIn.isPending}>
            {signInLabel}
          </Button>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/forgot-password" className="text-muted-foreground underline-offset-4 hover:underline">
              {t("forgotPassword")}
            </Link>
            <Link href="/signup" className="underline-offset-4 hover:underline">
              {t("createAccount")}
            </Link>
          </div>
        </form>
      )}
    </AuthFrame>
  );
}
