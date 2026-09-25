"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import type { ProductVisual } from "@/components/landing/product-visual";

type VisualComponent = typeof ProductVisual;

export function LazyProductVisual(
  props: React.ComponentProps<VisualComponent>,
) {
  const frame = useRef<HTMLDivElement>(null);
  const [Visual, setVisual] = useState<ComponentType<
    React.ComponentProps<VisualComponent>
  > | null>(null);

  useEffect(() => {
    const node = frame.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) {
        return;
      }
      observer.disconnect();
      void import("@/components/landing/product-visual").then((module) => {
        setVisual(() => module.ProductVisual);
      });
    });
    observer.observe(node);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={frame} className="min-h-52">
      {Visual ? <Visual {...props} /> : null}
    </div>
  );
}
