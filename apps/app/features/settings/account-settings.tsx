"use client";

import { projectKeys, sessionKeys, sessionOptions } from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useMockReady } from "@/components/app-providers";
import { SettingRow, SettingsSection } from "@/features/settings/settings-section";
import { useApiClient } from "@/lib/use-api";

export function ProfileSettings() {
  const t = useTranslations("Settings");
  const ready = useMockReady();
  const api = useApiClient();
  const sessionQuery = useQuery({
    ...sessionOptions(api),
    enabled: ready,
  });
  const session = sessionQuery.data;
  const signOutLabel = useTranslations("Foundation")("signOut");
  const router = useRouter();
  const queryClient = useQueryClient();
  const signOut = useMutation({
    mutationFn: () => api.auth.signOut(),
    onSuccess: () => {
      queryClient.setQueryData(sessionKeys.current, null);
      queryClient.removeQueries({ queryKey: projectKeys.all });
      router.replace("/login");
    },
  });

  return (
    <SettingsSection title={t("profileTitle")} description={t("profileDescription")}>
      {sessionQuery.isPending ? (
        <p className="text-sm text-muted-foreground">{t("loading")}</p>
      ) : sessionQuery.isError ? (
        <p className="text-sm text-destructive">{t("loadError")}</p>
      ) : session ? (
        <>
          <SettingRow label={t("profileName")}>
            <p className="text-sm">{session.user.name}</p>
          </SettingRow>
          <SettingRow label={t("profileEmail")}>
            <p className="text-sm">{session.user.email}</p>
          </SettingRow>
          <Button
            type="button"
            variant="outline"
            className="w-fit"
            disabled={signOut.isPending}
            onClick={() => {
              signOut.mutate();
            }}
          >
            {signOutLabel}
          </Button>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">{t("profileSignedOut")}</p>
      )}
    </SettingsSection>
  );
}

export function SecuritySettings() {
  const t = useTranslations("Settings");
  return (
    <SettingsSection title={t("securityTitle")} description={t("securityDescription")}>
      <p className="text-sm text-muted-foreground">{t("securityEmpty")}</p>
    </SettingsSection>
  );
}
