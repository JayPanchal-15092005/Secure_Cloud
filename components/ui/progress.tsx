"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";

type Size = "sm" | "md" | "lg";

interface ExtendedProgressProps extends React.ComponentProps<typeof ProgressPrimitive.Root> {
  value?: number;
  size?: Size;
  showValueLabel?: boolean;
}

const sizeClasses: Record<Size, string> = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

function Progress({
  className,
  value = 0,
  size = "md",
  showValueLabel = false,
  ...props
}: ExtendedProgressProps) {
  return (
    <div className="w-full relative">
      <ProgressPrimitive.Root
        data-slot="progress"
        className={cn(
          "bg-primary/20 overflow-hidden rounded-full",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        <ProgressPrimitive.Indicator
          data-slot="progress-indicator"
          className="bg-primary h-full w-full flex-1 transition-all"
          style={{ transform: `translateX(-${100 - value}%)` }}
        />
      </ProgressPrimitive.Root>

      {showValueLabel && (
        <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-primary-foreground">
          {Math.round(value)}%
        </span>
      )}
    </div>
  );
}

export { Progress };
