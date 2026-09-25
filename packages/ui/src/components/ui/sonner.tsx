"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, toast, type ToasterProps } from "sonner"

function Toaster({ ...props }: ToasterProps) {
  const { resolvedTheme } = useTheme()

  return (
    <Sonner
      theme={resolvedTheme === "light" ? "light" : "dark"}
      className="toaster group"
      style={{ zIndex: 60 }}
      toastOptions={{
        classNames: {
          toast:
            "border border-border bg-popover text-popover-foreground shadow-lg",
          description: "text-muted-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
