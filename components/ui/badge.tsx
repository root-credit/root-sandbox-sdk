import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "secondary" | "destructive" | "outline" | "settled" | "pending" | "failed"
  }
>(({ className, variant = "default", ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex items-center rounded-full px-3 py-1 text-caption-strong transition-colors focus:outline-none",
      {
        // Apple defaults
        "bg-surface-pearl text-body-muted border border-neutral-200": variant === "default",
        "bg-canvas-parchment text-ink border border-neutral-300": variant === "secondary",
        
        // Status variants
        "bg-success/10 text-success border border-success/20": variant === "settled",
        "bg-pending/10 text-pending border border-pending/20": variant === "pending",
        "bg-error/10 text-error border border-error/20": variant === "failed",
        
        // Legacy
        "border-transparent bg-ink text-white hover:bg-ink/80": variant === "destructive",
        "text-ink border border-neutral-200": variant === "outline",
      },
      className
    )}
    {...props}
  />
))
Badge.displayName = "Badge"

export { Badge }
