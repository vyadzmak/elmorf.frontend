"use client";

import { projectKeys, sessionKeys } from "@elmorf/api-client";
import type { Session } from "@elmorf/domain";
import { Button } from "@elmorf/ui/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@elmorf/ui/components/ui/dropdown-menu";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApiClient } from "@/lib/use-api";

export function UserMenu({ session }: { session: Session }) {
  const t = useTranslations("Shell");
  const signOutLabel = useTranslations("Foundation")("signOut");
  const router = useRouter();
  const api = useApiClient();
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" className="h-8 px-2 font-normal">
          {session.user.name}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>{session.user.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>{t("accountGroup")}</DropdownMenuLabel>
        <DropdownMenuItem asChild>
          <Link href="/settings/profile">{t("profile")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/security">{t("security")}</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings/appearance">{t("appearance")}</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          disabled={signOut.isPending}
          className="text-destructive focus:text-destructive"
          onSelect={() => {
            signOut.mutate();
          }}
        >
          {signOutLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
