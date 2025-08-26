// components/ui/loader.jsx
"use client";

import * as React from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "../../lib/utils"; // Assuming you have this helper for merging classes

const Loader = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <LoaderCircle
      ref={ref}
      className={cn("h-8 w-8 animate-spin text-indigo-500", className)} // Default size and color
      {...props}
    />
  );
});
Loader.displayName = "Loader";

export { Loader };