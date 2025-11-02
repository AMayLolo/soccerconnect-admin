import { cn } from "@/lib/utils"
import * as React from "react"

export function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted", className)}
      {...props}
    >
      {children}
    </div>
  )
}

export function AvatarImage({ className, src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) {
  return <img className={cn("h-full w-full object-cover", className)} src={src} alt={alt} {...props} />
}

export function AvatarFallback({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span className={cn("inline-block text-sm font-semibold", className)} {...props}>
      {children}
    </span>
  )
}
