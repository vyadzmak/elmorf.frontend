"use client";

import { Button } from "@elmorf/ui/components/ui/button";
import { useTranslations } from "next-intl";
import { createContext, useContext, useState, useSyncExternalStore } from "react";
import { Link } from "@/i18n/navigation";

const STORAGE_KEY = "elmorf.cookie-consent";
const CHANGE_EVENT = "elmorf:cookie-consent";

type Consent = "accepted" | "necessary";
type StoredConsent = Consent | "missing";

const CookieSettingsContext = createContext<(() => void) | null>(null);

function isConsent(value: string | null): value is Consent {
  return value === "accepted" || value === "necessary";
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  return () => window.removeEventListener(CHANGE_EVENT, onChange);
}

function readConsent(): StoredConsent {
  const value = window.localStorage.getItem(STORAGE_KEY);
  return isConsent(value) ? value : "missing";
}

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const stored = useSyncExternalStore(subscribe, readConsent, () => "accepted" as const);
  const open = settingsOpen || stored === "missing";

  return (
    <CookieSettingsContext.Provider value={() => setSettingsOpen(true)}>
      {children}
      {open ? (
        <CookieConsentForm
          onChoose={(value) => {
            window.localStorage.setItem(STORAGE_KEY, value);
            window.dispatchEvent(new Event(CHANGE_EVENT));
            setSettingsOpen(false);
          }}
        />
      ) : null}
    </CookieSettingsContext.Provider>
  );
}

export function CookieSettingsButton({ label }: { label: string }) {
  const openSettings = useContext(CookieSettingsContext);

  return (
    <button
      type="button"
      className="text-sm text-muted-foreground hover:text-foreground"
      onClick={() => {
        openSettings?.();
      }}
    >
      {label}
    </button>
  );
}

function CookieConsentForm({ onChoose }: { onChoose: (value: Consent) => void }) {
  const t = useTranslations("Landing");

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-[var(--elmorf-surface-1)]">
      <form
        className="mx-auto flex w-full max-w-[76rem] flex-col gap-4 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
        aria-labelledby="cookie-consent-title"
        onSubmit={(event) => {
          event.preventDefault();
          onChoose("accepted");
        }}
      >
        <div className="min-w-0">
          <h2 id="cookie-consent-title" className="text-sm font-medium">
            {t("cookieTitle")}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted-foreground">{t("cookieBody")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{t("cookieNecessaryTitle")}</span>
            {" · "}
            {t("cookieNecessaryBody")}
            {" · "}
            <Link href="/privacy" className="underline-offset-4 hover:text-foreground hover:underline">
              {t("footerPrivacy")}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onChoose("necessary");
            }}
          >
            {t("cookieNecessary")}
          </Button>
          <Button type="submit">{t("cookieAccept")}</Button>
        </div>
      </form>
    </div>
  );
}
