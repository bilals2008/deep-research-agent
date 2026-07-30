import { Field as FieldPrimitive } from "@base-ui/react/field"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: InputPrimitive.Props) {
  return (
    <FieldPrimitive.Root>
      <InputPrimitive
        data-slot="input"
        className={cn(
          "flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-sm transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    </FieldPrimitive.Root>
  )
}

export { Input }
