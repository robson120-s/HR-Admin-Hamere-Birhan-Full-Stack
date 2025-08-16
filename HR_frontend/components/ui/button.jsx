import * as React from "react"
// import { cn } from "/lib/utils"

import { cn } from "../../lib/utils"

export const Button = React.forwardRef(({ className, ...props }, ref) => (
  <button ref={ref} className={cn("px-4 py-2 bg-blue-600 text-white rounded", className)} {...props} />
))
Button.displayName = "Button"
