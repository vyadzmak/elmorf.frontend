import { CookieConsentProvider } from "@/components/cookie-consent";
import { SiteFooter } from "@/components/landing/site-footer";
import { SiteHeader } from "@/components/landing/site-header";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <CookieConsentProvider>
      <div className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="mx-auto flex w-full max-w-[76rem] flex-1 flex-col px-6">
          {children}
        </main>
        <SiteFooter />
      </div>
    </CookieConsentProvider>
  );
}
