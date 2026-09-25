"use client";

import { Button } from "@elmorf/ui/components/ui/button";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@elmorf/ui/components/ui/resizable";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@elmorf/ui/components/ui/sheet";
import { useIsMobile } from "@elmorf/ui/hooks/use-mobile";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";
import { useShell } from "@/components/shell/shell-context";

const widthKey = "elmorf.inspector-width";
const defaultWidth = 392;

function readInspectorWidth(): number {
  const raw = Number(window.localStorage.getItem(widthKey));
  if (!Number.isFinite(raw)) {
    return defaultWidth;
  }

  return Math.min(520, Math.max(320, raw));
}

function InspectorBody({
  title,
  detail,
  content,
  onClose,
}: {
  title: string;
  detail?: string;
  content?: ReactNode;
  onClose: () => void;
}) {
  const t = useTranslations("Shell");

  return (
    <aside className="flex h-full min-h-0 flex-col bg-[var(--elmorf-inspector)]">
      <header className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <h2 className="truncate text-sm font-medium">{title}</h2>
        <Button type="button" variant="ghost" size="sm" onClick={onClose}>
          {t("inspectorClose")}
        </Button>
      </header>
      <div className="min-h-0 flex-1 overflow-auto">
        {content ?? <p className="px-4 py-4 text-sm text-muted-foreground">{detail}</p>}
      </div>
    </aside>
  );
}

export function InspectorHost({ children }: { children: React.ReactNode }) {
  const { inspector, closeInspector } = useShell();
  const isMobile = useIsMobile();
  const t = useTranslations("Shell");
  const dismiss = () => {
    if (inspector?.onClose) {
      inspector.onClose();
      return;
    }

    closeInspector();
  };

  if (!inspector) {
    return <div className="h-full min-h-0">{children}</div>;
  }

  if (isMobile) {
    return (
      <div className="h-full min-h-0">
        {children}
        <Sheet
          open
          onOpenChange={(open) => {
            if (!open) {
              dismiss();
            }
          }}
        >
          <SheetContent
            side="right"
            showCloseButton={false}
            className="w-[min(100%,392px)] bg-[var(--elmorf-inspector)] sm:max-w-[392px]"
          >
            <SheetHeader className="sr-only">
              <SheetTitle>{inspector.title}</SheetTitle>
            </SheetHeader>
            <InspectorBody
              title={inspector.title}
              onClose={dismiss}
              {...(inspector.detail === undefined ? {} : { detail: inspector.detail })}
              {...(inspector.content === undefined ? {} : { content: inspector.content })}
            />
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <ResizablePanelGroup orientation="horizontal" className="h-full min-h-0">
      <ResizablePanel minSize={560} className="min-h-0">
        {children}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel
        id="inspector"
        defaultSize={readInspectorWidth()}
        minSize={320}
        maxSize={520}
        groupResizeBehavior="preserve-pixel-size"
        className="min-h-0"
        onResize={(size) => {
          window.localStorage.setItem(widthKey, String(Math.round(size.inPixels)));
        }}
      >
        <InspectorBody
          title={inspector.title || t("inspectorTitle")}
          onClose={dismiss}
          {...(inspector.detail === undefined ? {} : { detail: inspector.detail })}
          {...(inspector.content === undefined ? {} : { content: inspector.content })}
        />
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
