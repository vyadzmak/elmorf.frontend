"use client";

import { sessionOptions } from "@elmorf/api-client";
import { SignUpInputSchema, type SignUpInput } from "@elmorf/domain";
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

export function SignUpPanel() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const ready = useMockReady();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const form = useForm<SignUpInput>({
    defaultValues: { name: "", email: "", password: "" },
  });
  const sessionQuery = useQuery({
    ...sessionOptions(api),
    enabled: ready,
  });
  const signedIn = sessionQuery.isSuccess && sessionQuery.data !== null;
  const signUp = useMutation({
    mutationFn: (input: SignUpInput) => api.auth.signUp(input),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionOptions(api).queryKey, session);
      router.replace("/");
    },
    onError: () => {
      form.setError("root", { message: t("requestFailed") });
    },
  });

  useEffect(() => {
    if (signedIn) {
      router.replace("/");
    }
  }, [router, signedIn]);

  function onSubmit(values: SignUpInput) {
    form.clearErrors("root");
    const parsed = SignUpInputSchema.safeParse(values);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const field = issue.path[0];
        if (field === "name") {
          form.setError("name", { message: t("nameRequired") });
        }
        if (field === "email") {
          form.setError("email", { message: t("emailInvalid") });
        }
        if (field === "password") {
          form.setError("password", { message: t("passwordRequired") });
        }
      }
      return;
    }

    signUp.mutate(parsed.data);
  }

  const nameError = form.formState.errors.name?.message;
  const emailError = form.formState.errors.email?.message;
  const passwordError = form.formState.errors.password?.message;
  const rootError = form.formState.errors.root?.message;

  return (
    <AuthFrame title={t("signUpTitle")} description={t("signUpDescription")}>
      {signedIn ? null : (
        <form className="flex flex-col gap-4" noValidate onSubmit={form.handleSubmit(onSubmit)}>
          <AuthField
            id="name"
            label={t("name")}
            autoComplete="name"
            {...(nameError ? { error: nameError } : {})}
            {...form.register("name")}
          />
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
            autoComplete="new-password"
            {...(passwordError ? { error: passwordError } : {})}
            {...form.register("password")}
          />
          {rootError ? (
            <p className="text-sm text-destructive" role="alert">
              {rootError}
            </p>
          ) : null}
          <Button type="submit" disabled={!ready || signUp.isPending}>
            {t("createAccount")}
          </Button>
          <Link href="/login" className="text-sm underline-offset-4 hover:underline">
            {t("backToSignIn")}
          </Link>
        </form>
      )}
    </AuthFrame>
  );
}
