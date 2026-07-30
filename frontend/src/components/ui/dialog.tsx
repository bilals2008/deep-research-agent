"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  )
}

function DialogTrigger({
  children,
  ...props
}: DialogPrimitive.Trigger.Props) {
  return (
    <DialogPrimitive.Trigger {...props}>
      {children}
    </DialogPrimitive.Trigger>
  )
}

function DialogPortal({
  children,
  ...props
}: DialogPrimitive.Portal.Props) {
  return (
    <DialogPrimitive.Portal {...props}>
      {children}
    </DialogPrimitive.Portal>
  )
}

function DialogBackdrop({
  className,
  ...props
}: DialogPrimitive.Backdrop.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Backdrop
        className={cn(
          "fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-200 data-closed:opacity-0",
          className
        )}
        {...props}
      />
    </DialogPrimitive.Portal>
  )
}

function DialogPopup({
  className,
  children,
  ...props
}: DialogPrimitive.Popup.Props) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Popup
        className={cn(
          "fixed left-1/2 top-1/2 z-50 max-h-[85vh] w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-card p-6 shadow-xl transition-all duration-200 data-closed:scale-95 data-closed:opacity-0",
          className
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Popup>
    </DialogPrimitive.Portal>
  )
}

function DialogClose({
  className,
  ...props
}: DialogPrimitive.Close.Props) {
  return (
    <DialogPrimitive.Close
      className={cn(
        "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
        className
      )}
      {...props}
    >
      <X className="size-4" />
      <span className="sr-only">Close</span>
    </DialogPrimitive.Close>
  )
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<"h2">) {
  return (
    <h2
      data-slot="dialog-title"
      className={cn("text-lg font-semibold leading-none tracking-tight", className)}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="dialog-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogPortal,
  DialogBackdrop,
  DialogPopup,
  DialogTrigger,
  DialogClose,
  DialogTitle,
  DialogDescription,
}
