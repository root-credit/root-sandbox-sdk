import * as React from "react"
import { cn } from "@/lib/utils"

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "search-pill"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default: "flex h-10 w-full border border-neutral-200 bg-white px-3 py-2 text-body text-ink placeholder:text-body-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-lg",
      "search-pill": "flex h-11 w-full border border-neutral-200 bg-white px-5 py-3 text-body text-ink placeholder:text-body-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 rounded-full",
    }
    
    return (
      <input
        type={type}
        className={cn(variants[variant], className)}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
