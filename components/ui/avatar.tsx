"use client"

import * as React from "react"
import * as AvatarPrimitive from "@radix-ui/react-avatar"
import { cn } from "@/lib/utils"

export interface AvatarProps
  extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  src?: string
  fallback?: React.ReactNode
  name?: string
  size?: "sm" | "md" | "lg"
  className?: string
  imageClassName?: string
  fallbackClassName?: string
}

const sizeMap = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
}

const Avatar = React.forwardRef<
  React.ElementRef<typeof AvatarPrimitive.Root>,
  AvatarProps
>(
  (
    {
      src,
      fallback,
      name,
      size = "md",
      className,
      imageClassName,
      fallbackClassName,
      ...props
    },
    ref
  ) => {
    return (
      <AvatarPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex shrink-0 overflow-hidden rounded-full",
          sizeMap[size],
          className
        )}
        {...props}
      >
        {src && (
          <AvatarPrimitive.Image
            src={src}
            alt={name}
            className={cn("aspect-square size-full", imageClassName)}
          />
        )}
        <AvatarPrimitive.Fallback
          className={cn(
            "bg-muted flex size-full items-center justify-center rounded-full text-xs",
            fallbackClassName
          )}
        >
          {fallback || (name ? name[0] : "👤")}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
    )
  }
)

Avatar.displayName = "Avatar"

export { Avatar }
