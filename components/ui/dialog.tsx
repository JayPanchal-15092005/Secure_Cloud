"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  backdropClassName?: string;
  classNames?: {
    overlay?: string;
    content?: string;
  };
  children: React.ReactNode;
}

export function Dialog({
  isOpen,
  onOpenChange,
  backdropClassName,
  classNames,
  children,
}: DialogProps) {
  return (
    <RadixDialog.Root open={isOpen} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm",
            classNames?.overlay,
            backdropClassName
          )}
        />
        <RadixDialog.Content
          className={cn(
            "fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg",
            classNames?.content
          )}
        >
          {children}
          <RadixDialog.Close className="absolute top-4 right-4 opacity-70 hover:opacity-100 transition-opacity">
            <XIcon />
            <span className="sr-only">Close</span>
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

export function DialogHeader(
  props: React.ComponentProps<"div">
) {
  return (
    <div
      data-slot="dialog-header"
      className="flex flex-col gap-2 text-center sm:text-left"
      {...props}
    />
  );
}

export function DialogBody(
  props: React.ComponentProps<"div">
) {
  return (
    <div
      data-slot="dialog-body"
      className="py-4 text-sm text-muted-foreground"
      {...props}
    />
  );
}

export function DialogFooter(
  props: React.ComponentProps<"div">
) {
  return (
    <div
      data-slot="dialog-footer"
      className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"
      {...props}
    />
  );
}

export function DialogTitle(
  props: React.ComponentProps<typeof RadixDialog.Title>
) {
  return (
    <RadixDialog.Title
      data-slot="dialog-title"
      className="text-lg font-semibold"
      {...props}
    />
  );
}

export function DialogDescription(
  props: React.ComponentProps<typeof RadixDialog.Description>
) {
  return (
    <RadixDialog.Description
      data-slot="dialog-description"
      className="text-sm text-muted-foreground"
      {...props}
    />
  );
}


