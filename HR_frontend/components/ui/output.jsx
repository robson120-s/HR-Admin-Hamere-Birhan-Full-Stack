// components/ui/output.jsx
"use client";

import * as React from "react";
import { useState } from "react";
import { cn } from "../../lib/utils"; // Assuming you have this helper for merging classes
import { Check, Clipboard } from "lucide-react";
import toast from "react-hot-toast"; // Assuming you use react-hot-toast for notifications

// We use React.forwardRef to allow this component to receive a ref if needed
const Output = React.forwardRef(({ className, children, ...props }, ref) => {
  const [hasCopied, setHasCopied] = useState(false);

  const handleCopy = () => {
    if (typeof children === 'string') {
      navigator.clipboard.writeText(children);
      setHasCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => {
        setHasCopied(false);
      }, 2000); // Reset icon after 2 seconds
    }
  };

  return (
    <div
      ref={ref}
      // The 'group' class is for the hover effect on the copy button
      className={cn(
        "relative w-full rounded-lg border bg-slate-50 p-4 font-mono text-sm",
        "whitespace-pre-wrap break-words", // Handles long lines and preserves whitespace
        "overflow-auto", // Adds scrollbars if content is too large
        "dark:bg-slate-800 dark:border-slate-700",
        className
      )}
      {...props}
    >
      {/* The copy button appears on hover */}
      <button
        onClick={handleCopy}
        className="absolute top-2 right-2 p-2 rounded-md
                   bg-white/50 dark:bg-slate-700/50
                   text-slate-500 hover:text-slate-800 dark:hover:text-slate-200
                   backdrop-blur-sm
                   opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Copy to clipboard"
      >
        {hasCopied ? (
          <Check className="h-4 w-4 text-green-500" />
        ) : (
          <Clipboard className="h-4 w-4" />
        )}
      </button>

      {children}
    </div>
  );
});
Output.displayName = "Output";

export { Output };