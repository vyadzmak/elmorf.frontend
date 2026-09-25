"use client";

import type { ApiKey, ApiKeyCreated } from "@elmorf/domain";
import { apiKeyListOptions, projectOptions, settingsKeys } from "@elmorf/api-client";
import { Button } from "@elmorf/ui/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@elmorf/ui/components/ui/dialog";
import { Input } from "@elmorf/ui/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@elmorf/ui/components/ui/alert-dialog";
import { toast } from "@elmorf/ui/components/ui/sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { useMockReady } from "@/components/app-providers";
import { SettingRow, SettingsSection } from "@/features/settings/settings-section";
import { useApiClient } from "@/lib/use-api";

const emptyKeys: ApiKey[] = [];

export function ApiKeysSection({ projectId }: { projectId: string }) {
  const t = useTranslations("Settings");
  const format = useFormatter();
  const ready = useMockReady();
  const api = useApiClient();
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [created, setCreated] = useState<ApiKeyCreated | null>(null);
  const [revokeKey, setRevokeKey] = useState<ApiKey | null>(null);
  const [revokeOpen, setRevokeOpen] = useState(false);
  const projectQuery = useQuery({
    ...projectOptions(api, projectId),
    enabled: ready,
  });
  const keysQuery = useQuery({
    ...apiKeyListOptions(api, projectId),
    enabled: ready,
  });
  const canManage = projectQuery.data?.capabilities.canManageApiKeys ?? false;
  const keys = keysQuery.data ?? emptyKeys;

  const create = useMutation({
    mutationFn: () => api.apiKeys.create(projectId, { name: name.trim() }),
    onSuccess: async (key) => {
      setCreated(key);
      setName("");
      await queryClient.invalidateQueries({ queryKey: settingsKeys.apiKeys(projectId) });
    },
    onError: () => {
      toast.error(t("keyCreateError"));
    },
  });

  const revoke = useMutation({
    mutationFn: (keyId: string) => api.apiKeys.revoke(projectId, keyId),
    onSuccess: async () => {
      setRevokeOpen(false);
      toast.success(t("keyRevoked"));
      await queryClient.invalidateQueries({ queryKey: settingsKeys.apiKeys(projectId) });
    },
    onError: () => {
      toast.error(t("keyRevokeError"));
    },
  });

  function closeCreate(next: boolean) {
    if (!next && created) {
      return;
    }
    if (!next) {
      setName("");
      setCreated(null);
    }
    setCreateOpen(next);
  }

  return (
    <SettingsSection title={t("apiKeysTitle")} description={t("apiKeysDescription")}>
      <SettingRow
        label={t("keyList")}
        {...(canManage ? {} : { description: t("keyReadOnly") })}
      >
        {keysQuery.isPending ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : keysQuery.isError ? (
          <p className="text-sm text-destructive">{t("keyLoadError")}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3 font-medium">{t("columnName")}</th>
                  <th className="py-2 pr-3 font-medium">{t("columnPrefix")}</th>
                  <th className="py-2 pr-3 font-medium">{t("columnCreated")}</th>
                  <th className="py-2 pr-3 font-medium">{t("columnLastUsed")}</th>
                  <th className="py-2 font-medium">
                    <span className="sr-only">{t("columnActions")}</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {keys.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-3 text-muted-foreground">
                      {t("keyEmpty")}
                    </td>
                  </tr>
                ) : (
                  keys.map((key) => (
                    <tr key={key.id} className="border-t border-border">
                      <td className="py-2 pr-3">{key.name}</td>
                      <td className="py-2 pr-3 font-mono text-xs">{key.prefix}</td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {format.dateTime(new Date(key.createdAt), { dateStyle: "medium" })}
                      </td>
                      <td className="py-2 pr-3 text-muted-foreground">
                        {key.lastUsedAt
                          ? format.dateTime(new Date(key.lastUsedAt), { dateStyle: "medium" })
                          : t("emptyValue")}
                      </td>
                      <td className="py-2 text-right">
                        {canManage ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRevokeKey(key);
                              setRevokeOpen(true);
                            }}
                          >
                            {t("revoke")}
                          </Button>
                        ) : null}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        {canManage ? (
          <Button
            className="w-fit"
            onClick={() => {
              setCreated(null);
              setName("");
              setCreateOpen(true);
            }}
          >
            {t("createKey")}
          </Button>
        ) : null}
      </SettingRow>
      <Dialog open={createOpen} onOpenChange={closeCreate}>
        <DialogContent closeLabel={t("close")}>
          <DialogHeader>
            <DialogTitle>{created ? t("secretTitle") : t("createKey")}</DialogTitle>
            <DialogDescription>
              {created ? t("secretDescription") : t("createKeyDescription")}
            </DialogDescription>
          </DialogHeader>
          {created ? (
            <p className="break-all rounded-md border border-border bg-muted px-3 py-2 font-mono text-xs">
              {created.secret}
            </p>
          ) : (
            <Input
              value={name}
              maxLength={80}
              aria-label={t("keyName")}
              placeholder={t("keyName")}
              onChange={(event) => {
                setName(event.target.value);
              }}
            />
          )}
          <DialogFooter>
            {created ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    void navigator.clipboard.writeText(created.secret).then(
                      () => {
                        toast.success(t("copied"));
                      },
                      () => {
                        toast.error(t("copyError"));
                      },
                    );
                  }}
                >
                  {t("copy")}
                </Button>
                <Button
                  onClick={() => {
                    setCreated(null);
                    setCreateOpen(false);
                  }}
                >
                  {t("acknowledge")}
                </Button>
              </>
            ) : (
              <Button
                disabled={name.trim().length === 0 || create.isPending}
                onClick={() => {
                  create.mutate();
                }}
              >
                {t("createKey")}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <AlertDialog open={revokeOpen} onOpenChange={setRevokeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("revokeTitle", { name: revokeKey?.name ?? "" })}</AlertDialogTitle>
            <AlertDialogDescription>{t("revokeDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("cancel")}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={revoke.isPending || revokeKey === null}
              onClick={() => {
                if (revokeKey) {
                  revoke.mutate(revokeKey.id);
                }
              }}
            >
              {t("revokeConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SettingsSection>
  );
}
