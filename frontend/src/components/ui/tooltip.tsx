"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delay = 400,
  children,
}: {
  delay?: number
  children: React.ReactNode
}) {
  return (
    <TooltipPrimitive.Provider delay={delay}>
      {children}
    </TooltipPrimitive.Provider>
  )
}

function TooltipTrigger({
  children,
  ...props
}: TooltipPrimitive.Trigger.Props) {
  return (
    <TooltipPrimitive.Trigger {...props}>
      {children}
    </TooltipPrimitive.Trigger>
  )
}

function TooltipContent({
  className,
  children,
  ...props
}: TooltipPrimitive.Popup.Props) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner>
        <TooltipPrimitive.Popup
          className={cn(
            "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md transition-all duration-150 data-closed:scale-95 data-closed:opacity-0",
            className
          )}
          {...props}
        >
          {children}
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { TooltipProvider, TooltipTrigger, TooltipContent }
