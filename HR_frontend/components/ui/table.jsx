// components/ui/table.jsx
import * as React from "react";
import { cn } from "../../lib/utils"; // Assuming you have a 'cn' utility for merging classes. If not, you can remove it.

// --- Main Table Wrapper ---
const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table
      ref={ref}
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  </div>
));
Table.displayName = "Table";

// --- Table Header Section (thead) ---
const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

// --- Table Body Section (tbody) ---
const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));
TableBody.displayName = "TableBody";

// --- Table Row (tr) ---
const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted",
      "dark:hover:bg-slate-700/50",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

// --- ✅ CORRECTED: Table Head Cell (th) ---
const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
      "text-xs text-gray-500 dark:text-gray-300 uppercase tracking-wider bg-slate-50 dark:bg-gray-700/50",
      className
    )}
    {...props}
  />
));
TableHead.displayName = "TableHead";

// --- ✅ CORRECTED: Table Data Cell (td) ---
const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn("p-4 align-middle [&:has([role=checkbox])]:pr-0", className)}
    {...props}
  />
));
TableCell.displayName = "TableCell";

// --- You can add these for completeness if you need them ---
const TableCaption = React.forwardRef(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn("mt-4 text-sm text-muted-foreground", className)}
    {...props}
  />
));
TableCaption.displayName = "TableCaption";


// --- ✅ CORRECTED: Export everything correctly ---
export {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
};