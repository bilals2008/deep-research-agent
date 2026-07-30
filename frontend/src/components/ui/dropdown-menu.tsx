"use client"

import * as React from "react"
import { Menu as DropdownMenuPrimitive } from "@base-ui/react/menu"

import { cn } from "@/lib/utils"

function DropdownMenu({
  children,
  ...props
}: DropdownMenuPrimitive.Root.Props) {
  return (
    <DropdownMenuPrimitive.Root {...props}>
      {children}
    </DropdownMenuPrimitive.Root>
  )
}

function DropdownMenuTrigger({
  children,
  ...props
}: DropdownMenuPrimitive.Trigger.Props) {
  return (
    <DropdownMenuPrimitive.Trigger {...props}>
      {children}
    </DropdownMenuPrimitive.Trigger>
  )
}

function DropdownMenuPopup({
  className,
  ...props
}: DropdownMenuPrimitive.Popup.Props) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Popup
        className={cn(
          "z-50 min-w-[8rem] overflow-hidden rounded-xl border bg-card p-1 shadow-lg transition-all data-closed:scale-95 data-closed:opacity-0",
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  )
}

function DropdownMenuItem({
  className,
  ...props
}: DropdownMenuPrimitive.Item.Props) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        "relative flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 text-sm outline-none select-none transition-colors hover:bg-muted focus-visible:bg-muted data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function DropdownMenuSeparator({
  className,
  ...props
}: DropdownMenuPrimitive.Separator.Props) {
  return (
    <DropdownMenuPrimitive.Separator
      className={cn("-mx-1 my-1 h-px bg-border", className)}
      {...props}
    />
  )
}

function DropdownMenuLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("px-2 py-1.5 text-sm font-semibold", className)}
      {...props}
    />
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuPopup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
}
