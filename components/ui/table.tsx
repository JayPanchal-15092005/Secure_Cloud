"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TableColumnProps extends React.HTMLAttributes<HTMLTableCellElement> {
  as?: "th" | "td";
  width?: string | number; // Add the width prop
}

interface TableProps extends React.ComponentProps<"table"> {
  classNames?: {
    base?: string;
    th?: string;
    td?: string;
    tr?: string;
  };
  isStriped?: boolean;
  selectionMode?: "single" | "multiple" | "none";
}

const TableContext = React.createContext<Partial<TableProps>>({});

function Table({
  className,
  classNames = {},
  isStriped = false,
  selectionMode = "none",
  children,
  ...props
}: TableProps) {
  return (
    <TableContext.Provider value={{ classNames, isStriped, selectionMode }}>
      <div className="relative w-full overflow-x-auto">
        <table className={cn("w-full caption-bottom text-sm", classNames.base, className)} {...props}>
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return <thead className={cn("[&_tr]:border-b", className)} {...props} />;
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props} />;
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot className={cn("bg-muted/50 border-t font-medium [&>tr]:last:border-b-0", className)} {...props} />
  );
}

function TableRow({
  className,
  ...props
}: React.ComponentProps<"tr"> & { rowIndex?: number }) {
  const { isStriped, classNames } = React.useContext(TableContext);
  const rowIndex = (props as any)["data-index"] ?? 0;

  return (
    <tr
      className={cn(
        "border-b transition-colors",
        isStriped && rowIndex % 2 !== 0 && "bg-muted/20",
        classNames?.tr,
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  const { classNames } = React.useContext(TableContext);
  return (
    <th
      className={cn(
        "text-foreground h-10 px-4 text-left align-middle font-medium whitespace-nowrap",
        classNames?.th,
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  const { classNames } = React.useContext(TableContext);
  return (
    <td
      className={cn(
        "px-4 py-2 align-middle whitespace-nowrap",
        classNames?.td,
        className
      )}
      {...props}
    />
  );
}

function TableCaption({ className, ...props }: React.ComponentProps<"caption">) {
  return (
    <caption className={cn("text-muted-foreground mt-4 text-sm", className)} {...props} />
  );
}

function TableColumn({
  as = "th",
  className,
  children,
  width, // Destructure the width prop
  ...props
}: TableColumnProps) {
  const Component = as;

  const style = width ? { width } : {}; // Create a style object if width is provided

  return (
    <Component
      className={cn("px-4 py-2 text-left align-middle", className)}
      style={style} // Apply the style
      {...props}
    >
      {children}
    </Component>
  );
}



export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  TableColumn,
};
