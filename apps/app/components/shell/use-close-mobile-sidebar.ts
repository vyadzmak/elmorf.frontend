"use client";

import { useSidebar } from "@elmorf/ui/components/ui/sidebar";

export function useCloseMobileSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();

  return () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };
}
