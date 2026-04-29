import * as React from "react"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "light" | "parchment" | "dark-1" | "dark-2" | "dark-3" | "utility"
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "light", ...props }, ref) => {
    const variants: Record<string, string> = {
      light: "bg-canvas text-ink",
      parchment: "bg-canvas-parchment text-ink",
      "dark-1": "bg-surface-dark-1 text-body-on-dark",
      "dark-2": "bg-surface-dark-2 text-body-on-dark",
      "dark-3": "bg-surface-dark-3 text-body-on-dark",
      utility: "bg-canvas border border-neutral-200 rounded-lg text-ink",
    }
    
    const baseClass = variant === "utility" ? "shadow-none" : ""
    
    return (
      <div
        ref={ref}
        className={cn(
          "transition-all",
          variants[variant],
          baseClass,
          className
        )}
        {...props}
      />
    )
  }
)
Card.displayName = "Card"

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-display-md", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-caption text-body-muted", className)}
    {...props}
  />
))
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
