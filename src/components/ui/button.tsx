import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-sm",
        destructive: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
        outline: "border border-slate-200 bg-white hover:bg-slate-50 text-slate-700",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200",
        ghost: "hover:bg-slate-100 text-slate-700",
        link: "text-green-600 underline-offset-4 hover:underline",
        success: "bg-green-50 text-green-700 border border-green-200 hover:bg-green-100",
        warning: "bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100",
        danger: "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-xl px-8 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
