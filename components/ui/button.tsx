import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

const buttonVariants = (
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "primary-pill" | "secondary-pill" | "dark-utility" | "pearl-capsule" | "store-hero" | "text-link",
  size?: "default" | "sm" | "lg" | "icon"
) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
  
  const variants: Record<string, string> = {
    // Apple Design System variants
    "primary-pill": "bg-blue-primary text-white rounded-full px-6 py-2.5 text-button-utility hover:bg-blue-primary-focus active:scale-95",
    "secondary-pill": "bg-transparent border border-blue-primary text-blue-primary rounded-full px-6 py-2.5 text-button-utility hover:bg-blue-primary/5",
    "dark-utility": "bg-ink text-white rounded-lg px-4 py-2 text-button-utility hover:bg-ink/90",
    "pearl-capsule": "bg-surface-pearl border border-neutral-200 text-ink rounded-full px-5 py-2.5 text-body hover:bg-neutral-100",
    "store-hero": "bg-blue-primary text-white rounded-full px-7 py-3 text-button-large hover:bg-blue-primary-focus active:scale-95",
    "text-link": "text-blue-primary underline-offset-2 hover:text-blue-primary-focus text-body",
    
    // Legacy variants for compatibility
    default: "bg-ink text-white hover:bg-ink/90",
    destructive: "bg-error text-white hover:bg-error/90",
    outline: "border border-neutral-200 bg-white hover:bg-neutral-50 text-ink",
    secondary: "bg-canvas-parchment text-ink hover:bg-neutral-200",
    ghost: "hover:bg-neutral-100 text-ink",
    link: "text-blue-primary underline-offset-2 hover:underline",
  }

  const sizes: Record<string, string> = {
    default: "h-10 px-4 py-2",
    sm: "h-9 rounded-md px-3",
    lg: "h-11 rounded-md px-8",
    icon: "h-10 w-10",
  }

  return cn(baseStyles, variants[variant || "default"], sizes[size || "default"])
}

const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "primary-pill" | "secondary-pill" | "dark-utility" | "pearl-capsule" | "store-hero" | "text-link"
    size?: "default" | "sm" | "lg" | "icon"
    asChild?: boolean
  }
>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants(variant, size), className)}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
