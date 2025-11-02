import { cn } from "@/lib/utils"
import * as React from "react"

export function Badge({ className, children, variant = "default", ...props }: React.HTMLAttributes<HTMLSpanElement> & { variant?: "default" | "secondary" | "destructive" }) {
  const base = "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs"
  const variants: Record<string, string> = {
    default: "bg-muted text-foreground",
    secondary: "bg-muted/60 text-muted-foreground",
    destructive: "bg-destructive/20 text-destructive",
  }

  return (
    <span className={cn(base, variants[variant] ?? variants.default, className)} {...props}>
      {children}
    </span>
  )
}
