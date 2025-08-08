import * as React from "react"
import { cn } from "/lib/utils"

export const Tabs = ({ children, className }) => (
  <div className={cn("tabs-container", className)}>{children}</div>
)

export const TabsList = ({ children, className }) => (
  <div className={cn("flex space-x-2 border-b", className)}>{children}</div>
)

export const TabsTrigger = ({ children, className }) => (
  <button className={cn("px-3 py-2", className)}>{children}</button>
)

export const TabsContent = ({ children, className }) => (
  <div className={cn("p-4", className)}>{children}</div>
)
