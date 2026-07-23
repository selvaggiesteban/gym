import React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    (<input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-[12px] bg-[var(--color-neu-surface)] px-3 py-2 text-sm",
        "shadow-[inset_4px_4px_8px_#c5cad1,inset_-4px_-4px_8px_#ffffff]",
        "border-none outline-none",
        "placeholder:text-neutral-400",
        "focus-visible:shadow-[inset_3px_3px_6px_#c5cad1,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_var(--color-brand-accent)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props} />)
  );
})
Input.displayName = "Input"

export { Input }
