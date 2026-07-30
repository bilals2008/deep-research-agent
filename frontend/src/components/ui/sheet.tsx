"use client"

import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Sheet({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <SheetPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </SheetPrimitive.Root>
  )
}

function SheetTrigger({
  children,
  ...props
}: SheetPrimitive.Trigger.Props) {
  return (
    <SheetPrimitive.Trigger {...props}>
      {children}
    </SheetPrimitive.Trigger>
  )
}

function SheetBackdrop({
  className,
  ...props
}: SheetPrimitive.Backdrop.Props) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Backdrop
        className={cn(
          "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-all duration-200 data-closed:opacity-0",
          className
        )}
        {...props}
      />
    </SheetPrimitive.Portal>
  )
}

function SheetPopup({
  className,
  children,
  side = "right",
  ...props
}: SheetPrimitive.Popup.Props & { side?: "left" | "right" }) {
  return (
    <SheetPrimitive.Portal>
      <SheetPrimitive.Popup
        className={cn(
          "fixed z-50 gap-4 border bg-card p-6 shadow-xl transition-all duration-200",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 max-w-sm border-r data-closed:translate-x-full",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 max-w-sm border-l data-closed:-translate-x-full",
          className
        )}
        {...props}
      >
        {children}
      </SheetPrimitive.Popup>
    </SheetPrimitive.Portal>
  )
}

function SheetClose({
  className,
  ...props
}: SheetPrimitive.Close.Props) {
  return (
    <SheetPrimitive.Close
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
      {...props}
    >
      <X className="size-4" />
      <span className="sr-only">Close</span>
    </SheetPrimitive.Close>
  )
}

function SheetHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-1.5", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="sheet-title"
      className={cn("text-lg font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetBackdrop,
  SheetPopup,
  SheetClose,
  SheetHeader,
  SheetTitle,
  SheetDescription,
}
