"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const touchButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-lg px-8 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
      touch: {
        default: "",
        large: "min-h-[44px] min-w-[44px] touch-manipulation",
        xl: "min-h-[48px] min-w-[48px] touch-manipulation",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      touch: "large",
    },
  }
)

export interface TouchButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof touchButtonVariants> {
  asChild?: boolean
  haptic?: boolean
}

const TouchButton = React.forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ className, variant, size, touch, asChild = false, haptic = true, ...props }, ref) => {
    const [isPressed, setIsPressed] = React.useState(false)

    const handleTouchStart = (e: React.TouchEvent<HTMLButtonElement>) => {
      setIsPressed(true)

      // Haptic feedback on supported devices
      if (haptic && 'vibrate' in navigator) {
        navigator.vibrate(10)
      }

      props.onTouchStart?.(e)
    }

    const handleTouchEnd = (e: React.TouchEvent<HTMLButtonElement>) => {
      setIsPressed(false)
      props.onTouchEnd?.(e)
    }

    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(
          touchButtonVariants({ variant, size, touch, className }),
          isPressed && "scale-95 transition-transform duration-75"
        )}
        ref={ref}
        {...props}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      />
    )
  }
)
TouchButton.displayName = "TouchButton"

export { TouchButton, touchButtonVariants }