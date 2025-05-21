import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  isInvalid?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", startContent, endContent, isInvalid, errorMessage, ...props }, ref) => {
    return (
      <div className="w-full">
        {/* Input wrapper with optional start/end content */}
        <div
          className={cn(
            "flex h-9 w-full items-center rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow]",
            "bg-transparent text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground",
            "focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring",
            "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            isInvalid
              ? "border-destructive ring-destructive/30 dark:ring-destructive/40"
              : "border-input dark:bg-input/30",
            className
          )}
        >
          {startContent && <span className="mr-2 text-muted-foreground">{startContent}</span>}
          <input
            ref={ref}
            type={type}
            className="flex-1 bg-transparent outline-none disabled:opacity-50"
            aria-invalid={isInvalid}
            {...props}
          />
          {endContent && <span className="ml-2 text-muted-foreground">{endContent}</span>}
        </div>

        {/* Error message */}
        {isInvalid && errorMessage && (
          <p className="mt-1 text-sm text-destructive">{errorMessage}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
