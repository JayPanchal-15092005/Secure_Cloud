// "use client";

// import * as React from "react";
// import * as RadixDialog from "@radix-ui/react-dialog";
// import { XIcon } from "lucide-react";
// import { cn } from "@/lib/utils";

// export interface DialogProps {
//   isOpen: boolean;
//   onOpenChange: (open: boolean) => void;
//   backdropClassName?: string;
//   classNames?: {
//     overlay?: string;
//     content?: string;
//   };
//   children: React.ReactNode;
// }

// export function Dialog({
//   isOpen,
//   onOpenChange,
//   backdropClassName,
//   classNames,
//   children,
// }: DialogProps) {
//   return (
//     <RadixDialog.Root open={isOpen} onOpenChange={onOpenChange}>
//       <RadixDialog.Portal>
//         <RadixDialog.Overlay
//           className={cn(
//             "fixed inset-0 bg-black/50 backdrop-blur-sm",
//             classNames?.overlay,
//             backdropClassName
//           )}
//         />

//         <RadixDialog.Content
//           className={cn(
//             "fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg",
//             classNames?.content
//           )}
//         >
//           {children}

//           <RadixDialog.Close className="absolute top-4 right-4 opacity-70 hover:opacity-100 transition-opacity">
//             <XIcon />
//             <span className="sr-only">Close</span>
//           </RadixDialog.Close>
//         </RadixDialog.Content>
//       </RadixDialog.Portal>
//     </RadixDialog.Root>
//   );
// }

// export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
//   return (
//     <div
//       data-slot="dialog-header"
//       className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
//       {...props}
//     />
//   );
// }

// export function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
//   return (
//     <div
//       data-slot="dialog-body"
//       className={cn("py-4 text-sm text-muted-foreground", className)}
//       {...props}
//     />
//   );
// }

// export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
//   return (
//     <div
//       data-slot="dialog-footer"
//       className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
//       {...props}
//     />
//   );
// }

// // export function DialogContent({
// //    className,
// //   children,
// //   backdrop,
// //   ...props
// // }: React.ComponentProps<typeof RadixDialog.Con> & {
// //   backdrop?: string;
// // }){
// // }

// export function DialogTitle({
//   className,
//   ...props
// }: React.ComponentProps<typeof RadixDialog.Title>) {
//   return (
//     <RadixDialog.Title data-slot="dialog-title" className={cn("text-lg font-semibold", className)} {...props} />
//   );
// }

// export function DialogDescription({
//   className,
//   ...props
// }: React.ComponentProps<typeof RadixDialog.Description>) {
//   return (
//     <RadixDialog.Description
//       data-slot="dialog-description"
//       className={cn("text-sm text-muted-foreground", className)}
//       {...props}
//     />
//   );
// }

"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// Main Dialog wrapper component
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

// ✅ NEW: DialogContent component
export function DialogContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof RadixDialog.Content>) {
  return (
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
      <RadixDialog.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg bg-background p-6 shadow-lg",
          className
        )}
        {...props}
      >
        {children}
        <RadixDialog.Close className="absolute top-4 right-4 opacity-70 hover:opacity-100 transition-opacity">
          <XIcon />
          <span className="sr-only">Close</span>
        </RadixDialog.Close>
      </RadixDialog.Content>
    </RadixDialog.Portal>
  );
}

// Other dialog subcomponents
export function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

export function DialogBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-body"
      className={cn("py-4 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof RadixDialog.Title>) {
  return (
    <RadixDialog.Title
      data-slot="dialog-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof RadixDialog.Description>) {
  return (
    <RadixDialog.Description
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

